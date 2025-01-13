import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour
    };
    return time.toLocaleTimeString(undefined, options);
  };

  const formatDate = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return time.toLocaleDateString(undefined, options);
  };

  return (
    <div className="clock-container">
      <div className="clock-time" onClick={() => setIs24Hour(!is24Hour)}>
        {formatTime()}
      </div>
      <div className="clock-date">
        {formatDate()}
      </div>
    </div>
  );
};

export default Clock; 