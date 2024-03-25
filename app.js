const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const redis = require("redis");
const MAX_MESSAGES = 30000;

const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

redisClient.on("error", function (error) {
  console.error(`Redis error: ${error}`);
});

redisClient.connect();

const app = express();
app.set("port", process.env.PORT || 2222);
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app).listen(app.get("port"), () => {
  console.log("server listening port " + app.get("port"));
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.listen(server);

let users = [];

io.on("connection", (socket) => {
  const messages = getRedisMessages();
  io.emit("allMessages", messages);
  io.emit("userlist", users+1);

  socket.on("disconnect", () => {
    console.log(socket.nickname + "has disconnected");
    const updateUsers = users.filter((user) => user != socket.nickname);
    users = updateUsers;
    io.emit("userlist", users);
  });

  // socket.on("nick", (nickname) => {
  //   socket.nickname = nickname;
  //   users.push(nickname);

  //   console.log("server : users :", users);
  //   io.emit("userlist", users);
  // });

  socket.on("chat", (data) => {
    console.log(data)
    const messageData = {
      user: data.user,
      message: data.message,
      timestamp: new Date().toLocaleString(),
    };

    redisClient.rPush("messages", JSON.stringify(messageData)).then(() => {
      redisClient.lLen("messages").then((length) => {
        if (length > MAX_MESSAGES) {
          redisClient.lTrim("messages", length - MAX_MESSAGES, -1);
        }
      });
    });

    io.emit("chat", {...messageData, user: `${messageData.user.charAt(0)}***${messageData.user.charAt(messageData.user.length-1)}`});
  });
});

function getRedisMessages() {
  redisClient.lRange("messages", 0, -1).then((messages) => {
    const parsedMessages = messages.map((message) => JSON.parse(message));
    io.emit("allMessages", parsedMessages);
  });
}
