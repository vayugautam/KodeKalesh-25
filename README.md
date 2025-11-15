# FireGuard AI

**Predicting Fires Before They Spread**

A modern React application for real-time forest fire prediction and monitoring, featuring interactive maps, weather integration, and AI-powered risk assessment.

## 👥 Team - FarmFusion

This project was developed by **Team FarmFusion**:

- **Divya Ratna Gautam** - Team Lead and Frontend Developer
- **Arvind Singh** - Backend Developer  
- **Ayush Singh** - Logistics, Research, and Frontend
- **Abhijeet Gupta** - ML Developer

## 📁 Project Structure

```
src/
  ├── components/     # Reusable UI components (Navbar, Sidebar, MapView, etc.)
  ├── pages/          # Page components (MapPage, Home)
  ├── hooks/          # Custom React hooks (useWeather, useRiskZones, etc.)
  ├── utils/          # Utility functions (API clients, PDF export, etc.)
  ├── theme.js        # Centralized color theme and risk level utilities
  └── assets/         # Static assets
public/
  └── data/           # Dummy JSON data (fireLocations, riskZones, weatherData)
```

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **React Router DOM** - Routing
- **Leaflet + React-Leaflet** - Interactive maps with heatmap
- **Open-Meteo API** - Real-time weather data
- **jsPDF + html2canvas** - PDF export and screenshots
- **Axios** - HTTP client

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔨 Build

```bash
npm run build
```

## 👀 Preview Production Build

```bash
npm run preview
```

## ✨ Key Features

### 🎯 Global App Shell
- ✅ **CSS Grid Layout** - Fixed header, collapsible sidebar, main content area
- ✅ **Smooth Scrolling** - `scroll-behavior: smooth` for all scrollable containers
- ✅ **Keyboard Navigation**
  - `Ctrl+B` - Toggle sidebar
  - `/` - Focus search input
- ✅ **Accessible ARIA Attributes** - Proper roles for header, nav, and main

### 🗺️ Interactive Map
- ✅ Leaflet map with fire location markers
- ✅ Dynamic heatmap visualization
- ✅ Timeline slider (0h → 24h predictions)
- ✅ Auto-play timeline feature
- ✅ Risk zone polygons (low/medium/high)

### 🌤️ Real-Time Weather
- ✅ Open-Meteo API integration (10k free calls/day)
- ✅ Current weather data (temperature, humidity, wind)
- ✅ Hourly forecasts
- ✅ Automatic fire risk calculation

### 🚨 Alert System
- ✅ Dynamic alert list based on weather conditions
- ✅ Critical alerts highlighted in red
- ✅ Risk score (0-100) with color-coded levels

### 📊 Professional Reporting
- ✅ PDF export with map screenshot
- ✅ Screenshot download functionality
- ✅ Floating action buttons (FAB)
- ✅ Complete risk assessment reports

### 🎨 UI/UX
- ✅ Responsive navbar with Home|Map|Alerts|Reports
- ✅ Professional footer with GitHub link
- ✅ Skeleton loading states
- ✅ Consistent color theme (Green/Yellow/Red)
- ✅ Collapsible left sidebar with quick stats
- ✅ Custom scrollbar styling

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle sidebar |
| `/` | Focus search input |
| `Tab` | Navigate focusable elements |
| `Enter` | Activate focused element |

## 🎨 Color Theme

```javascript
RISK_COLORS = {
  safe: '#4caf50',      // Green
  medium: '#ffd54f',    // Yellow
  danger: '#f44336',    // Red
  critical: '#b71c1c'   // Dark Red
}
```

## 📡 API Integration

### Open-Meteo Weather API
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **No API Key Required**
- **Free Tier:** 10,000 calls/day

### Forest Fire ML Model API

