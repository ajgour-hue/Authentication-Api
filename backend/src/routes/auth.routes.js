import { Router } from "express";
import passport from "passport";
import { config } from "../config/config.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

import {
    validateRegisterUser,
    validateLoginUser
} from "../validator/auth.validator.js";

import {
    register,
    login,
    googleCallback,
    getMe,
    logout,
    refreshToken,
} from "../controller/auth.controller.js";


const router = Router();

/**
 * @route POST /api/auth/register
 * @description Register a user
 * @access Public
 */
router.post("/register", validateRegisterUser, register);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post("/login", validateLoginUser, login);

/**
 * @route GET /api/auth/me
 * @description Get current user
 * @access Private
 */
router.get("/me", authenticateUser, getMe);

/**
 * @route GET /api/auth/logout
 * @description Logout a user
 * @access Private
 */
router.post("/logout", logout);

/**
 * @route GET /api/auth/refresh
 * @description Refresh a user
 * @access Private
 */
router.post("/refresh", refreshToken);

/**
 * @route GET /api/auth/google
 * @description Google login
 */
router.get("/google/", passport.authenticate("google", { scope: ["email", "profile"] }));

/**
 * @route GET /api/auth/google/callback
 * @description Google callback
 */
router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect:
        config.NODE_ENV === "development"
            ? "http://localhost:5173/login"
            : config.CLIENT_URL + "/login",
}),
    googleCallback
);






export default router;

