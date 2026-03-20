import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { registerWebsocketEventBridge } from "./eventBridge.js";
import { logger } from "../utils/logger.js";

let ioInstance: Server | null = null;

export function setupWebsocket(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  ioInstance = io;
  registerWebsocketEventBridge(io);

  io.on("connection", (socket: Socket) => {
    logger.info("WS connected:", socket.id);

    socket.on("disconnect", () => {
      logger.info("WS disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized!");
  }
  return ioInstance;
}