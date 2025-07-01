import { status } from "http-status";
import { User } from "../models/user.model.js";
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
      console.log("No token received");
      return res
        .status(status.NO_CONTENT)
        .json({ message: "no token provided" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "Invalid token, login again" });
    }
    console.log("token verified successfully");
    console.log(user.name);
    // return res.status(status.OK).json({
    //   message: "Token validated",
    //   name: user.name,
    //   username: user.username,
    // });
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { validateToken };
