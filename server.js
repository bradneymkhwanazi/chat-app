const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MySQL connection
const sequelize = new Sequelize('chat-app', 'avnadmin', 'AVNS_4c3BtByux_Zrt-LiW6-', {
    host: 'mysql-1b23a9b5-poizen.h.aivencloud.com',
    dialect: 'mysql',
    port: 22330,
});

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server started on https://chat-app-608h.onrender.com/');
});