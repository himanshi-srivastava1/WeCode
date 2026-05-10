import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js"
import { createProject, getAllProjects, addProjectToStar, removeProjectFromStar, updateProjectDescription } from "../controllers/project.controllers.js";
import { projectCreateValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-project").post(verifyJWT, projectCreateValidator(), validate, createProject);
router.route("/get-all-projects").get(verifyJWT, getAllProjects);
router.route("/:projectId/star").post(verifyJWT, addProjectToStar);
router.route("/:projectId/unstar").delete(verifyJWT, removeProjectFromStar);
router.route("/:projectId/description").patch(verifyJWT, updateProjectDescription);

export default router;