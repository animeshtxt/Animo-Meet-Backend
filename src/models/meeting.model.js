import mongoose, { Schema } from "mongoose";

const MeetingSchema = new Schema({
  hostUsername: { type: String },
  coHostUsernames: { type: [String], default: [] },
  meetingCode: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  lastActive: {
    type: Date,
    default: Date.now,
    required: true,
    expires: "7d",
  },
  hostControls: {
    audioAllowed: { type: Boolean, default: true },
    videoAllowed: { type: Boolean, default: true },
    screenShareAllowed: { type: Boolean, default: true },
    hostPermissionRequired: { type: Boolean, default: true },
  },
});

const Meeting = mongoose.model("Meeting", MeetingSchema);
export { Meeting };
