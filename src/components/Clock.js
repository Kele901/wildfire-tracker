import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const timeZones = {
    'UTC/GMT': [
      'UTC'
    ],
    'Americas': [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'America/Mexico_City',
      'America/Sao_Paulo',
      'America/Buenos_Aires',
      'America/Santiago'
    ],
    'Europe': [
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Amsterdam',
      'Europe/Moscow',
      'Europe/Istanbul'
    ],
    'Asia': [
      'Asia/Dubai',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Hong_Kong',
      'Asia/Singapore',
      'Asia/Seoul',
      'Asia/Bangkok',
      'Asia/Mumbai',
      'Asia/Jakarta',
      'Asia/Manila'
    ],
    'Pacific': [
      'Pacific/Auckland',
      'Pacific/Fiji',
      'Pacific/Honolulu',
      'Pacific/Guam'
    ],
    'Africa': [
      'Africa/Cairo',
      'Africa/Lagos',
      'Africa/Johannesburg',
      'Africa/Nairobi',
      'Africa/Casablanca'
    ],
    'Australia': [
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Brisbane',
      'Australia/Perth',
      'Australia/Adelaide'
    ]
  };

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
      hour12: !is24Hour,
      timeZone: selectedTimeZone
    };
    return time.toLocaleTimeString(undefined, options);
  };

  const formatDate = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: selectedTimeZone
    };
    return time.toLocaleDateString(undefined, options);
  };

  const getTimeZoneName = (timeZone) => {
    try {
      return new Intl.DateTimeFormat('en', {
        timeZoneName: 'short',
        timeZone: timeZone
      }).formatToParts(time).find(part => part.type === 'timeZoneName').value;
    } catch (e) {
      return timeZone;
    }
  };

  return (
    <div className="clock-container">
      <select 
        className="timezone-select"
        value={selectedTimeZone}
        onChange={(e) => setSelectedTimeZone(e.target.value)}
      >
        {Object.entries(timeZones).map(([region, zones]) => (
          <optgroup key={region} label={region}>
            {zones.map(zone => (
              <option key={zone} value={zone}>
                {zone.split('/')[1]?.replace('_', ' ') || zone} ({getTimeZoneName(zone)})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
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