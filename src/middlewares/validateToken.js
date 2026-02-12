import { status } from "http-status";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
const validateToken = async (req, res, next) => {
  try {
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
    next();
  } catch (e) {
    logger.dev(e);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { validateToken };
