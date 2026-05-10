import {Router} from "express";
import {validate} from "../middlewares/validator.middleware.js"
import { registerUser, loginUser, logoutUser, verifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification, updateTheme, updateProfile } from "../controllers/auth.controllers.js";
import { userRegisterValidator , userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator, userUpdateProfileValidator} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password/:resetToken").post(userResetForgotPasswordValidator() , validate, resetForgotPassword)

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/update-theme").post(verifyJWT, updateTheme);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification)
router.route("/update-profile").patch(verifyJWT, userUpdateProfileValidator(), validate, updateProfile);

export default router;