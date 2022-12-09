const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: String,
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  time: String,
  date: String,
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
