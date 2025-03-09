import React, { useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMap, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import AdComponent from './AdComponent';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const InfoOverlay = ({ fire }) => {
  const startDate = new Date(fire.geometry[0].date);
  const today = new Date();
  const duration = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="fire-info">
      <h3>{fire.title}</h3>
      <div className="fire-details">
        <p><strong>Started:</strong> {startDate.toLocaleDateString()}</p>
        <p><strong>Duration:</strong> {duration} days</p>
        {fire.sources && (
          <p><strong>Source:</strong> {fire.sources.map(source => (
            <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
              {source.id}
            </a>
          )).join(', ')}</p>
        )}
        {fire.categories && (
          <p><strong>Categories:</strong> {fire.categories.map(cat => cat.title).join(', ')}</p>
        )}
        <p><strong>Coordinates:</strong> {fire.geometry[0].coordinates[1].toFixed(4)}°, {fire.geometry[0].coordinates[0].toFixed(4)}°</p>
      </div>
    </div>
  );
};

// Separate component for clickable fire locations
const FireMarkers = ({ fires }) => {
  return fires.map((fire) => {
    const coordinates = [
      fire.geometry[0].coordinates[1],
      fire.geometry[0].coordinates[0]
    ];
    
    const startDate = new Date(fire.geometry[0].date);
    const today = new Date();
    const daysSinceStart = Math.min(
      (today - startDate) / (1000 * 60 * 60 * 24),
      14
    );
    const circleRadius = Math.max(15000 - (daysSinceStart * 800), 3000);

    return (
      <Circle
        key={fire.id}
        center={coordinates}
        radius={circleRadius}
        eventHandlers={{
          click: (e) => {
            e.target.openPopup();
          }
        }}
        pathOptions={{
          fillColor: '#ff6b6b',
          fillOpacity: 0.15,
          color: '#ff8787',
          weight: 0.5
        }}
      >
        <Popup maxWidth={300} className="fire-popup">
          <InfoOverlay fire={fire} />
        </Popup>
      </Circle>
    );
  });
};

