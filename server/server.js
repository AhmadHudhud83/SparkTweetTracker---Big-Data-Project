// Importing Dependencies
const express = require("express");
const mongoose = require("mongoose");
//

const app = express();
const cors  = require("cors")
app.use(cors())
// MongoDB Database Config
mongoose.connect(
  `mongodb+srv://${process.env.AHMAD_HUDHUD_USERNAME}:${process.env.AHMAD_HUDHUD_PASSWORD}@cluster0.aq5ou.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`
);


const TweetModel = require('./models/Tweets.js')

app.get("/tweets",async (req,res)=>{
    const tweets = await TweetModel.find();
    console.log(tweets)
    res.json(tweets)
})


//Server Config

PORT_ = "5000";
app.listen(PORT_, () => {
  console.log(`Server is Listening at ${PORT_}`);
});
