import { User } from "../models/user.model.js";
import { status } from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(status.CONFLICT)
        .json({ message: "User already exists ! Try a different username" });
    }

    const hashedPW = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPW,
    });

    await newUser.save();
    res.status(status.CREATED).json({
      message: "User registered successfully",
      name: name,
      username: username,
    });
  } catch (e) {
    logger.error(`Error in register route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide all credentials" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // console.log(isMatch);
      // let token = crypto.randomBytes(20).toString("hex");

      const userPayload = {
        username: user.username,
        name: user.name,
        role: "user",
        lastLogin: new Date().toISOString(),
      };

      // Sign the token with all the metadata inside
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });
      user.token = token;
      await user.save();

      // Set the token in an HttpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(status.OK).json({
        token: token,
        message: "login successful",
        username: user.username,
        name: user.name,
      });
    } else {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "invalid credentials" });
    }
  } catch (e) {
    logger.error(`Error in login route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(status.OK).json({ message: "Logged out successfully" });
};

const verifyUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(status.OK).json({
      token: req.user.token,
      name: user.name,
      username: user.username,
      time: Date.now(),
    });
  } catch (e) {
    logger.error(`Error in verifyUser route : \nERROR = \n ${e}`);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { login, signup, logout, verifyUser };
