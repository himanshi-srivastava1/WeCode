import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import crypto from 'crypto';

export const createProject = asyncHandler(async (req, res, next) => {
    const { title, description, template } = req.body;

    if (!title) {
        throw new ApiError(400, "Project title is required");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const projectId = crypto.randomUUID();
    const project = await Project.create({
        projectId,
        title,
        description,
        template,
        owner: req.user._id,
        collaborators: [],
        starredBy: []
    });

    user.ownedProjects.push(project._id);
    await user.save({ validateBeforeSave: false });
    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const projects = await Project.find({
        $or: [
            { owner: userId },
            { collaborators: userId }
        ]
    })
        .sort({ lastUpdatedAt: -1 })
        .populate('owner', 'username avatar email');

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

export const addProjectToStar = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    if (project.starredBy.includes(req.user._id)) {
        throw new ApiError(400, "Project already starred");
    }
    project.starredBy.push(req.user._id);
    await project.save({ validateBeforeSave: false });
    user.starredProjects.push(project._id);
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project added to star successfully"));
});

export const removeProjectFromStar = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    if (!project.starredBy.includes(req.user._id)) {
        throw new ApiError(400, "Project is not starred");
    }
    project.starredBy = project.starredBy.filter(id => id.toString() !== req.user._id.toString());
    await project.save({ validateBeforeSave: false });
    user.starredProjects = user.starredProjects.filter(id => id.toString() !== projectId.toString());
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project removed from star successfully"));
});

export const updateProjectDescription = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { description } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (project.owner.toString() !== req.user._id.toString() && !project.collaborators.includes(req.user._id)) {
        throw new ApiError(403, "You do not have permission to edit this project");
    }

    project.description = description;
    await project.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, project, "Project description updated successfully"));
});
