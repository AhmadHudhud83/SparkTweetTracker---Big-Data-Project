import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function MapView() {
  const [tweets, setTweets] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(0);
  const [chartData, setChartData] = useState({});
  const [dailyChartData, setDailyChartData] = useState({});
  const [timeInterval] = useState('hourly');
  const [avgSentiment, setAvgSentiment] = useState(0);

  const customIcon = new L.Icon({
    iconUrl: require('../images/icon.png'),
    iconSize: [25, 30],
    iconAnchor: [17.5, 45],
    popupAnchor: [0, -45],
  });

  const calculateAvgSentiment = (tweets) => {
    const totalSentiment = tweets.reduce((sum, tweet) => sum + tweet.sentimentScore, 0);
    return totalSentiment / tweets.length;
  };

  const handleSearch = async (e) => {
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
      } else {
        setTweets([]);
        setCount(0);
        console.error('Error:', result.message || 'No tweets found.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* search */}
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
       {/* map */}
       <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
        <MapContainer
          center={[32.806671, -86.79113]}
          zoom={5}
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
                  icon={customIcon}
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

      {/* feel*/}
      <div style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
        <h3>Sentiment Gauge</h3>
        <div style={{ width: '250px', margin: '0 auto' }}>
          <Doughnut data={sentimentData} />
        </div>
        <p>Avg Sentiment: {avgSentiment.toFixed(2)}</p>
      </div>

      {/* histogram*/}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        {count > 0 ? (
          <>
            <h3>Hourly Tweet Distribution</h3>
            <Bar data={chartData} />
            <h3>Daily Tweet Distribution</h3>
            <Bar data={dailyChartData} />
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>No data to display</div>
        )}
      </div>
    </div>
  );
}

export default MapView;
