import { body, validationResult } from "express-validator";


// Validate Request Middleware function
function validateRequest(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();

}


// Register User Validation Rules
export const validateRegisterUser = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Invalid email format"),
    body("contact")
        .trim()
        .notEmpty().withMessage("Contact is required")
        .matches(/^\d{10}$/).withMessage("Contact must be a 10-digit number"),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("fullname")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters long"),
    body("isSeller")
        .isBoolean().withMessage("isSeller must be a boolean value"),
    validateRequest
]


// Login User Validation Rules
export const validateLoginUser = [
    body("email")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    validateRequest
]