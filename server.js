const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const cors = require("cors");
const { METHODS } = require("http");

const Message = require("./models/Message");
const { default: mongoose } = require("mongoose");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);

require("./connection");

const server = require("http").createServer(app);
const PORT = 5001;
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POSt"],
  },
});

//get messages from friends
const getMsgs = async (friendId, userId) => {
  let messages = await Message.aggregate([
    {
      $match: {
        $or: [
          {
            to: mongoose.Types.ObjectId(friendId),
            from: mongoose.Types.ObjectId(userId),
          },
          {
            to: mongoose.Types.ObjectId(userId),
            from: mongoose.Types.ObjectId(friendId),
          },
        ],
      },
    },
  ]);

  return messages;
};

// sorting messages
const sortMsgs = (messages) => {
  return messages.sort((a, b) => {
    let date_1 = Number(a.time);
    let date_2 = Number(b.time);

    return date_1 < date_2 ? -1 : 1;
  });
};

// socket connection
io.on("connection", (socket) => {
  // will sned friends list from db when someone logins to display in the UI
  socket.on("new-user", async () => {
    const members = await User.find();
    console.log(members);
    io.emit("new-user", members);
  });

  // when you click on a friend, it will show your conversations
  socket.on("join-friend", async (friendId, userId, roomUniqueId) => {
    socket.join(roomUniqueId);
    let messages = await getMsgs(friendId, userId);
    messages = sortMsgs(messages);
    console.log(roomUniqueId);
    socket.emit("friend-messages", messages);
  });

  // store messages to database, will also update if there a message
  socket.on(
    "message-friend",
    async (content, from, time, date, to, roomUniqueId) => {
      const msgObj = { content, from, time, date, to };
      try {
        let newMsg = await Message.create(msgObj);
        let messages = await getMsgs(to, from);
        messages = sortMsgs(messages);
        io.to(roomUniqueId).emit("friend-messages", messages);
      } catch (err) {
        console.log(err.message);
      }
    }
  );

  app.delete("/logout", async (req, res) => {
    try {
      const { _id } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      await user.save();
      const members = await User.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(400).send();
    }
  });
});

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
