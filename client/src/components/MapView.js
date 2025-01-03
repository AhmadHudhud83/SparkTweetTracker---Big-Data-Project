import React, { useState,useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import Navbar from './Navbar.js';
import '../App.css'
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function MapView() {
  const [tweets, setTweets] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(0);
  const [chartData, setChartData] = useState({});
  // const [selectedCountry, setSelectedCountry] = useState("");
  const [dailyChartData, setDailyChartData] = useState({});
  const [timeInterval] = useState('hourly');
  const [avgSentiment, setAvgSentiment] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const customIcon = (se)=>{
    let iconUrl;
    if(se==1){
      iconUrl=require("../images/greenmarker.png");
    
    } else{
    
      iconUrl=require("../images/icon.png");
    
    
    }
      return new L.Icon({
      iconUrl: iconUrl,
      iconSize: [25, 30],
      iconAnchor: [17.5, 45],
      popupAnchor: [0, -45],
    });
      }
  const calculateAvgSentiment = (tweets) => {
    const totalSentiment = tweets.reduce((sum, tweet) => sum + tweet.sentimentScore, 0);
    return totalSentiment / tweets.length;
  };

  const handleSearch = async (e) => {
    console.log("ok");
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/tweets/search?keyword=${keyword}`
      );
      const result = await response.json();
      if (response.ok) {
        setTweets(result);
        setCount(result.length);
        generateChartData(result);
        generateDailyChartData(result);
        const avgSentimentScore = calculateAvgSentiment(result);
        setAvgSentiment(avgSentimentScore);
        socket.emit("subscribeToKeyword", keyword);
        setErrorMessage([]);
      } else {
        setTweets([]);
        setCount(0);
        setErrorMessage(result.message || "No tweets found.");
        console.error('Error:', result.message || 'No tweets found.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
    return () => {
      socket.off("newTweet");
    }
  };

  const generateChartData = (tweets) => {
    const data = {};

    tweets.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    tweets.forEach((tweet) => {
      const date = new Date(tweet.timestamp);
      const key =
        timeInterval === 'hourly'
          ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
          : `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      data[key] = (data[key] || 0) + 1;
    });

    const labels = Object.keys(data).sort();
    const values = labels.map((label) => data[label]);

    setChartData({
      labels,
      datasets: [
        {
          label: `Tweet Distribution (${timeInterval})`,
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const generateDailyChartData = (tweets) => {
    const dailyData = {};

    tweets.forEach((tweet) => {
      const date = new Date(tweet.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      dailyData[key] = (dailyData[key] || 0) + 1;
    });

    const labels = Object.keys(dailyData).sort();
    const values = labels.map((label) => dailyData[label]);

    setDailyChartData({
      labels,
      datasets: [
        {
          label: `Tweet Distribution (Daily)`,
          data: values,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const getSentimentColor = (avgSentiment) => {
    if (avgSentiment > 0.5) return '#4caf50';
    if (avgSentiment < -0.5) return '#f44336';
    return '#ff9800';
  };

  const sentimentData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        label: 'Poll',
        data: [avgSentiment > 0 ? avgSentiment : 0, avgSentiment < 0 ? -avgSentiment : 0],
        backgroundColor: [getSentimentColor(avgSentiment), getSentimentColor(avgSentiment)],
        borderColor: ['Green', 'Red'],
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const [tweetCount, setTweetCount] = useState(0);
  useEffect(() => {
    socket.on("newTweet", (newTweet) => {
      if (newTweet.text.toLowerCase().includes(keyword.toLowerCase())) {
        console.log("Received new relevant tweet:", newTweet);
  
        setTweets((prevTweets) => {
          const updatedTweets = [...prevTweets, newTweet]; 
          generateChartData(updatedTweets);
          generateDailyChartData(updatedTweets);
          const avgSentimentScore = calculateAvgSentiment(updatedTweets);
          setAvgSentiment(avgSentimentScore);
          setErrorMessage([]);
          return updatedTweets;
        });
  
        setTweetCount((prevCount) => prevCount + 1); 
      } else {
        console.log("Tweet ignored, does not match keyword:", newTweet);
      }
    }); 
  
    return () => {
      console.log("Cleaning up socket listener");
      socket.off("newTweet"); 
    };
  }, [keyword]);
  
  return (
    <>
    <Navbar/>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      <form onSubmit={handleSearch} style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search tweets..."
          style={{ width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#007BFF', color: '#fff' }}>
          Search
        </button>
      </form>
      {errorMessage && (
  <div style={{ color: "red", marginTop: "10px" }}>
    {errorMessage}
  </div>
)}
 
       <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
        <MapContainer
          center={[34.91285971911652, 32.89202341942484]}
          zoom={2.2}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {tweets.map((tweet) => {
            const coordinates = tweet.geo?.coordinates;
            if (coordinates && coordinates.length === 2) {
              return (
                <Marker
                  key={tweet._id}
                  position={[coordinates[1], coordinates[0]]}
                  icon={customIcon(tweet.sentimentScore)}
                >
                  <Popup>
                    <div>
                      <h3>Tweet ID: {tweet.tweet_id}</h3>
                      <p>{tweet.text}</p>
                      <p>
                        <strong>Time:</strong>{' '}
                        {new Date(tweet.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>


      <div style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
        <h3>Sentiment Gauge</h3>
        <div style={{ width: '250px', margin: '0 auto' }}>
          <Doughnut data={sentimentData} />
        </div>
        <p>Avg Sentiment: {avgSentiment.toFixed(2)}</p>
      </div>

   
      <div style={{ width: '100%', marginBottom: '20px', padding: '20px', borderRadius: '8px' }}>
  {count > 0 ? (
    <div className="container">
      <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Tweet Distribution</h3>
      <div className="d-flex justify-content-between">
        <div style={{ flex: 1, marginRight: '10px' }}>
          <h4 >Hourly Tweet Distribution</h4>
          <Bar data={chartData} />
        </div>
        <div style={{ flex: 1, marginLeft: '10px' }}>
          <h4 >Daily Tweet Distribution</h4>
          <Bar data={dailyChartData} />
        </div>
      </div>
    </div>
  ) : (
    <div style={{ textAlign: 'center', color: '#ffffff' }}>No data to display</div>
  )}
</div>

</div>
</>
  );
}

export default MapView;
