const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

const devices = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message);

      if (msg.type === "register") {
        ws.deviceId = msg.deviceId;
        devices.set(msg.deviceId, ws);
        console.log(`Device ${msg.deviceId} registered.`);
      } 
      else if (msg.type === "discover") {
        const list = Array.from(devices.keys()).filter((id) => id !== msg.requesterId);
        ws.send(JSON.stringify({ type: "device_list", devices: list }));
      } 
      else if (msg.type === "forward" && msg.to) {
        const target = devices.get(msg.to);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify({ ...msg, from: ws.deviceId }));
        }
      }
    } catch (e) {
      console.error("Invalid message", e);
    }
  });

  ws.on("close", () => {
    if (ws.deviceId && devices.has(ws.deviceId)) {
      devices.delete(ws.deviceId);
      console.log(`Device ${ws.deviceId} disconnected.`);
    }
  });
});
