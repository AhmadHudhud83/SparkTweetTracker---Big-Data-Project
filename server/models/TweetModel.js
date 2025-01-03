const mongoose = require("mongoose")

const TweetSchema = new mongoose.Schema({
    text:{
        type:String,
    }
})
const TweetModel = mongoose.model("tweets",TweetSchema)


module.exports = TweetModel