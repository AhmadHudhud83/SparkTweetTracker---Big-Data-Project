const TweetModel = require("../models/TweetModel");

exports.getAllTweets = async (req, res) => {
  try {
    const tweets = await TweetModel.find().lean();
    res.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).send("Error fetching tweets");
  }
};

exports.searchTweetsByKeyword = async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "Please provide a keyword or phrase to search for." });
  }

  try {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    const tweets = await TweetModel.find({ text: { $regex: regex } }).lean();

    if (tweets.length === 0) {
      return res.status(404).json({ message: "No tweets found with the given keyword or phrase." });
    }

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching tweets by keyword or phrase:", error);
    res.status(500).send("Error fetching tweets by keyword or phrase");
  }
};

exports.getTweetsByCountry = async (req, res) => {
  try {
    const countryName = req.params.countryName.toLowerCase();
    const tweetsByCountry = await TweetModel.find({ country: countryName }).lean();

    if (tweetsByCountry.length === 0) {
      return res.status(404).json({ message: `No tweets found for country: ${countryName}` });
    }

    res.json(tweetsByCountry);
  } catch (error) {
    console.error("Error fetching tweets by country:", error);
    res.status(500).send("Error fetching tweets by country");
  }
};
