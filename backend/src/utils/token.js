import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

// Generate access token and refresh token for user 
export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id },
        config.JWT_ACCESS_SECRET,
        {
            expiresIn: config.ACCESS_TOKEN_EXPIRE
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        config.JWT_REFRESH_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRE
        }
    );
};