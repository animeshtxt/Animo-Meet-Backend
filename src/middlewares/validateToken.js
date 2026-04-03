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
    const token = req.cookies?.token;
    if (!token) {
      logger.dev("No token received");
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "no token found" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(status.UNAUTHORIZED)
          .json({ message: "Invalid token" });
      req.user = decoded;
      req.user.token = token;
      logger.dev(`User Verified, user: `, decoded);
      next();
    });
  } catch (e) {
    logger.error(e);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { validateToken };
