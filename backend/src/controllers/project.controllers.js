import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import crypto from 'crypto';
import { getTemplateFiles } from "../utils/templates.js";

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
        fileTree: getTemplateFiles(template),
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
        .populate('owner', 'username avatar email')
        .populate('collaborators', 'username avatar email');

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

export const deleteProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (project.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to delete this project");
    }

    if (project.collaborators.length > 0) {
        await User.updateMany(
            { _id: { $in: project.collaborators } },
            { $pull: { collaboratedProjects: projectId } }
        );
    }


    if (project.starredBy.length > 0) {
        await User.updateMany(
            { _id: { $in: project.starredBy } },
            { $pull: { starredProjects: projectId } }
        );
    }

    await Project.findByIdAndDelete(projectId);

    user.ownedProjects = user.ownedProjects.filter(id => id.toString() !== projectId.toString());
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"));
});;

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

export const updateProjectTitle = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { title } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (project.owner.toString() !== req.user._id.toString() && !project.collaborators.includes(req.user._id)) {
        throw new ApiError(403, "You do not have permission to edit this project");
    }

    project.title = title;
    await project.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, project, "Project title updated successfully"));
});

export const duplicateProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
        throw new ApiError(404, "Project not found");
    }

    const newProjectId = crypto.randomUUID();
    const duplicatedProject = await Project.create({
        projectId: newProjectId,
        title: `${existingProject.title} (Copy)`,
        description: existingProject.description,
        template: existingProject.template,
        fileTree: existingProject.fileTree || getTemplateFiles(existingProject.template),
        owner: userId,
        collaborators: [],
        starredBy: []
    });

    const user = await User.findById(userId);
    user.ownedProjects.push(duplicatedProject._id);
    await user.save({ validateBeforeSave: false });

    return res.status(201).json(new ApiResponse(201, duplicatedProject, "Project duplicated successfully"));
});

export const getProjectById = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
        .populate('owner', 'username avatar email')
        .populate('collaborators', 'username avatar email');

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.fileTree || Object.keys(project.fileTree).length === 0) {
        project.fileTree = getTemplateFiles(project.template);
        project.markModified('fileTree');
        await project.save({ validateBeforeSave: false });
    }

    return res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"));
});

export const saveProjectFiles = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { fileTree } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    project.fileTree = fileTree;
    project.lastUpdatedAt = Date.now();
    project.markModified('fileTree');
    await project.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Files saved successfully"));
});

export const updateOpenedFilesOfProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { openedFiles } = req.body;

    if (!Array.isArray(openedFiles)) {
        throw new ApiError(400, "openedFiles must be an array");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    project.openedFiles = openedFiles;
    project.markModified('openedFiles');
    await project.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, project, "Opened files updated successfully"));
});

export const addCollaboratorToProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!projectId || !userId) {
        throw new ApiError(400, "Project ID and User ID are required");
    }

    const project = await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { collaborators: userId } },
        { new: true }
    );
    
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { collaboratedProjects: projectId } },
        { new: true }
    );

    if (!project || !user) {
        throw new ApiError(404, "Project or User not found");
    }

    return res.status(200).json(new ApiResponse(200, project, "Collaborator added successfully"));
});

export const addOnlineUserToProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!projectId || !userId) {
        throw new ApiError(400, "Project ID and User ID are required");
    }

    const project = await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { onlineUsers: userId } },
        { new: true }
    ).populate('onlineUsers', 'username avatar firstName lastName');

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res.status(200).json(new ApiResponse(200, project, "Online user added successfully"));
});

export const removeOnlineUserFromProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!projectId || !userId) {
        throw new ApiError(400, "Project ID and User ID are required");
    }

    const project = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { onlineUsers: userId } },
        { new: true }
    ).populate('onlineUsers', 'username avatar firstName lastName');

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res.status(200).json(new ApiResponse(200, project, "Online user removed successfully"));
});

export const importGithubRepo = asyncHandler(async (req, res, next) => {
    const { repoUrl, template = 'react' } = req.body;
    if (!repoUrl) {
        throw new ApiError(400, "GitHub repository URL is required");
    }

    // Parse URL: https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        throw new ApiError(400, "Invalid GitHub repository URL");
    }

    let owner = match[1];
    let repo = match[2].replace(/\.git$/, '');

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WeCode-App'
    };

    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Get default branch
    let defaultBranch = 'main';
    try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoRes.ok) {
            throw new Error('Repository not found or access denied');
        }
        const repoData = await repoRes.json();
        defaultBranch = repoData.default_branch || 'main';
    } catch (err) {
        throw new ApiError(404, "Failed to access GitHub repository. Make sure it's public.");
    }

    // 2. Get recursive tree
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeRes.ok) {
        throw new ApiError(500, "Failed to fetch repository tree");
    }
    const treeData = await treeRes.json();

    if (treeData.truncated) {
        throw new ApiError(400, "Repository is too large to import automatically.");
    }

    const blobs = treeData.tree.filter(item => item.type === 'blob');
    
    // Safety limit: Don't import if > 200 files
    if (blobs.length > 200) {
        throw new ApiError(400, `Repository has too many files (${blobs.length}). Maximum allowed is 200.`);
    }

    // 3. Fetch all blob contents
    const fileTree = {};
    const fetchPromises = blobs.map(async (blob) => {
        try {
            // Some binary files might fail or be large, we'll try to fetch as text
            const fileRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${blob.path}`);
            if (!fileRes.ok) return;
            const content = await fileRes.text();

            const parts = blob.path.split('/');
            let currentLevel = fileTree;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    currentLevel[part] = { type: 'file', content: content };
                } else {
                    if (!currentLevel[part]) {
                        currentLevel[part] = { type: 'directory', children: {} };
                    }
                    currentLevel = currentLevel[part].children;
                }
            }
        } catch (e) {
            console.error(`Failed to fetch file: ${blob.path}`, e);
        }
    });

    await Promise.all(fetchPromises);

    // If fileTree is empty, something went wrong
    if (Object.keys(fileTree).length === 0) {
        throw new ApiError(500, "Failed to extract files from the repository");
    }

    const projectId = crypto.randomUUID();
    const project = await Project.create({
        projectId,
        title: `${repo}`,
        description: `Imported from ${repoUrl}`,
        template: template,
        fileTree: fileTree,
        owner: req.user._id,
        collaborators: [],
        starredBy: []
    });

    user.ownedProjects.push(project._id);
    await user.save({ validateBeforeSave: false });

    return res.status(201).json(new ApiResponse(201, project, "GitHub repository imported successfully"));
});

