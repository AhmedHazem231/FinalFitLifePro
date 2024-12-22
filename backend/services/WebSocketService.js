// services/WebSocketService.js
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    const token = new URL(req.url, "ws://localhost").searchParams.get("token");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      this.clients.set(userId, ws);

      ws.on("message", (message) => {
        this.handleMessage(userId, message);
      });

      ws.on("close", () => {
        this.clients.delete(userId);
      });

      // Send initial connection success
      ws.send(
        JSON.stringify({
          type: "connection",
          status: "connected",
        }),
      );
    } catch (error) {
      ws.close();
    }
  }

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "workout_start":
          this.broadcastWorkoutStatus(userId, "started");
          break;
        case "workout_complete":
          this.broadcastWorkoutStatus(userId, "completed");
          break;
        case "achievement_earned":
          this.notifyAchievement(userId, data.achievement);
          break;
      }
    } catch (error) {
      console.error("WebSocket message handling error:", error);
    }
  }

  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcastWorkoutStatus(userId, status) {
    this.sendToUser(userId, {
      type: "workout_update",
      status,
      timestamp: new Date(),
    });
  }

  notifyAchievement(userId, achievement) {
    this.sendToUser(userId, {
      type: "achievement",
      achievement,
      timestamp: new Date(),
    });
  }
}

module.exports = WebSocketService;
