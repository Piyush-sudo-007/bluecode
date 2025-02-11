import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import open from "open";

const app = express();
const port = 5000;
app.use(express.json());

const server = http.createServer(app);

const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\/[^\s]*)?/;

app.post('/process-audio', (req, res) => {
  const recognizedText = req.body.text;
  console.log('Recognized Text:', recognizedText);

  // Check if the recognized text contains a URL or website command
  if (urlRegex.test(recognizedText)) {
    // If the text is a website command (e.g., "open Google")
    const websiteURL = recognizedText.match(urlRegex)[0];
    open(websiteURL)
      .then(() => {
        res.json({ output: `Opening website ${websiteURL}` });
      })
      .catch((err) => {
        console.error('Error opening website:', err);
        res.status(500).json({ error: 'Failed to open the website.' });
      });
  } else {
    // If the text is more likely a song or music request (e.g., "play song XYZ")
    const songURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(recognizedText)}`;
    open(songURL)
      .then(() => {
        res.json({ output: "Playing your song" });
      })
      .catch((err) => {
        console.error('Error opening YouTube:', err);
        res.status(500).json({ error: 'Failed to open YouTube.' });
      });
  }
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