**ML Model Repository:** [ag21o9/ForestFireMLModel](https://github.com/ag21o9/ForestFireMLModel)

This application integrates with a machine learning model for fire risk prediction developed by [@ag21o9](https://github.com/ag21o9).

#### API Endpoint
```
POST https://forestfiremlmodel.onrender.com/predict
```

#### Request Schema
```json
{
  "X": 890,           // Grid cell X coordinate
  "Y": 500,           // Grid cell Y coordinate
  "temp": 28.5,       // Temperature in °C
  "RH": 65,           // Relative Humidity (%)
  "wind": 12.3,       // Wind speed (km/h)
  "rain": 0,          // Precipitation (mm)
  "month": 5,         // Month (1-12)
  "day": 15           // Day of month (1-31)
}
```

#### Response Schema
```json
{
  "score": 0.753,                    // Prediction score (0-1)
  "bucket": "high",                  // Risk level: low|medium|high|critical
  "color": "#ff9800",                // Hex color for visualization
  "features_used": ["temp", "RH", "wind"]  // Key contributing factors
}
```

#### Example cURL Command
```bash
curl -X POST https://forestfiremlmodel.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "X": 890,
    "Y": 500,
    "temp": 32.5,
    "RH": 45,
    "wind": 15.2,
    "rain": 0,
    "month": 5,
    "day": 20
  }'
```

#### Error Handling

**400 Bad Request** - Invalid payload
```json
{
  "error": "Validation failed",
  "details": {
    "temp": "Temperature is required",
    "RH": "Humidity must be between 0 and 100"
  }
}
```

**500 Internal Server Error** - Model prediction failure
```json
{
  "error": "Prediction failed",
  "message": "Internal server error"
}
```

**Network Timeout** - Request timeout after 30 seconds
```javascript
// The client automatically retries with exponential backoff
// (1s, 2s, 4s delays between 3 attempts)
```

#### Integration Example

```javascript
import { callFirePredictionAPI } from './utils/firePredictionClient'

// Prepare payload
const payload = {
  X: 890,
  Y: 500,
  temp: weather.temp,
  RH: weather.RH,
  wind: weather.wind,
  rain: weather.rain,
  month: new Date().getMonth() + 1,
  day: new Date().getDate()
}

// Call API with automatic error handling
try {
  const result = await callFirePredictionAPI(payload)
  console.log('Prediction:', result)
  // result = { score: 0.65, bucket: "medium", color: "#fdd835", features_used: [...] }
} catch (error) {
  console.error('Prediction failed:', error.message)
  // Fallback to default risk level
}
```

#### Client Features
- ✅ Automatic retry with exponential backoff (3 attempts)
- ✅ 30-second timeout protection
- ✅ Comprehensive error handling (400, 500, timeout, network)
- ✅ Response validation and formatting
- ✅ Batch prediction support (concurrent requests)
- ✅ Health check endpoint monitoring

See `src/utils/firePredictionClient.js` for full implementation.

### Dummy Data Files (for Backend Integration)
- `public/data/fireLocations.json` - 6 active fire locations
- `public/data/riskZones.json` - 8 risk zones (2 low, 3 medium, 3 high)
- `public/data/weatherData.json` - Weather forecasts

See `public/data/README.md` for backend integration guide.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📂 Component Architecture

### App Shell (`App.jsx`)
- Responsive CSS Grid layout
- Persistent sidebar drawer (280px)
- Smooth transitions (0.3s ease)
- Global keyboard event handlers

### Main Pages
- **MapPage** - Dashboard with map, sidebars, weather panel
- **Home** - Landing page (placeholder)
- **Alerts** - Alert listing page (placeholder)
- **Reports** - Report generation page (placeholder)

### Key Components
- **Navbar** - Sticky header with navigation
- **Sidebar** - Left collapsible sidebar with quick access
- **MapView** - Leaflet map with heatmap layer
- **RightSidebar** - Timeline, predictions, alerts
- **WeatherInfoPanel** - Real-time weather display
- **Footer** - Professional footer with links

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🚀 Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## 📝 Git Workflow

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push origin master
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 🔗 Links

- **GitHub Repository:** [vayugautam/KodeKalesh-25](https://github.com/vayugautam/KodeKalesh-25)
- **Open-Meteo API:** [https://open-meteo.com/](https://open-meteo.com/)
- **Leaflet Documentation:** [https://leafletjs.com/](https://leafletjs.com/)
- **Material-UI:** [https://mui.com/](https://mui.com/)

---

**Built with ❤️ by Team FarmFusion using React + Vite**
