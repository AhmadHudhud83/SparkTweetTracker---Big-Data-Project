
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const TweetModel = require("./models/Tweets.js");

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


const db = mongoose.connection;
db.once("open", () => {
  console.log("Monitoring MongoDB changes...");

  const changeStream = db.collection("tweets").watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const newTweet = change.fullDocument;
      console.log("New tweet detected:", newTweet);
      io.emit("newTweet", newTweet); 
    }
  });
});

app.get("/tweets", async (req, res) => {
  try {
    const tweets = await TweetModel.find().lean();;
    res.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).send("Error fetching tweets");
  }
});

app.get("/tweets/country/:countryName", async (req, res) => {
  try {
    const countryName = req.params.countryName; 
    const tweetsByCountry = await TweetModel.find({ country: countryName }).lean();

    if (tweetsByCountry.length === 0) {
      return res.status(404).json({ message: `No tweets found for country: ${countryName}` });
    }

    res.json(tweetsByCountry); 
  } catch (error) {
    console.error("Error fetching tweets by country:", error);
    res.status(500).send("Error fetching tweets by country");
  }
});

app.get("/tweets/search", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "Please provide a keyword or phrase to search for." });
  }

  try {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    const tweets = await TweetModel.find({
      text: { $regex: regex }
    }).lean();

    if (tweets.length === 0) {
      return res.status(404).json({ message: "No tweets found with the given keyword or phrase." });
    }

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets by keyword or phrase:", error);
    res.status(500).send("Error fetching tweets by keyword or phrase");
  }
});


app.get("/tweets/by-date", async (req, res) => {
  const { from, to } = req.query;

  
  if (!from || !to) {
    return res.status(400).json({ error: "Please provide both 'from' and 'to' timestamps in ISO 8601 format." });
  }

  try {
    
    const fromDate = new Date(from);
    const toDate = new Date(to);

    
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ error: "Invalid date format. Please use ISO 8601 format." });
    }

    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);

    
    const tweets = await TweetModel.find({
      timestamp: { $gte: fromDate, $lte: toDate }
    }).lean();

    
    if (tweets.length === 0) {
      return res.status(404).json({ message: "No tweets found in the specified date range." });
    }

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets by date range:", error);
    res.status(500).send("Error fetching tweets by date range");
  }
});


PORT_= "5000";
app.listen(PORT_, () => {
  console.log(`Server is Listening at ${PORT_}`);
});
