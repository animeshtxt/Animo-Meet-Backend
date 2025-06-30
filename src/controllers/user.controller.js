import { User } from "../models/user.model.js";
import { status } from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const register = async (req, res) => {
  const { name, username, password } = req.body;
  console.log(`name: ${name} \nusername : ${username} \npassword: ${password}`);

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
    res
      .status(status.CREATED)
      .json({ message: "User registered successfully" });
  } catch (e) {
    console.log(`Error in register route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const login = async (req, res) => {
  console.log("login request");
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
      console.log(isMatch);
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res
        .status(status.OK)
        .json({
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
    console.log(`Error in login route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const validateToken = async (req, res) => {
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
    return res.status(status.OK).json({
      message: "Token validated",
      name: user.name,
      username: user.username,
    });
  } catch (e) {
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};
export { login, register, validateToken };
