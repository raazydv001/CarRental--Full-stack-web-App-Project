import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized: No token" });
    }

    try {
        // Verify token and get payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // 👈 Use verify, not decode

        const user = await User.findById(decoded).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user; // 👈 Attach user to request
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized: Invalid token" });
    }
};
