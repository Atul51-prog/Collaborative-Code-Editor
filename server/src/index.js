const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const httpServer = new http.Server(app);
const axios = require('axios');

dotenv.config({ path: path.resolve(__dirname, 'config.env') });

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "https://collaborative-code-editor-lyart.vercel.app",
];
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin) || origin === CLIENT_URL) return true;
  if (typeof origin === 'string' && origin.includes('vercel.app')) return true;
  return false;
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./db/connec');

app.use(require('./router/auth'));
app.use(require('./router/ai').router);

const User = require('./models/userSchema');

const PORT = Number(process.env.PORT) || 5000;

var rooms = []
var removeRooms = []

const io = require("socket.io")(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
})

function removingRooms() {

  console.log("ROOMS: " + rooms)
  if (removeRooms.length != 0) {
      for (let i = 0; i < removeRooms.length; i++) {
          if (io.sockets.adapter.rooms[removeRooms[i]] === undefined) {
              rooms = rooms.filter(function (item) {
                  return item !== removeRooms[i]
              })
          }
      }
  }
  removeRooms.splice(0,removeRooms.length)

  setTimeout(removingRooms, 60 * 60 * 1000);
}

function getLastValue(set){
  let value;
  for(value of set);
  return value;
}

const roomParticipants = new Map(); // roomId -> Map(socketId -> userName)

const broadcastRoomUsers = (roomId) => {
    if (!roomId) return;
    const roomMap = roomParticipants.get(roomId);
    const usersList = roomMap ? Array.from(roomMap.values()) : [];
    io.sockets.in(roomId).emit('joined-users', usersList.length);
    io.sockets.in(roomId).emit('room-users-list', usersList);
};

io.on("connection", socket => {
  console.log("CONNECTED SUCCESSFULLY");
  const { id } = socket.client;
  console.log(`User connected ${id}`);

  // Check if room exists
  socket.on('room-id', msg => {
      let exists = rooms.includes(msg);
      socket.emit('room-check', exists);
  });

  // If code changes, broadcast to sockets
  socket.on('code-change', msg => {
      socket.broadcast.to(socket.room).emit('code-update', msg);
  });

  // Send initial data to last person who joined
  socket.on('user-join', msg => {
      let room = io.sockets.adapter.rooms.get(socket.room);
      let lastPerson = getLastValue(room);
      console.log("lastPerson-->" + lastPerson);
      io.to(lastPerson).emit('accept-info', msg);
  });

  // Add room to socket
  socket.on('join-room', msg => {
      console.log("JOINING " + msg.id);
      if (!rooms.includes(msg.id)) {
          rooms.push(msg.id);
      }
      socket.room = msg.id;
      socket.userName = msg.nameOfUser;
      socket.join(msg.id);
    
      if (!roomParticipants.has(msg.id)) {
          roomParticipants.set(msg.id, new Map());
      }
      roomParticipants.get(msg.id).set(socket.id, msg.nameOfUser);

      let room = io.sockets.adapter.rooms.get(socket.room);
      if (room && room.size > 1) {
          var it = room.values();
          var first = it.next();
          let user = first.value;
          io.to(user).emit('request-info', "");
      }

      socket.emit('receive-message', { sender: 'admin', text: `${msg.nameOfUser}, welcome to room.` });
      socket.broadcast.to(socket.room).emit('receive-message', { sender: 'admin', text: `${msg.nameOfUser} has joined!` });
      broadcastRoomUsers(msg.id);
  });

  socket.on('created-room', msg => {
      console.log("CREATED-ROOM " + msg);
      if (!rooms.includes(msg)) rooms.push(msg);
  });

  // If language changes, broadcast to other sockets
  socket.on('language-change', msg => {
      socket.broadcast.to(socket.room).emit('language-update', msg);
  });

  // If title changes, broadcast to other sockets
  socket.on('title-change', msg => {
      socket.broadcast.to(socket.room).emit('title-update', msg);
  });

  socket.on('sendMessage', ({ message, sender }) => {
    io.to(socket.room).emit('receive-message', { sender: sender, text: message });
  });

  const handleSocketLeave = (explicitName) => {
      if (socket.room && roomParticipants.has(socket.room)) {
          const roomMap = roomParticipants.get(socket.room);
          const userName = explicitName || socket.userName || roomMap.get(socket.id);
          roomMap.delete(socket.id);
          broadcastRoomUsers(socket.room);
          if (userName) {
              socket.broadcast.to(socket.room).emit('receive-message', { sender: 'admin', text: `${userName} has left!` });
          }
          if (roomMap.size === 0) {
              roomParticipants.delete(socket.room);
              removeRooms.push(socket.room);
          }
      }
  };

  // If connection is lost
  socket.on('disconnect', () => {
      console.log(`User ${id} disconnected`);
      handleSocketLeave();
  });

  socket.on('leaving', (msg) => {
      try {
          handleSocketLeave(msg?.nameOfUser);
          if (socket.room) {
              socket.leave(socket.room);
          }
      } catch (error) {
          console.log("Leaving error:", error);
      }
  });

  socket.on('disconnecting', () => {
      handleSocketLeave();
  });
})

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// In-memory execution cache to save JDoodle credits on repeated runs (TTL: 2 minutes)
const executionCache = new Map();
const EXECUTION_CACHE_TTL_MS = 2 * 60 * 1000;

