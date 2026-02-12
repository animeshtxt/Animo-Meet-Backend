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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meeting", meetingRoutes);

app.get("/", (req, res) => {
  res.send("I am home");
});

const start = async () => {
  const db_url =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_DB_URL
      : process.env.DEVELOPMENT_DB_URL;
  const connnetionDB = await mongoose.connect(db_url);
  console.log("Connected to DB");
  server.listen(app.get("port"), () => {
    console.log(
      "Animo-Meet backend listening to PORT " +
        app.get("port") +
        " | Environment : " +
        process.env.NODE_ENV,
    );
  });
};

start();
