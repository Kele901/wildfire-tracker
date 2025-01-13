# Wildfire Tracker

A React application that tracks wildfires globally using NASA's EONET API and provides weather information for fire locations using OpenWeatherMap API.

## Features

- Real-time wildfire tracking using NASA EONET API
- Interactive heat map visualization
- Weather information for fire locations
- Global time zone support:
  - Multiple regions covered (Americas, Europe, Asia, Pacific, Africa, Australia)
  - Real-time clock with date display
  - Toggle between 12/24 hour format
  - Easy time zone switching via dropdown
- Detailed statistics including:
  - Total fires
  - Active fires
  - Countries affected
  - Trend analysis
- Responsive design for mobile and desktop

## Time Zones Supported

The application includes time zones for major cities across different regions:

- **Americas**: New York, Chicago, Denver, Los Angeles, Toronto, Vancouver, Mexico City, São Paulo, Buenos Aires, Santiago
- **Europe**: London, Paris, Berlin, Rome, Madrid, Amsterdam, Moscow, Istanbul
- **Asia**: Dubai, Tokyo, Shanghai, Hong Kong, Singapore, Seoul, Bangkok, Mumbai, Jakarta, Manila
- **Pacific**: Auckland, Fiji, Honolulu, Guam
- **Africa**: Cairo, Lagos, Johannesburg, Nairobi, Casablanca
- **Australia**: Sydney, Melbourne, Brisbane, Perth, Adelaide
- **UTC/GMT**: Universal Time Coordinated

## Technologies Used

- React
- Leaflet for mapping
- OpenWeatherMap API for weather data
- NASA EONET API for wildfire data
- Intl API for time zone handling

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Kele901/wildfire-tracker.git
cd wildfire-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
```
REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

## Usage

- View active wildfires on the interactive heat map
- Click on fire locations to view detailed information
- Use the time zone dropdown to view times in different regions
- Click on the time display to toggle between 12/24 hour format
- View weather conditions for fire locations
- Track fire statistics and trends

## Environment Variables

- `REACT_APP_OPENWEATHER_API_KEY`: Your OpenWeatherMap API key

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 