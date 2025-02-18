import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import open from "open";

const app = express();
const port = 5000;
app.use(express.json());

const server = http.createServer(app);

app.post('/process-audio', (req, res) => {
  const recognizedText = req.body.text;
  console.log('Recognized Text:', recognizedText);

  let responseMessage = '';
  let linkToShow = '';

  // If the recognized text is a command to open a website (e.g., "open Google")
  if (/open\s+[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(recognizedText) || /open\s+[a-zA-Z]+/.test(recognizedText)) {
    const website = recognizedText.replace(/^open\s+/i, '').trim();
    const websiteURL = website.includes("http") ? website : `https://www.${website}.com`;

    console.log(`Opening website: ${websiteURL}`);

    // Check if the environment is Docker or not
    if (process.env.DOCKER) {
      // Log the URL to the console if in Docker
      console.log(`Docker: URL to open: ${websiteURL}`);
      responseMessage = `Opening ${website} (Logged to console)`;
      linkToShow = websiteURL;
    } else {
      // If not in Docker, try to open the URL in the browser
      open(websiteURL)
        .then(() => {
          responseMessage = `Opening ${website}`;
          linkToShow = websiteURL;
          res.json({ output: responseMessage, link: linkToShow });
        })
        .catch((err) => {
          console.error('Error opening website:', err);
          res.status(500).json({ error: 'Failed to open the website.' });
        });
      return; // Ensure the response is sent only after the open is complete
    }

  } else if (/play\s+song\s+/i.test(recognizedText)) {
    // If it's a song request (e.g., "play song Kesariya"), assume it's a song
    const songName = recognizedText.replace(/^play\s+song\s+/i, '').trim();
    const songURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;

    console.log(`Searching for song on YouTube: ${songURL}`);

    if (process.env.DOCKER) {
      // Log the URL for debugging in Docker (headless environment)
      console.log(`Docker: URL to open: ${songURL}`);
      responseMessage = `Playing your requested song on YouTube! (Logged to console)`;
      linkToShow = songURL;
    } else {
      // If not in Docker, open YouTube search
      open(songURL)
        .then(() => {
          responseMessage = `Playing ${songName} on YouTube!`;
          linkToShow = songURL;
          res.json({ output: responseMessage, link: linkToShow });
        })
        .catch((err) => {
          console.error('Error opening YouTube:', err);
          res.status(500).json({ error: 'Failed to open YouTube.' });
        });
      return; // Ensure the response is sent only after the open is complete
    }

  } else {
    res.status(400).json({ output: 'Unrecognized command. Try opening a website or playing a song.' });
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
    if (!isValidGroupId(groupId) && groupId != "9304868598") {
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
