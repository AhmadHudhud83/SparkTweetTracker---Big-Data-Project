const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const tweetRoutes = require("./routes/tweetRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

mongoose.connect("mongodb+srv://ahmad:ahmad1212@cluster0.aq5ou.mongodb.net/SparkTweetsStorage?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

app.use("/tweets", tweetRoutes);

const db = mongoose.connection;
db.once("open", () => {
  console.log("monitoring mongoDB changes");

  const changeStream = db.collection("tweets").watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newTweet = change.fullDocument;
      console.log("New tweet detected:", newTweet);
      io.emit("newTweet", newTweet);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
