import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Drawer, IconButton, Tooltip } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import theme from './theme'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MapPage from './pages/MapPage'
import Home from './pages/Home'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import './App.css'
import './styles/accessibility.css'
import './styles/smoothScroll.css'

const SIDEBAR_WIDTH = 280

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Toggle sidebar with Ctrl+B and focus search with /
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+B to toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

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

          {/* Left Collapsible Sidebar */}
          <Drawer
            variant="persistent"
            anchor="left"
            open={sidebarOpen}
            sx={{
              width: sidebarOpen ? SIDEBAR_WIDTH : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
                top: 64,
                height: 'calc(100vh - 64px)',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#fafafa',
                transition: 'width 0.3s ease',
              },
            }}
          >
            <Box
              role="navigation"
              aria-label="Sidebar navigation"
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
                  Quick Access
                </Box>
                <Tooltip title="Close sidebar (Ctrl+B)">
                  <IconButton 
                    size="small" 
                    onClick={toggleSidebar}
                    aria-label="Close sidebar"
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Sidebar Content */}
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                  • Active Fires: <strong>6</strong>
                </Box>
                <Box sx={{ mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                  • High Risk Zones: <strong>3</strong>
                </Box>
                <Box sx={{ mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                  • Critical Alerts: <strong>1</strong>
                </Box>
              </Box>

              {/* Keyboard Shortcuts Help */}
              <Box 
                sx={{ 
                  mt: 'auto', 
                  pt: 2, 
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <kbd style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>Ctrl+B</kbd> Toggle sidebar
                </div>
                <div>
                  <kbd style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>/</kbd> Focus search
                </div>
              </Box>
            </Box>
          </Drawer>

          {/* Sidebar Toggle Button (when closed) */}
          {!sidebarOpen && (
            <Tooltip title="Open sidebar (Ctrl+B)">
              <IconButton
                onClick={toggleSidebar}
                aria-label="Open sidebar"
                sx={{
                  position: 'fixed',
                  left: 8,
                  top: 72,
                  zIndex: 1200,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Main Content Area */}
          <main 
            id="main-content"
            ref={mainContentRef}
            className="app-main scroll-target"
            role="main"
            aria-label="Main content"
            tabIndex={-1}
            style={{
              marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
              transition: 'margin-left 0.3s ease',
            }}
          >
            <Routes>
              <Route path="/" element={<MapPage searchInputRef={searchInputRef} />} />
              <Route path="/home" element={<Home />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer 
            className="app-footer"
            role="contentinfo"
            aria-label="Footer"
            style={{
              marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
              transition: 'margin-left 0.3s ease',
            }}
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
