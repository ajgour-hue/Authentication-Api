import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/token.js";



// Function to send token response 
async function sendTokenResponse(user, res, message) {

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message,
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    });
}

// Function to register user
export const register = async (req, res) => {

    const { email, password, fullname, contact, isSeller } = req.body;

    try {


        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with same email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            password,
            fullname,
            contact,
            role: isSeller ? "seller" : "buyer"
        });

        await sendTokenResponse(user, res, "User registered successfully")

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
}


// Function to refresh token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            config.JWT_REFRESH_SECRET
        );

        const user = await userModel.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};


// Function to login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const match = await user.comparePassword(password);

        if (!match) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        await sendTokenResponse(user, res, "User logged in successfully")

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: " internal server error" });
    }

}

// Function to get current user
export const getMe = async (req, res) => {
    const user = req.user;
    return res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

// Function to google callback
export const googleCallback = async (req, res) => {

    const { id, displayName, emails } = req.user;
    const email = emails[0].value;

    let user = await userModel.findOne({ email });

    if (!user) {
        user = await userModel.create({
            email,
            googleId: id,
            fullname: displayName,
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
    });

    // res.redirect("http://localhost:5173");
     res.redirect(
        config.NODE_ENV === "development"
            ? "http://localhost:5173"
            : config.CLIENT_URL
    );
};

// Function to logout user
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const user = await userModel.findOne({ refreshToken });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.refreshToken = null;
        await user.save();

        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
