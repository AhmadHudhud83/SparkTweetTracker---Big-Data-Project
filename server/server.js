// Importing Dependencies
const express = require("express");
const mongoose = require("mongoose");
//

const app = express();
const cors  = require("cors")
app.use(cors())


mongoose.connect('mongodb+srv://ahmad:ahmad1212@cluster0.aq5ou.mongodb.net/SparkTweetsStorage?retryWrites=true&w=majority&appName=Cluster0', 
)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

const TweetModel = require('./models/Tweets.js')


app.get("/tweets",async (req,res)=>{
    const tweets = await TweetModel.find();
    console.log(tweets)
    res.json(tweets)
})


//Server Config

PORT_= "5000";
app.listen(PORT_, () => {
  console.log(`Server is Listening at ${PORT_}`);
});
