import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import theme from './theme'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MapPage from './pages/MapPage'
import Home from './pages/Home'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'
import './styles/accessibility.css'
import './styles/smoothScroll.css'

function App() {
  const searchInputRef = useRef(null)
  const mainContentRef = useRef(null)

  // React Router future flags configuration
  const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }

  // Track keyboard vs mouse usage for accessibility
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.add('using-mouse')
      document.body.classList.remove('using-keyboard')
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard')
        document.body.classList.remove('using-mouse')
      }
      
      // "/" to focus search (if search input exists)
      if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeElement = document.activeElement
        const isInputFocused = activeElement?.tagName === 'INPUT' || 
                              activeElement?.tagName === 'TEXTAREA' ||
                              activeElement?.isContentEditable
        
        if (!isInputFocused && searchInputRef.current) {
          e.preventDefault()
          searchInputRef.current.focus()
        }
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
        preventDuplicate
      >
        <CssBaseline />
        <Router future={routerFutureFlags}>
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>

        <div className="app-shell">
          {/* Fixed Header */}
          <header className="app-header" role="banner" aria-label="Main navigation">
            <Navbar />
          </header>

          {/* Main Content Area */}
          <main 
            id="main-content"
            ref={mainContentRef}
            className="app-main scroll-target"
            role="main"
            aria-label="Main content"
            tabIndex={-1}
          >
            <Routes>
              <Route path="/" element={<MapPage searchInputRef={searchInputRef} />} />
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<MapPage searchInputRef={searchInputRef} />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer 
            className="app-footer"
            role="contentinfo"
            aria-label="Footer"
          >
            <Footer />
          </footer>
        </div>
      </Router>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