app.post('/execute', async (req, res) => {
    try {
        const { script, language, stdin = '', versionIndex = '0' } = req.body;

        if (typeof script !== 'string') {
            return res.status(400).json({ error: 'Script is required' });
        }
        if (!language) {
            return res.status(400).json({ error: 'Language is required' });
        }

        let cleanStdin = "";
        if (typeof stdin === "string") {
            cleanStdin = stdin;
        } else if (Array.isArray(stdin)) {
            cleanStdin = stdin.join("\n");
        } else if (stdin !== null && stdin !== undefined) {
            cleanStdin = String(stdin);
        }
        cleanStdin = cleanStdin.replace(/\r\n/g, "\n");

        console.log("BACKEND STDIN:", JSON.stringify(stdin));
        console.log("JDOODLE STDIN:", JSON.stringify(cleanStdin));
        console.log("CODE:", script);
        console.log("LANGUAGE:", language);

        // Check if identical code + stdin was recently executed
        const cacheKey = `${language}:::${cleanStdin}:::${script}`;
        const cached = executionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < EXECUTION_CACHE_TTL_MS)) {
            console.log("[JDoodle Cache HIT] Returned cached output (Saved 1 JDoodle credit!)");
            return res.json({
                ...cached.data,
                cached: true
            });
        }

        const response = await axios({
            method: "POST",
            url: process.env.JDOODLE_URL || "https://api.jdoodle.com/v1/execute",
            data: {
                clientId: process.env.JDOODLE_CLIENT_ID,
                clientSecret: process.env.JDOODLE_CLIENT_SECRET,
                script: script,
                language: language,
                versionIndex: String(versionIndex ?? '0'),
                stdin: cleanStdin,
            },
            responseType: "json",
            timeout: 30000,
        });

        console.log("JDoodle response:", response.data);

        // Cache successful response to avoid burning credits on accidental duplicate runs
        if (response.status === 200 && response.data) {
            executionCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            if (executionCache.size > 100) {
                const oldestKey = executionCache.keys().next().value;
                executionCache.delete(oldestKey);
            }
        }

        res.json(response.data);
    } catch (error) {
        const errData = error.response?.data;
        const errDetail = (errData && typeof errData === 'object')
            ? JSON.stringify(errData)
            : (errData || error.message || 'Execution error');
        console.error("Execution error:", errDetail);

        const status = error.response?.status || 500;
        let message = error.response?.data?.error || error.response?.data?.message || error.message || 'Execution failed';
        if (status === 429 || (typeof message === 'string' && message.toLowerCase().includes('limit'))) {
            message = "JDoodle API rate or daily limit reached. Please wait a moment before running again.";
        }

        res.status(status).json({
            error: message,
            output: message,
            statusCode: status,
            isExecutionSuccess: false
        });
    }
});

console.log('Hello world from server IndexJS');
removingRooms();

httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the old backend process, then run npm start again.`);
        process.exit(1);
    }

    console.error(err);
    process.exit(1);
});

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
