import React from 'react';
import Clock from './Clock';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Wildfire Tracker</h1>
          <p>Powered by NASA EONET and OpenWeatherMap</p>
        </div>
        <Clock />
      </div>
    </header>
  );
};

export default Header; 