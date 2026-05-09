import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import crypto from "crypto";

export const createProject = asyncHandler(async (req, res) => {
    const { name, description, template } = req.body;

    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    // Generate a unique project ID
    const projectId = crypto.randomUUID();

    const project = await Project.create({
        projectId,
        title: name,
        description,
        template,
        owner: req.user._id,
        collaborators: [],
        starredBy: []
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

export const getAllProjects = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const projects = await Project.find({
        $or: [
            { owner: userId },
            { collaborators: userId }
        ]
    }).populate('owner', 'username avatar email');

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});
