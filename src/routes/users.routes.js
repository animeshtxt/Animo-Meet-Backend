import { login, signup, verifyUser } from "../controllers/user.controller.js";
import { validateToken } from "../middlewares/validateToken.js";
import { Router } from "express";

const router = Router();

router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/add_to_activity");
router.route("/get_all_activity");
router.route("/verify-user").get(validateToken, verifyUser);

export default router;
