# KodeKalesh Backend (local)

This folder contains a minimal Express backend that implements the API surface expected by the frontend in this repository.

Key endpoints (mounted under `/api`):

- `GET /api/health` — health check
- `GET /api/locations` — list of locations (sample data)
- `GET /api/locations/:id` — location details
- `GET /api/locations/search?q=` — search locations
- `GET /api/weather/current?lat=&lon=` — current weather + computed risk
- `GET /api/weather/forecast?lat=&lon=&days=` — forecast proxy to Open-Meteo
- `POST /api/weather/bulk` — body: { locations: [{lat, lon}] }
- `GET /api/weather/historical?lat=&lon=&startDate=&endDate=` — historical data
- `GET /api/risk/*` — risk endpoints: assessment, alerts, zones, predictions, statistics, fire-hotspots

How to run (locally):

1. cd into this folder:

```powershell
cd backend
```

2. Install dependencies:

```powershell
npm install
```

3. Start server:

```powershell
npm start
```

By default the server listens on port 3000 and exposes APIs under `http://localhost:3000/api`.

Notes:

- This is a lightweight demo backend intended to satisfy the frontend's API calls. It proxies to Open-Meteo for real weather data when requested. No database is configured — sample data is in `data/locations.json`.
- Configure the frontend to use the backend by setting `VITE_WEATHER_API_BASE_URL` to `http://localhost:3000/api` when starting the frontend.
