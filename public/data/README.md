# Dummy Data Files - Backend Integration Guide

This directory contains dummy JSON files that serve as placeholders for backend API endpoints. These files follow RESTful patterns and can be easily replaced with actual backend calls.

## Files Overview

### 1. `fireLocations.json`
**Purpose:** Active fire location data with real-time metrics

**Structure:**
```json
{
  "fireLocations": [
    {
      "id": "f1",
      "position": [lat, lon],
      "name": "Fire Zone Name",
      "region": "Region Name",
      "intensity": "low|medium|high|critical",
      "riskScore": 0-100,
      "temperature": number,
      "humidity": number,
      "windSpeed": number,
      "windDirection": 0-360,
      "coordinates": { "lat": number, "lon": number },
      "detectedAt": "ISO 8601 timestamp",
      "status": "active|contained|extinguished",
      "spreadRate": "slow|moderate|fast|rapid",
      "affectedArea": number (km²)
    }
  ],
  "metadata": {
    "lastUpdated": "ISO 8601 timestamp",
    "totalActive": number,
    "totalCritical": number,
    "dataSource": "string",
    "updateFrequency": "string"
  }
}
```

**Backend Endpoint:** `GET /api/fires/active`

---

### 2. `riskZones.json`
**Purpose:** Geographic risk zone polygons with population data

**Structure:**
```json
{
  "riskZones": {
    "low": [{ zone data }],
    "medium": [{ zone data }],
    "high": [{ zone data }]
  },
  "metadata": {
    "lastUpdated": "ISO 8601 timestamp",
    "totalZones": number,
    "coverageArea": number (km²),
    "dataSource": "string"
  }
}
```

**Each zone:**
```json
{
  "id": "string",
  "name": "string",
  "coordinates": [[lat, lon], ...],  // Polygon array
  "riskLevel": "low|medium|high",
  "riskScore": 0-100,
  "population": number,
  "forestCoverage": number (%)
}
```

**Backend Endpoint:** `GET /api/risk-zones`

---

### 3. `weatherData.json`
**Purpose:** Weather forecast data for all fire locations

**Structure:**
```json
{
  "weatherData": [
    {
      "locationId": "f1",
      "location": "Location Name",
      "coordinates": { "lat": number, "lon": number },
      "current": {
        "temperature": number,
        "humidity": number,
        "windSpeed": number,
        "windDirection": 0-360,
        "weatherDescription": "string"
        // ... more fields
      },
      "forecast": {
        "nextHour": { ... },
        "next6Hours": { ... },
        "next24Hours": { ... }
      }
    }
  ],
  "metadata": {
    "lastUpdated": "ISO 8601 timestamp",
    "dataSource": "string",
    "updateFrequency": "string"
  }
}
```

**Backend Endpoint:** `GET /api/weather/forecast`

---

## How to Replace with Backend API

### Step 1: Create API Service Files

Create `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const fetchFireLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fires/active`);
    if (!response.ok) throw new Error('Failed to fetch fire locations');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to local JSON
    const response = await fetch('/data/fireLocations.json');
    return await response.json();
  }
};

export const fetchRiskZones = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/risk-zones`);
    if (!response.ok) throw new Error('Failed to fetch risk zones');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    const response = await fetch('/data/riskZones.json');
    return await response.json();
  }
};

export const fetchWeatherData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/weather/forecast`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    const response = await fetch('/data/weatherData.json');
    return await response.json();
  }
};
```

### Step 2: Update React Hooks

Modify your existing hooks to use the API service:

```javascript
import { useState, useEffect } from 'react';
import { fetchFireLocations } from '../services/api';

export const useFireLocations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchFireLocations();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // Refresh every 10 minutes
    const interval = setInterval(loadData, 600000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};
```

### Step 3: Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### Step 4: Update Components

Replace direct JSON imports with hooks:

```javascript
// Old way (using dummy data)
import fireData from '../data/fireLocations.json';

// New way (using API)
const { data: fireData, loading, error } = useFireLocations();
```

---

## Current Data Flow

```
Frontend Components
    ↓
Local JSON Files (/public/data/)
    ↓
Dummy Data Response
```

## Target Data Flow

```
Frontend Components
    ↓
API Service Layer (src/services/api.js)
    ↓
Backend REST API
    ↓
Database / Real-time Data Sources
    ↓ (fallback on error)
Local JSON Files (/public/data/)
```

---

## Data Update Frequencies

| Endpoint | Recommended Update Interval |
|----------|----------------------------|
| Fire Locations | Every 5-10 minutes |
| Risk Zones | Every 1 hour |
| Weather Data | Every 10 minutes |

---

## Testing Backend Integration

1. Start your backend server
2. Update `VITE_API_BASE_URL` in `.env`
3. Ensure backend responses match the JSON structure above
4. Test with network throttling / offline mode to verify fallback
5. Check browser console for API errors

---

## Backend Response Requirements

✅ **Must Include:**
- CORS headers (`Access-Control-Allow-Origin`)
- Content-Type: `application/json`
- Matching field names (case-sensitive)
- ISO 8601 timestamps
- Proper HTTP status codes (200, 404, 500)

✅ **Optional Enhancements:**
- Pagination (`?page=1&limit=50`)
- Filtering (`?intensity=high&region=Maharashtra`)
- WebSocket support for real-time updates
- Compression (gzip)
- Rate limiting headers

---

## Notes for Backend Developers

1. **Field Types:** Ensure number fields are numbers (not strings)
2. **Coordinates:** Use `[lat, lon]` array format for Leaflet compatibility
3. **Timestamps:** Use UTC in ISO 8601 format (`2025-11-13T13:00:00Z`)
4. **Risk Scores:** Scale 0-100 (integer)
5. **Wind Direction:** Degrees 0-360 (0 = North, 90 = East)
6. **Intensity Levels:** Use exact strings: `"low"`, `"medium"`, `"high"`, `"critical"`

---

## Migration Checklist

- [ ] Backend API endpoints created
- [ ] API responses match JSON structure
- [ ] CORS configured
- [ ] Environment variables set
- [ ] API service layer created (`src/services/api.js`)
- [ ] React hooks updated to use API
- [ ] Error handling implemented
- [ ] Fallback to local JSON working
- [ ] Loading states added to UI
- [ ] Tested with network offline
- [ ] Monitoring/logging configured

---

**Last Updated:** November 13, 2025  
**Contact:** Backend Team  
**API Documentation:** [Link to Swagger/OpenAPI docs]
