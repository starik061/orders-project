import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // в проде можно ограничить
    methods: ["GET", "POST"],
  },
});

let activeSessions = 0;

io.on("connection", (socket) => {
  activeSessions++;
  console.log("Client connected. Active sessions:", activeSessions);
  io.emit("activeSessions", activeSessions);

  socket.on("disconnect", () => {
    activeSessions--;
    console.log("Client disconnected. Active sessions:", activeSessions);
    io.emit("activeSessions", activeSessions);
  });
});

app.get("/", (req, res) => {
  res.send("Socket.io server is running!");
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
