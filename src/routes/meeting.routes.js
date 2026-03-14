import {
  createMeet,
  doesMeetExist,
  checkIfHost,
  getPrevMeets,
} from "../controllers/meeting.controller.js";
import { validateToken } from "../middlewares/validateToken.js";
import { Router } from "express";

const router = Router();

router.route("/create-meet/:meetingCode").post(validateToken, createMeet);
router.route("/check-meet/:meetingCode").get(doesMeetExist);
router.route("/check-host").get(checkIfHost);
router.route("/prev-meets/:username").get(validateToken, getPrevMeets);

export default router;
