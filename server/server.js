import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Разрешение CORS для Express
app.use(cors({
  origin: "*", // Разрешить доступ с любых доменов. В продакшн можно ограничить
  methods: ["GET", "POST"],
}));

const io = new Server(server, {
  cors: {
    origin: "*", // Разрешение CORS для Socket.io, можно ограничить для продакшн
    methods: ["GET", "POST"],
  },
});

let activeSessions = 0;

// Обработчик подключения для Socket.io
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

// Простой маршрут для проверки сервера
app.get("/", (req, res) => {
  res.send("Socket.io server is running!");
});

const port = process.env.PORT || 3000;

// Запуск сервера
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

