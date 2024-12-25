// Importing Dependencies
const express = require("express");
const mongoose = require("mongoose");
const TweetModel = require('./models/Tweets.js')
const app = express();
const cors  = require("cors")
app.use(cors())




mongoose.connect('mongodb+srv://ahmad:ahmad1212@cluster0.aq5ou.mongodb.net/SparkTweetsStorage?retryWrites=true&w=majority&appName=Cluster0', 
)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

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



PORT_= "5000";
app.listen(PORT_, () => {
  console.log(`Server is Listening at ${PORT_}`);
});
