import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Loader from './components/Loader';
import Header from './components/Header';
import AdSense from './components/AdSense';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [fires, setFires] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1726759813423594';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    const fetchFires = async () => {
      try {
        const response = await fetch(
          'https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&days=30'
        );
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setFires(data.events);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fire data:', error);
        setError('Failed to load wildfire data');
        setLoading(false);
      }
    };

    fetchFires();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchFires, 300000);
    return () => {
      clearInterval(interval);
      // Clean up script
      document.head.removeChild(script);
    };
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <Header />
      <div className="ad-banner-top">
        <AdSense
          adSlot="4834833787"
          style={{ display: 'block', textAlign: 'center' }}
        />
      </div>
      {loading ? <Loader /> : <Map fires={fires} />}
      <div className="ad-banner-bottom">
        <AdSense
          adSlot="4834833787"
          style={{ display: 'block', textAlign: 'center' }}
        />
      </div>
    </div>
  );
}

export default App; 