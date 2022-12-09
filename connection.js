const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", true);

// change the connection link for your own database
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.pkcy99d.mongodb.net/ASGChatApp?retryWrites=true&w=majority`,
  () => {
    console.log("Successfuly Connected to MongoDB");
  }
);
