const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema({
    text: { type: String, required: true },
    timestamp: { type: Date, required: true },
    geo: {
        type: { type: String, enum: ['Point'], default: null },
        coordinates: { type: [Number], default: null }
    },
    hashtags: { type: [String], default: [] },
    sentimentScore: { type: Number, default: null }
}, { timestamps: true });

const TweetModel = mongoose.model("tweets", TweetSchema);

module.exports = TweetModel;
