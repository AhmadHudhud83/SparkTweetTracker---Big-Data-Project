import React from 'react';
import MapView from './components/MapView';
import Startpage from './components/Startpage.js';
import { Routes, Route } from "react-router-dom"; 


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Startpage />} /> 
      <Route path="/mapview" element={<MapView />} /> 
    </Routes>
  );
};

export default App;