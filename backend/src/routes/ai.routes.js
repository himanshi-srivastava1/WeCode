import { Router } from "express";
import { generateCodeCompletion, generateCodeSuggestion } from "../controllers/ai.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/code-completion").post(generateCodeCompletion);
router.route("/code-suggestion").post(generateCodeSuggestion);

export default router;
