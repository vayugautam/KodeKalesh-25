# Components Guide

## 📦 Components

### MapComponent
Interactive Leaflet map component with markers and popups.

```jsx
import MapComponent from './components/MapComponent'

<MapComponent />
```

### ChartComponent
Recharts line chart for data visualization.

```jsx
import ChartComponent from './components/ChartComponent'

<ChartComponent />
```

### CustomCard
Material-UI card wrapper component.

```jsx
import CustomCard from './components/CustomCard'

<CustomCard title="Title" description="Description">
  Content here
</CustomCard>
```

## 🎣 Custom Hooks

### useCounter
Counter hook with increment, decrement, and reset.

```jsx
import { useCounter } from './hooks/useCounter'

const { count, increment, decrement, reset } = useCounter(0)
```

### useFetch
Data fetching hook with loading and error states.

```jsx
import { useFetch } from './hooks/useFetch'

const { data, loading, error } = useFetch('/api/endpoint')
```

## 🛠️ Utils

### API Client (Axios)
Pre-configured axios instance with interceptors.

```jsx
import api from './utils/api'

// GET request
const response = await api.get('/endpoint')

// POST request
const response = await api.post('/endpoint', { data })
```

### Helper Functions
Utility functions for common tasks.

```jsx
import { formatDate, formatCurrency, debounce } from './utils/helpers'

const formatted = formatDate(new Date())
const price = formatCurrency(1234.56)
const debouncedFunc = debounce(myFunction, 300)
```

## 🗺️ Folder Structure Details

```
src/
├── components/       # Reusable UI components
│   ├── MapComponent.jsx
│   ├── ChartComponent.jsx
│   └── CustomCard.jsx
├── pages/           # Page-level components
│   └── Home.jsx
├── hooks/           # Custom React hooks
│   ├── useCounter.js
│   └── useFetch.js
├── utils/           # Utility functions
│   ├── api.js
│   └── helpers.js
└── assets/          # Static assets
    └── index.js
```

## 🎨 Material-UI Theme

You can customize the Material-UI theme by wrapping your app:

```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```
