import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";
import userRoutes from "./routes/users.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 3000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meeting", meetingRoutes);

app.get("/", (req, res) => {
  res.send("I am home");
});

const start = async () => {
  const connnetionDB = await mongoose.connect(process.env.DB_URL);
  console.log("Connected to DB");
  server.listen(app.get("port"), () => {
    console.log("App listening to PORT " + app.get("port"));
  });
};

start();
