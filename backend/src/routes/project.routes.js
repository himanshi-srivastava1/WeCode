import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js"
import { 
    createProject, getAllProjects, addProjectToStar, removeProjectFromStar, 
    updateProjectDescription, deleteProject, updateProjectTitle, duplicateProject, 
    getProjectById, saveProjectFiles, updateOpenedFilesOfProject,
    addCollaboratorToProject, addOnlineUserToProject, removeOnlineUserFromProject,
    importGithubRepo
} from "../controllers/project.controllers.js";
import { projectCreateValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-project").post(verifyJWT, projectCreateValidator(), validate, createProject);
router.route("/import-github").post(verifyJWT, importGithubRepo);
router.route("/get-all-projects").get(verifyJWT, getAllProjects);
router.route("/:projectId/star").post(verifyJWT, addProjectToStar);
router.route("/:projectId/unstar").delete(verifyJWT, removeProjectFromStar);
router.route("/:projectId/description").patch(verifyJWT, updateProjectDescription);
router.route("/:projectId/title").patch(verifyJWT, updateProjectTitle);
router.route("/:projectId/duplicate").post(verifyJWT, duplicateProject);
router.route("/:projectId/files").put(verifyJWT, saveProjectFiles);
router.route("/:projectId/opened-files").put(verifyJWT, updateOpenedFilesOfProject);
router.route("/:projectId/collaborators").post(verifyJWT, addCollaboratorToProject);
router.route("/:projectId/online-users").post(verifyJWT, addOnlineUserToProject);
router.route("/:projectId/online-users").delete(verifyJWT, removeOnlineUserFromProject);
router.route("/:projectId").get(verifyJWT, getProjectById);
router.route("/:projectId").delete(verifyJWT, deleteProject);

export default router;