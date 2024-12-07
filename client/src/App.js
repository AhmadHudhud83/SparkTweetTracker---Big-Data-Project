import "./App.css";
import { useState, useEffect } from "react";
import Axios from "axios";

function App() {
  const [tweets, setTweets] = useState([]);
  useEffect(() => {
    Axios.get("http://localhost:5000/tweets")
      .then((res) => setTweets(res.data))

      .catch((e) => console.error(e));
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        {tweets.map((tweet) => {
          return (
            <div>
              <h3>{tweet.username}</h3>
              <h6>{tweet.text}</h6>
            </div>
          );
        })}
      </header>
    </div>
  );
}

export default App;
