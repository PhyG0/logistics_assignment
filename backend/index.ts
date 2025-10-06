import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; 
import { Server } from "socket.io";

import connectDB from "./config/database";

import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicle";
import deliveryRoutes from "./routes/delivery";
import geoapifyRouter from "./routes/geoapify";

dotenv.config();

const app = express();

const main = async () => {
  await connectDB();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/vehicle", vehicleRoutes);
  app.use("/api/delivery", deliveryRoutes);
  app.use("/api/geoapify", geoapifyRouter);

  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: ["https://logistics-assignment.vercel.app", "http://localhost:5173"], 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("message", (data) => {
      console.log("Message received:", data);
      io.emit("message", data); 
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

main();

export default app;
