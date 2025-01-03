import React from "react";
import "./Startpage.css"; 
import videoSrc from "../images/explore.mp4";
import { useNavigate } from "react-router-dom";

const Startpage = () => {
    const navigate = useNavigate();

const handleClick = () => {
    navigate('/mapview');
  };

  return (
     <section className="showcase">
      <video src={videoSrc} loop autoPlay muted></video>
      <div className="overlay"></div>
      <div className="text" style={{ textAlign: 'center' }}>
  <div className="mapinfo">
    <h1 className="text-capitalize" style={{ fontWeight: 'Bold', fontSize: '40px' }}>
      Welcome to Maplytics WEB!
    </h1>
    <br />
    <h4 style={{ fontWeight: 'normal', fontSize: '23px',textAlign: 'center' }}>
      Discover the power of data analysis through interactive maps.
      
      Our platform lets you visualize trends, analyze tweets,
    
      and explore data in ways that bring real-time insights right to your fingertips.
    </h4>
    <br />
    <button onClick={handleClick} style={{
      backgroundColor: 'white', 
      color: '#09155c', 
      border: '2px solidrgb(0, 0, 0)', 
      padding: '15px 30px', 
      borderRadius: '8px', 
      fontSize: '18px', 
      cursor: 'pointer', 
      transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
    }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = '#09155c';
        e.target.style.color = 'white';
        e.target.style.borderColor = '#09155c';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.color = '#09155c';
        e.target.style.borderColor = '#09155c';
      }}
    >
      Get Started
    </button>
  </div>
</div>
      
    </section> 
  );
};

export default Startpage;
