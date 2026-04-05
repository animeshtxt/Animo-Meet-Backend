import { status } from "http-status";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const validateToken = async (req, res, next) => {
  try {
    /*
     const authHeader = req.headers["authorization"]; // e.g. "Bearer <token>"
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // This gets the token part
    } else {
      token = null;
    }

    if (!token || token === "") {
      logger.dev("No token received");
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "no token provided" });
    } else {
      logger.dev(`Received token : ${token}`);
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "Invalid token, login again" });
    }
    logger.dev("token verified successfully");
    logger.dev(user.name);

    req.user = user;
    */
    // console.log("All Cookies:", req.cookies);
    // console.log("All Headers:", req.headers);

    // Robust cookie extraction (handles case where cookie-parser might not have run)
    const token =
      req.cookies?.token ||
      req.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      logger.dev("No token received");
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "no token found" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.user.token = token;
    logger.dev(`User Verified: ${decoded.username}`);
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
    logger.error(e);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { validateToken };
