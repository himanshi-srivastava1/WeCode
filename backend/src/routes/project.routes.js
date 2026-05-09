import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js"
import { createProject, getAllProjects } from "../controllers/project.controllers.js";
import { projectCreateValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-project").post(verifyJWT, projectCreateValidator(), validate, createProject);
router.route("/get-all-projects").get(verifyJWT, getAllProjects);

export default router;