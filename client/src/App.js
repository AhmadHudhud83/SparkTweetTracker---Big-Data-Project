import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [tweets, setTweets] = useState([]); 

  
  const customIcon = new L.Icon({
    iconUrl: require('./images/icon.png'), 
    iconSize: [25, 30],
    iconAnchor: [17.5, 45],
    popupAnchor: [0, -45],
  });

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/tweets');
        const result = await response.json();
        setTweets(result); 
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <MapContainer center={[32.806671, -86.791130]} zoom={5} style={{ width: '100%', height: '100vh' }}>
      <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        
        {tweets.map((tweet) => {
          const coordinates = tweet.geo_location?.coordinates;
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
                    <p><strong>Time:</strong> {new Date(tweet.timestamp).toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}

export default App;
