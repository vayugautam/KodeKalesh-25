# API Integration Documentation

## 🔌 Backend API Connection

### API Configuration

The application is configured to connect to your backend API at:
- **Base URL**: `http://localhost:3000/api` (configurable in `.env`)
- **Timeout**: 15 seconds
- **Auth**: Bearer token support (stored in localStorage)

### Environment Variables

Create a `.env` file with:
```bash
VITE_WEATHER_API_BASE_URL=http://localhost:3000/api
```

## 📡 API Endpoints

### Weather Endpoints

#### 1. Get Current Weather
```
GET /api/weather/current?lat={lat}&lon={lon}
```

**Response:**
```json
{
  "temperature": 28,
  "humidity": 65,
  "windSpeed": 12,
  "condition": "Partly Cloudy",
  "pressure": 1013,
  "timestamp": "2025-11-13T12:00:00Z"
}
```

#### 2. Get Weather Forecast
```
GET /api/weather/forecast?lat={lat}&lon={lon}&days={days}
```

#### 3. Get Bulk Weather
```
POST /api/weather/bulk
Body: { locations: [{lat, lon}, ...] }
```

### Risk Assessment Endpoints

#### 1. Get Risk Assessment
```
GET /api/risk/assessment?lat={lat}&lon={lon}
```

**Response:**
```json
{
  "level": "high",
  "score": 0.85,
  "description": "High flood risk due to heavy rainfall",
  "factors": ["Heavy Rainfall", "Low Elevation", "Poor Drainage"]
}
```

#### 2. Get Risk Alerts
```
GET /api/risk/alerts?region={region}
```

#### 3. Get Risk Zones
```
GET /api/risk/zones
```

**Response:**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Zone A",
      "coordinates": [[lat, lon], ...],
      "riskLevel": "high",
      "type": "flood"
    }
  ]
}
```

#### 4. Get Risk Statistics
```
GET /api/risk/statistics
```

**Response:**
```json
{
  "totalLocations": 50,
  "highRiskCount": 5,
  "mediumRiskCount": 15,
  "lowRiskCount": 30
}
```

### Location Endpoints

#### 1. Get All Locations
```
GET /api/locations
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "New Delhi",
    "region": "North",
    "lat": 28.6139,
    "lon": 77.2090,
    "status": "active",
    "riskLevel": "low"
  }
]
```

#### 2. Search Locations
```
GET /api/locations/search?q={query}
```

## 🎣 Custom Hooks

### Weather Hooks

```jsx
import { useWeather, useForecast } from './hooks/useWeather'

// Get current weather
const { data, loading, error, refetch } = useWeather(lat, lon)

// Get forecast
const { data, loading, error } = useForecast(lat, lon, 7)
```

### Risk Hooks

```jsx
import { useRiskAssessment, useRiskZones, useRiskStatistics } from './hooks/useRisk'

// Get risk assessment
const { data, loading, error, refetch } = useRiskAssessment(lat, lon)

// Get all risk zones
const { data, loading, error } = useRiskZones()

// Get risk statistics
const { data, loading, error } = useRiskStatistics()
```

### Location Hooks

```jsx
import { useLocations, useLocationSearch } from './hooks/useLocations'

// Get all locations
const { data, loading, error, refetch } = useLocations()

// Search locations
const { data, loading, error } = useLocationSearch(searchQuery)
```

## 🔐 Authentication

If your API requires authentication, the app will:
1. Look for a token in `localStorage.getItem('api_token')`
2. Add it to all requests as `Authorization: Bearer {token}`

To set a token:
```javascript
localStorage.setItem('api_token', 'your-token-here')
```

## ⚠️ Error Handling

The app includes comprehensive error handling:
- **Network errors**: Shows error snackbar, falls back to placeholder data
- **404 errors**: Logged to console
- **401 errors**: Clears token, can redirect to login
- **Timeout**: 15-second timeout for all requests

## 🧪 Testing Without Backend

The app will work without a backend:
- Falls back to placeholder data on API errors
- Shows warning messages when API is unavailable
- All UI features remain functional

## 📊 Data Flow

1. **Page Load** → Fetch locations and risk zones
2. **Location Click** → Open dialog, fetch weather & risk for that location
3. **Search** → Debounced search API call (300ms delay)
4. **Auto-refresh** → Hooks automatically refetch on dependency changes

## 🚀 Quick Start

1. Set environment variables in `.env`
2. Start your backend API on `http://localhost:3000`
3. Run the app: `npm run dev`
4. The app will automatically connect to your API

## 📝 API Service Files

- `src/utils/weatherApi.js` - Axios instance & API methods
- `src/hooks/useWeather.js` - Weather data hooks
- `src/hooks/useRisk.js` - Risk assessment hooks
- `src/hooks/useLocations.js` - Location data hooks
