import { body } from 'express-validator';

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3, max: 15 })
            .withMessage("Username must be between 3 and 15 characters")
            .isLowercase()
            .withMessage("Username must be in lowercase"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("firstName")
            .trim()
            .notEmpty()
            .withMessage("First name is required"),
        body("lastName")
            .optional()
            .trim()
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ]
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is required"),
        body("newPassword").notEmpty().withMessage("New Password is required")
    ];
}

const userForgotPasswordValidator = () => {
    return [
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid")
    ];
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("Password is required")
    ]
}


const projectCreateValidator = () => {
    return [
        body("title").notEmpty().withMessage("Project Title is required").isLength({ max: 100 }).withMessage("Project title cannot exceed 100 characters"),
        body("description").optional().trim().isLength({ max: 1000 }).withMessage("Project description cannot exceed 1000 characters"),
        body("template").notEmpty().withMessage("Template is required"),

    ]
}
const userUpdateProfileValidator = () => {
    return [
        body("firstName")
            .trim()
            .notEmpty()
            .withMessage("First name is required"),
        body("lastName")
            .optional()
            .trim(),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3, max: 15 })
            .withMessage("Username must be between 3 and 15 characters")
            .isLowercase()
            .withMessage("Username must be in lowercase")
    ];
};

export { userRegisterValidator, userUpdateProfileValidator, userResetForgotPasswordValidator, userForgotPasswordValidator, userLoginValidator, userChangeCurrentPasswordValidator, projectCreateValidator };