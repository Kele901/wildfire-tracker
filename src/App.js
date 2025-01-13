import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Loader from './components/Loader';
import Header from './components/Header';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [fires, setFires] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <Header />
      {loading ? <Loader /> : <Map fires={fires} />}
    </div>
  );
}

export default App; 