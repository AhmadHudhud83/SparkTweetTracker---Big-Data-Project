const express = require("express");
const router = express.Router();
const tweetController = require("../controllers/tweetController");

router.get("/", tweetController.getAllTweets);

router.get("/search", tweetController.searchTweetsByKeyword);

router.get("/country/:countryName", tweetController.getTweetsByCountry);

module.exports = router;