import {
  checkMeetCode,
  doesMeetExist,
  checkIfHost,
} from "../controllers/meeting.controller.js";
import { validateToken } from "../middlewares/validateToken.js";
import { Router } from "express";

const router = Router();

router.route("/check-code/:meetingCode").get(validateToken, checkMeetCode);
router.route("/check-meet/:meetingCode").get(doesMeetExist);
router.route("/check-host").get(checkIfHost);

export default router;
