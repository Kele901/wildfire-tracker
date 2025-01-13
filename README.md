# Wildfire Tracker

A React application that tracks wildfires globally using NASA's EONET API and provides weather information for fire locations using OpenWeatherMap API.

## Features

- Real-time wildfire tracking using NASA EONET API
- Interactive heat map visualization
- Weather information for fire locations
- Detailed statistics including:
  - Total fires
  - Active fires
  - Countries affected
  - Trend analysis
- Responsive design for mobile and desktop

## Technologies Used

- React
- Leaflet for mapping
- OpenWeatherMap API for weather data
- NASA EONET API for wildfire data

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

## Environment Variables

- `REACT_APP_OPENWEATHER_API_KEY`: Your OpenWeatherMap API key

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 