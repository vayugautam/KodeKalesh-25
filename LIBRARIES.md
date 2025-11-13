# Installed Libraries Reference

## 📚 Core Dependencies

### ⚛️ React & React DOM (v18.3.1)
The core React library for building user interfaces.
- **Docs**: https://react.dev/

### ⚡ Vite (v5.4.1)
Next-generation frontend tooling - incredibly fast build tool.
- **Docs**: https://vitejs.dev/
- **Commands**: 
  - `npm run dev` - Start dev server
  - `npm run build` - Build for production

## 🎨 UI & Styling

### 🎭 Material-UI (MUI) v6.1.3
Comprehensive React component library implementing Material Design.
- **Docs**: https://mui.com/
- **Core**: `@mui/material`
- **Icons**: `@mui/icons-material`
- **Styling**: `@emotion/react`, `@emotion/styled`

**Quick Example:**
```jsx
import { Button, TextField, Box } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
```

## 🗺️ Maps

### 🌍 Leaflet (v1.9.4) + React-Leaflet (v4.2.1)
Open-source interactive maps library.
- **Leaflet Docs**: https://leafletjs.com/
- **React-Leaflet Docs**: https://react-leaflet.js.org/

**Quick Example:**
```jsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
```

## 📊 Charts & Data Visualization

### 📈 Recharts (v2.12.7)
Composable charting library built on React components.
- **Docs**: https://recharts.org/

**Quick Example:**
```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts'
```

## 🌐 HTTP & Routing

### 🔄 Axios (v1.7.7)
Promise-based HTTP client for the browser and Node.js.
- **Docs**: https://axios-http.com/

**Quick Example:**
```jsx
import axios from 'axios'
const response = await axios.get('/api/data')
```

### 🛣️ React Router DOM (v6.26.2)
Declarative routing for React applications.
- **Docs**: https://reactrouter.com/

**Quick Example:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
```

## 🔧 Development Tools

### ✅ ESLint (v9.9.0)
JavaScript linting utility.
- **Command**: `npm run lint`

## 📦 All Installed Packages

### Dependencies:
- ✅ react (^18.3.1)
- ✅ react-dom (^18.3.1)
- ✅ react-router-dom (^6.26.2)
- ✅ axios (^1.7.7)
- ✅ leaflet (^1.9.4)
- ✅ react-leaflet (^4.2.1)
- ✅ recharts (^2.12.7)
- ✅ @mui/material (^6.1.3)
- ✅ @mui/icons-material (^6.1.3)
- ✅ @emotion/react (^11.13.3)
- ✅ @emotion/styled (^11.13.0)

### Dev Dependencies:
- @vitejs/plugin-react (^4.3.1)
- eslint (^9.9.0)
- eslint plugins (react, react-hooks, react-refresh)
- vite (^5.4.1)

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🌟 Alternative: TailwindCSS

If you prefer TailwindCSS over Material-UI, run:

```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then update your `tailwind.config.js` and import Tailwind styles.

## 📖 Learning Resources

- React: https://react.dev/learn
- Vite: https://vitejs.dev/guide/
- Material-UI: https://mui.com/material-ui/getting-started/
- Leaflet: https://leafletjs.com/examples.html
- Recharts: https://recharts.org/en-US/examples
- React Router: https://reactrouter.com/en/main/start/tutorial
- Axios: https://axios-http.com/docs/intro