const HeatLayer = ({ points }) => {
  const map = useMap();

  const animateHeat = useCallback((heatLayer) => {
    if (!map || !heatLayer) return () => {};
    
    let frame;
    let phase = 0;
    let pulsePhase = 0;
    let wavePhase = 0;
    let colorPhase = 0;
    
    const animate = () => {
      // Slower animation speeds
      phase = (phase + 0.01) % (Math.PI * 2);
      pulsePhase = (pulsePhase + 0.02) % (Math.PI * 2);
      wavePhase = (wavePhase + 0.008) % (Math.PI * 2);
      colorPhase = (colorPhase + 0.005) % (Math.PI * 2);

      // Smaller radius variations
      const baseRadius = 12;
      const radiusVariation = Math.sin(phase) * 4;
      const pulseVariation = Math.sin(pulsePhase) * 2;
      const waveVariation = Math.cos(wavePhase * 2) * 1;
      const radius = baseRadius + radiusVariation + pulseVariation + waveVariation;

      const intensity = points.map(point => {
        const lat = point[0], lng = point[1];
        const uniquePhase = (phase + (lat + lng) * 0.1) % (Math.PI * 2);
        const distancePhase = Math.sin((lat * lng * 0.01 + phase) * 0.5);
        const waveEffect = Math.sin(wavePhase + lat * 0.1) * Math.cos(wavePhase + lng * 0.1);
        
        // Enhanced intensity calculation
        const intensityMultiplier = 
          0.7 + // base
          Math.sin(pulsePhase) * 0.15 + // global pulse
          Math.sin(uniquePhase) * 0.2 + // individual pulse
          distancePhase * 0.15 + // distance-based effect
          waveEffect * 0.2 + // wave pattern
          Math.cos(phase * 3) * 0.1; // rapid oscillation

        // Amplify the intensity differences
        const amplifiedIntensity = Math.pow(point[2], 1.5) * 
          Math.max(0.3, Math.min(1.2, intensityMultiplier));

        return [
          lat,
          lng,
          amplifiedIntensity
        ];
      });

      // Dynamic blur based on zoom and animation
      const zoom = map.getZoom();
      const baseBlur = Math.max(8, 15 - zoom);
      const animatedBlur = baseBlur + Math.sin(pulsePhase) * 2;

      // Enhanced color gradient with more distinct colors
      const gradient = {
        0.0: 'rgba(255,252,220,0)', // Very light yellow, transparent
        0.1: 'rgba(255,248,180,0.4)', // Light yellow
        0.2: 'rgba(255,243,140,0.5)', // Medium yellow
        0.3: 'rgba(255,236,127,0.6)', // Stronger yellow
        0.4: 'rgba(255,224,102,0.7)', // Yellow-orange
        0.5: 'rgba(255,183,77,0.75)', // Light orange
        0.6: 'rgba(255,152,66,0.8)', // Orange
        0.7: 'rgba(255,95,61,0.85)', // Orange-red
        0.8: 'rgba(225,45,45,0.9)', // Bright red
        0.9: 'rgba(190,30,30,0.95)', // Strong red
        1.0: 'rgba(150,20,20,1)' // Intense dark red
      };

      heatLayer.setLatLngs(intensity);
      heatLayer.setOptions({ 
        radius,
        blur: animatedBlur,
        gradient,
        minOpacity: 0.25 + Math.sin(pulsePhase) * 0.08,
        maxZoom: 18
      });

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [points, map]);

  useEffect(() => {
    if (!map) return;

    const checkMap = setInterval(() => {
      if (map.getSize().x > 0) {
        clearInterval(checkMap);
        
        const heat = L.heatLayer(points, {
          radius: 12,
          blur: 12,
          maxZoom: 18,
          max: 0.8,
          minOpacity: 0.25,
          gradient: {
            0.0: 'rgba(255,252,220,0)', // Very light yellow, transparent
            0.1: 'rgba(255,248,180,0.4)', // Light yellow
            0.2: 'rgba(255,243,140,0.5)', // Medium yellow
            0.3: 'rgba(255,236,127,0.6)', // Stronger yellow
            0.4: 'rgba(255,224,102,0.7)', // Yellow-orange
            0.5: 'rgba(255,183,77,0.75)', // Light orange
            0.6: 'rgba(255,152,66,0.8)', // Orange
            0.7: 'rgba(255,95,61,0.85)', // Orange-red
            0.8: 'rgba(225,45,45,0.9)', // Bright red
            0.9: 'rgba(190,30,30,0.95)', // Strong red
            1.0: 'rgba(150,20,20,1)' // Intense dark red
          }
        }).addTo(map);

        const cleanup = animateHeat(heat);

        return () => {
          cleanup();
          map.removeLayer(heat);
        };
      }
    }, 100);

    return () => clearInterval(checkMap);
  }, [map, points, animateHeat]);

  return null;
};

const WeatherOverlay = ({ fires }) => {
  const [weatherData, setWeatherData] = useState({});
  const [selectedFire, setSelectedFire] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async (lat, lon) => {
      try {
        const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
        
        // Add debug logging
        console.log('Environment:', process.env.NODE_ENV);
        console.log('API Key exists:', !!apiKey);
        console.log('API Key length:', apiKey ? apiKey.length : 0);
        
        if (!apiKey) {
          console.error('API Key missing. Current environment:', process.env.NODE_ENV);
          setError('OpenWeatherMap API key is not configured. Please check the environment variables.');
          return;
        }

        // Fetch current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        
        if (!currentResponse.ok) {
          const errorData = await currentResponse.json();
          throw new Error(`Weather API Error: ${errorData.message || 'Weather data fetch failed'} (Status: ${currentResponse.status})`);
        }
        const currentData = await currentResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        if (!forecastResponse.ok) {
          const errorData = await forecastResponse.json();
          throw new Error(`Forecast API Error: ${errorData.message || 'Forecast data fetch failed'} (Status: ${forecastResponse.status})`);
        }
        const forecastData = await forecastResponse.json();

        // Combine the data
        setWeatherData({
          current: {
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            wind_speed: currentData.wind.speed,
            wind_deg: currentData.wind.deg,
            weather: currentData.weather,
            visibility: currentData.visibility,
          },
          daily: forecastData.list.filter((item, index) => index % 8 === 0).map(day => ({
            dt: day.dt,
            temp: {
              min: day.main.temp_min,
              max: day.main.temp_max
            },
            humidity: day.main.humidity,
            wind_speed: day.wind.speed,
            weather: day.weather,
            rain: day.rain ? day.rain['3h'] : 0
          }))
        });
        
        setError(null);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError(`Failed to fetch weather data: ${error.message}. Please check your API key configuration.`);
      }
    };

    if (selectedFire) {
      const coords = selectedFire.geometry[0].coordinates;
      fetchWeatherData(coords[1], coords[0]);
    }
  }, [selectedFire]);

  const getWeatherIcon = (code) => {
    if (code >= 200 && code < 300) return '⛈️';  // Thunderstorm
    if (code >= 300 && code < 400) return '🌧️';  // Drizzle
    if (code >= 500 && code < 600) return '🌧️';  // Rain
    if (code >= 600 && code < 700) return '❄️';  // Snow
    if (code >= 700 && code < 800) return '🌫️';  // Atmosphere
    if (code === 800) return '☀️';               // Clear
    return '☁️';                                 // Clouds
  };

  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const getUVIndexLevel = (uvi) => {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <div className="weather-overlay">
      <h3>Weather Conditions</h3>
      <div className="weather-selector">
        <select 
          onChange={(e) => setSelectedFire(fires.find(f => f.id === e.target.value))}
          value={selectedFire?.id || ''}
        >
          <option value="">Select a fire location</option>
          {fires.map(fire => (
            <option key={fire.id} value={fire.id}>
              {fire.title}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <div className="weather-error">
          {error}
        </div>
      )}
      
      {weatherData.current && !error && (
        <>
          <div className="current-weather">
            <div className="current-main">
              <div className="temp-main">
                {Math.round(weatherData.current.temp)}°C
                <span className="feels-like">
                  Feels like {Math.round(weatherData.current.feels_like)}°C
                </span>
              </div>
              <div className="weather-icon-large">
                {getWeatherIcon(weatherData.current.weather[0].id)}
                <span className="weather-desc">
                  {weatherData.current.weather[0].description}
                </span>
              </div>
            </div>
            <div className="current-details">
              <div className="detail-item">
                <span>💨 Wind</span>
                <span>{Math.round(weatherData.current.wind_speed)} m/s {getWindDirection(weatherData.current.wind_deg)}</span>
              </div>
              <div className="detail-item">
                <span>💧 Humidity</span>
                <span>{weatherData.current.humidity}%</span>
              </div>
              <div className="detail-item">
                <span>☀️ UV Index</span>
                <span>{Math.round(weatherData.current.uvi)} ({getUVIndexLevel(weatherData.current.uvi)})</span>
              </div>
              <div className="detail-item">
                <span>👁️ Visibility</span>
                <span>{(weatherData.current.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          </div>
          
          <div className="forecast-title">8-Day Forecast</div>
          <div className="weather-forecast">
            {weatherData.daily.slice(0, 8).map((day, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-date">
                  {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.weather[0].id)}
                </div>
                <div className="forecast-temp">
                  <span className="high">{Math.round(day.temp.max)}°</span>
                  <span className="low">{Math.round(day.temp.min)}°</span>
                </div>
                <div className="forecast-details">
                  <span>💨 {Math.round(day.wind_speed)} m/s</span>
                  <span>💧 {day.humidity}%</span>
                  {day.rain && <span>🌧️ {day.rain} mm</span>}
                </div>
                <div className="forecast-desc">
                  {day.weather[0].description}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const StatsOverlay = ({ fires }) => {
  const [showCountryDetails, setShowCountryDetails] = React.useState(false);
  const [trendPeriod, setTrendPeriod] = React.useState('week'); // 'week', 'month', 'year'

  // Calculate dates for different periods
  const today = new Date();
  const oneWeekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
  const twoMonthsAgo = new Date(today.setMonth(today.getMonth() - 2));
  const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
  const twoYearsAgo = new Date(today.setFullYear(today.getFullYear() - 2));

  // Calculate basic stats
  const totalFires = fires.length;
  const activeFires = fires.filter(fire => {
    const startDate = new Date(fire.geometry[0].date);
    return (today - startDate) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  // Create detailed country statistics with multiple trend periods
  const countryStats = fires.reduce((acc, fire) => {
    const title = fire.title;
    const country = title.split(', ').pop();
    const startDate = new Date(fire.geometry[0].date);

    // Initialize country data
    if (!acc[country]) {
      acc[country] = {
        total: 0,
        active: 0,
        lastWeek: 0,
        twoWeeksAgo: 0,
        lastMonth: 0,
        twoMonthsAgo: 0,
        lastYear: 0,
        twoYearsAgo: 0,
        oldest: startDate,
        newest: startDate,
        trends: {
          weekly: 0,
          monthly: 0,
          yearly: 0
        }
      };
    }

    // Update counts for different periods
    acc[country].total += 1;
    if ((today - startDate) / (1000 * 60 * 60 * 24) <= 7) acc[country].active += 1;
    if (startDate >= oneWeekAgo) acc[country].lastWeek += 1;
    if (startDate >= twoWeeksAgo && startDate < oneWeekAgo) acc[country].twoWeeksAgo += 1;
    if (startDate >= oneMonthAgo) acc[country].lastMonth += 1;
    if (startDate >= twoMonthsAgo && startDate < oneMonthAgo) acc[country].twoMonthsAgo += 1;
    if (startDate >= oneYearAgo) acc[country].lastYear += 1;
    if (startDate >= twoYearsAgo && startDate < oneYearAgo) acc[country].twoYearsAgo += 1;

    // Update date range
    if (startDate < acc[country].oldest) acc[country].oldest = startDate;
    if (startDate > acc[country].newest) acc[country].newest = startDate;

    return acc;
  }, {});

  // Calculate trends for all countries
  Object.values(countryStats).forEach(stats => {
    stats.trends = {
      weekly: stats.twoWeeksAgo === 0 
        ? 100 
        : ((stats.lastWeek - stats.twoWeeksAgo) / stats.twoWeeksAgo) * 100,
      monthly: stats.twoMonthsAgo === 0 
        ? 100 
        : ((stats.lastMonth - stats.twoMonthsAgo) / stats.twoMonthsAgo) * 100,
      yearly: stats.twoYearsAgo === 0 
        ? 100 
        : ((stats.lastYear - stats.twoYearsAgo) / stats.twoYearsAgo) * 100
    };
  });

  // Sort countries by total fires
  const sortedCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b.total - a.total);

  const TrendIndicator = ({ trends }) => {
    const currentTrend = trends[trendPeriod === 'week' ? 'weekly' : trendPeriod === 'month' ? 'monthly' : 'yearly'];
    
    const getArrow = (trend) => {
      if (trend > 0) return '▲';
      if (trend < 0) return '▼';
      return '►';
    };

    const getColor = (trend) => {
      if (trend > 0) return '#ff4444';
      if (trend < 0) return '#44bb44';
      return '#888888';
    };

    return (
      <span 
        className="trend-indicator" 
        style={{ 
          color: getColor(currentTrend),
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span className="trend-arrow">{getArrow(currentTrend)}</span>
        <span>{Math.abs(currentTrend).toFixed(0)}%</span>
      </span>
    );
  };

  return (
    <div className="stats-overlay">
      <div className="stats-basic">
        <div className="stat-item">
          <h3>Total Fires</h3>
          <div className="stat-number">{totalFires}</div>
        </div>
        <div className="stat-item">
          <h3>Active Fires</h3>
          <div className="stat-number">{activeFires}</div>
          <div className="stat-subtitle">Last 7 days</div>
        </div>
        <div className="stat-item" 
          onClick={() => setShowCountryDetails(!showCountryDetails)}
          style={{ cursor: 'pointer' }}
        >
          <h3>Countries Affected</h3>
          <div className="stat-number">{Object.keys(countryStats).length}</div>
          <div className="stat-subtitle">Click for details</div>
        </div>
      </div>
      
      {/* Add vertical ad in stats overlay */}
      <AdComponent 
        slot="vertical-ad-slot" 
        format="vertical"
        responsive={false}
        style={{ width: '300px', height: '250px' }}
      />
      
      <WeatherOverlay fires={fires} />
      {showCountryDetails && (
        <div className="country-details">
          <div className="trend-period-selector">
            <button 
              className={trendPeriod === 'week' ? 'active' : ''} 
              onClick={() => setTrendPeriod('week')}
            >
              Weekly
            </button>
            <button 
              className={trendPeriod === 'month' ? 'active' : ''} 
              onClick={() => setTrendPeriod('month')}
            >
              Monthly
            </button>
            <button 
              className={trendPeriod === 'year' ? 'active' : ''} 
              onClick={() => setTrendPeriod('year')}
            >
              Yearly
            </button>
          </div>
          <div className="country-list">
            {sortedCountries.map(([country, stats]) => (
              <div key={country} className="country-item">
                <div className="country-header">
                  <div className="country-name">{country}</div>
                  <TrendIndicator trends={stats.trends} />
                </div>
                <div className="country-stats">
                  <span className="total">Total: {stats.total}</span>
                  <span className="active">Active: {stats.active}</span>
                  <span className="weekly">
                    {trendPeriod === 'week' 
                      ? `Last 7 days: ${stats.lastWeek}`
                      : trendPeriod === 'month'
                      ? `Last month: ${stats.lastMonth}`
                      : `Last year: ${stats.lastYear}`
                    }
                  </span>
                  <span className="date-range">
                    {stats.newest.toLocaleDateString()} - {stats.oldest.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Map = ({ fires }) => {
  const points = fires.map(fire => {
    const fireDate = new Date(fire.geometry[0].coordinates[2] || fire.geometry[0].date);
    const today = new Date();
    const daysSinceStart = Math.min(
      (today - fireDate) / (1000 * 60 * 60 * 24),
      14
    );
    const intensity = Math.max(1 - (daysSinceStart / 14), 0.3);

    return [
      fire.geometry[0].coordinates[1],
      fire.geometry[0].coordinates[0],
      intensity
    ];
  });

  return (
    <>
      {/* Top horizontal ad */}
      <AdComponent 
        slot="horizontal-top-ad-slot"
        format="horizontal"
        style={{ height: '90px', marginBottom: '20px' }}
      />

      <div style={{ width: '100%', height: '90vh', position: 'relative' }}>
        <MapContainer 
          center={[20, 0]} 
          zoom={3} 
          style={{ height: '100%', width: '100%' }}
          minZoom={2}
          maxZoom={18}
          whenCreated={(map) => {
            map.invalidateSize();
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <HeatLayer points={points} />
          <FireMarkers fires={fires} />
        </MapContainer>
        <StatsOverlay fires={fires} />
      </div>

      {/* Bottom horizontal ad */}
      <AdComponent 
        slot="horizontal-bottom-ad-slot"
        format="horizontal"
        style={{ height: '90px', marginTop: '20px' }}
      />
    </>
  );
};

export default Map;