import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { spawn } from "child_process"; 

const app = express();
const port = 5000;
app.use(express.json());

const server = http.createServer(app);

app.post('/activate', (req, res) => {
  const pythonProcess = spawn('python', [path.join(__dirname, '..', 'Jarvis', 'jarvis.py')]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Output from Python script: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Jarvis assistant exited with code ${code}`);
  });

  res.json({ message: 'Jarvis activated successfully!' });
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const group = new Map();

const isValidGroupId = (groupId) => {
  const regex = /^\d{13}-[a-z0-9]{9}$/;
  return regex.test(groupId);
};

io.on("connection", (socket) => {
  let currentGroup = null;
  let currentUser = null;

  socket.on("join", ({ groupId, username }) => {
    if (!isValidGroupId(groupId)) {
      socket.emit("error", "Invalid Group ID . ");
      return;
    }

    if (currentGroup) {
      socket.leave(currentGroup);
      group.get(currentGroup).delete(currentUser);
      io.to(currentGroup).emit("UserJoined", Array.from(group.get(currentGroup)));
    }

    currentGroup = groupId;
    currentUser = username;

    socket.join(groupId);

    if (!group.has(groupId)) {
      group.set(groupId, new Set());
    }

    group.get(groupId).add(username);
    io.to(groupId).emit("UserJoined", Array.from(group.get(groupId)));
  });

  socket.on("code-change", ({ groupId, code }) => {
    socket.to(groupId).emit("code-update", code);
  });

  socket.on("leaveGroup", () => {
    if (currentGroup && currentUser) {
      group.get(currentGroup).delete(currentUser);
      io.to(currentGroup).emit("UserLeft", Array.from(group.get(currentGroup)));

      socket.leave(currentGroup);
      currentGroup = null;
      currentUser = null;
    }
  });

  socket.on("typing", (groupId, username) => {
    socket.to(groupId).emit("userTyping", username);
  });

  socket.on("languageChange", (groupId, language) => {
    io.to(groupId).emit("languageUpdate", language);
  });
});


const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/Frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
