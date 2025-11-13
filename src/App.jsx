import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box } from '@mui/material'
import theme from './theme'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MapPage from './pages/MapPage'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/alerts" element={<Home />} />
              <Route path="/reports" element={<Home />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
