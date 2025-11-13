# Open-Meteo Weather API Integration

## Overview
This project now uses the **Open-Meteo Global Weather Forecast API** to fetch real-time weather data for fire risk assessment.

🌐 **API Documentation**: https://open-meteo.com/en/docs

## API Endpoint
```
https://api.open-meteo.com/v1/forecast
```

## Features

### ✅ Implemented

1. **Current Weather Data**
   - Temperature (°C)
   - Humidity (%)
   - Wind Speed (km/h)
   - Wind Direction (degrees)
   - Weather Code

2. **Hourly Forecast**
   - Up to 16 days forecast
   - Hourly temperature and humidity
   - Precipitation probability
   - Wind conditions

3. **Fire Risk Calculation**
   - Automatic risk assessment based on:
     - Temperature (higher = more risk)
     - Humidity (lower = more risk)
     - Wind Speed (higher = more risk)
   - Risk score: 0-100
   - Risk levels: Low, Moderate, High, Critical

## Usage

### Using the Custom Hook

```javascript
import { useOpenMeteoWeather } from '../hooks/useOpenMeteoWeather'

function MyComponent() {
  const { data, loading, error } = useOpenMeteoWeather(lat, lon)
  
  if (loading) return <div>Loading weather data...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <p>Temperature: {data.current.temperature}°C</p>
      <p>Humidity: {data.current.humidity}%</p>
      <p>Risk Score: {data.risk.score}/100</p>
      <p>Risk Level: {data.risk.level}</p>
    </div>
  )
}
```

### Direct API Usage

```javascript
import { getCurrentWeather, getForecast } from '../utils/openMeteoApi'

// Get current weather
const weather = await getCurrentWeather(22.5937, 78.9629)

// Get 7-day forecast
const forecast = await getForecast(22.5937, 78.9629, 7)
```

## API Parameters

### Current Weather
- `latitude`: Location latitude
- `longitude`: Location longitude
- `current`: Comma-separated list of weather variables
- `timezone`: "auto" for automatic timezone detection

### Available Weather Variables

**Current:**
- `temperature_2m` - Temperature at 2 meters
- `relative_humidity_2m` - Relative humidity
- `wind_speed_10m` - Wind speed at 10 meters
- `wind_direction_10m` - Wind direction
- `weather_code` - WMO weather code

**Hourly:**
- `temperature_2m`
- `relative_humidity_2m`
- `precipitation_probability`
- `precipitation`
- `wind_speed_10m`
- `wind_gusts_10m`

**Daily:**
- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_sum`
- `wind_speed_10m_max`
- `sunrise`
- `sunset`

## Fire Risk Calculation

The risk score is calculated using this formula:

```javascript
Risk Score = Temperature Factor + Humidity Factor + Wind Factor

Temperature Factor:
- > 35°C: +40 points
- > 30°C: +30 points
- > 25°C: +20 points
- else: +10 points

Humidity Factor:
- < 20%: +40 points
- < 40%: +30 points
- < 60%: +20 points
- else: +10 points

Wind Speed Factor:
- > 30 km/h: +20 points
- > 20 km/h: +15 points
- > 10 km/h: +10 points
- else: +5 points

Risk Levels:
- 0-39: Low (Green)
- 40-59: Moderate (Orange)
- 60-79: High (Red)
- 80-100: Critical (Dark Red)
```

## Features in the Dashboard

### Weather Info Panel (Bottom)
Shows real-time weather data when a fire location is selected:
- ✅ **Temperature** - From Open-Meteo API
- ✅ **Humidity** - From Open-Meteo API
- ✅ **Wind Speed & Direction** - From Open-Meteo API
- 📊 Slope - Static data (to be integrated later)
- 🌳 Vegetation - Static data (to be integrated later)

### Right Sidebar
- **Current Risk Score** - Calculated from real weather data
- **Timeline Predictions** - Risk projections for 2h, 4h, 6h, 12h, 18h, 24h
- **Danger Level Indicator** - Color-coded based on risk score

### Map Visualization
- **Heatmap Layer** - Intensity increases based on timeline and risk
- **Timeline Badge** - Shows current prediction time and risk level

## API Limits

**Free Tier (No API Key Required):**
- ✅ 10,000 API calls per day
- ✅ 5,000 API calls per hour
- ✅ Non-commercial use allowed
- ✅ No API key needed

**Rate Limits:**
- If exceeded, the API returns HTTP 429 (Too Many Requests)
- Implement caching to reduce API calls
- Use bulk requests when possible

## Error Handling

```javascript
try {
  const weather = await getCurrentWeather(lat, lon)
  // Use weather data
} catch (error) {
  if (error.response?.status === 429) {
    console.error('Rate limit exceeded')
  } else if (error.response?.status === 400) {
    console.error('Invalid coordinates')
  } else {
    console.error('API Error:', error.message)
  }
  // Fallback to dummy data
}
```

## Example API Response

```json
{
  "current": {
    "temperature_2m": 28.5,
    "relative_humidity_2m": 65,
    "wind_speed_10m": 12.3,
    "wind_direction_10m": 135,
    "weather_code": 0,
    "time": "2025-11-13T19:00"
  },
  "hourly": {
    "time": ["2025-11-13T00:00", "2025-11-13T01:00", ...],
    "temperature_2m": [25.2, 24.8, ...],
    "relative_humidity_2m": [68, 70, ...],
    "wind_speed_10m": [10.5, 11.2, ...]
  },
  "daily": {
    "time": ["2025-11-13", "2025-11-14", ...],
    "temperature_2m_max": [32.5, 33.1, ...],
    "temperature_2m_min": [22.3, 23.5, ...]
  }
}
```

## Weather Codes

| Code | Description |
|------|-------------|
| 0 | Clear sky |
| 1-3 | Mainly clear, partly cloudy, overcast |
| 45, 48 | Fog |
| 51-55 | Drizzle |
| 61-65 | Rain |
| 71-75 | Snow |
| 80-82 | Rain showers |
| 95-99 | Thunderstorm |

## Next Steps

### To Integrate Your Backend:
1. Replace Open-Meteo calls with your backend API
2. Update `src/utils/weatherApi.js` with your endpoints
3. Keep the same data structure for compatibility
4. Add authentication if required

### Recommended Enhancements:
- ✅ Add caching to reduce API calls
- ✅ Implement hourly forecast charts
- ✅ Add historical weather comparison
- ✅ Integrate terrain/slope data from backend
- ✅ Add vegetation type from satellite imagery

## Files Modified

- ✅ `src/utils/openMeteoApi.js` - Open-Meteo API service
- ✅ `src/hooks/useOpenMeteoWeather.js` - Custom React hooks
- ✅ `src/pages/MapPage.jsx` - Integrated weather data
- ✅ `src/components/WeatherInfoPanel.jsx` - Display real weather
- ✅ `src/components/RightSidebar.jsx` - Risk calculation

## Resources

- 📚 [Open-Meteo Documentation](https://open-meteo.com/en/docs)
- 🌍 [API Playground](https://open-meteo.com/en/docs#api_form)
- 📊 [Weather Variables](https://open-meteo.com/en/docs#weathervariables)
- 🔧 [API FAQ](https://open-meteo.com/en/faq)

---

**Note:** The Open-Meteo API is free and doesn't require an API key. It's perfect for development and testing. For production, consider caching responses and implementing rate limiting.
