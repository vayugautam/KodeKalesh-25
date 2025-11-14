import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import HomeIcon from '@mui/icons-material/Home'
import MapIcon from '@mui/icons-material/Map'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AssessmentIcon from '@mui/icons-material/Assessment'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useState, useEffect } from 'react'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true'
    setIsAuthenticated(authStatus)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const navItems = [
    { label: 'Home', path: '/home', icon: <HomeIcon /> },
    { label: 'Map', path: '/', icon: <MapIcon /> },
    { label: 'Alerts', path: '/alerts', icon: <NotificationsIcon /> },
    { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  ]

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      component="nav"
      role="navigation"
      aria-label="Primary navigation"
      sx={{ 
        backgroundColor: '#1976d2',
        zIndex: 1300,
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
          <LocalFireDepartmentIcon sx={{ fontSize: 32, color: '#ff5722' }} aria-hidden="true" />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Forest Fire Prediction
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box 
          component="nav"
          sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}
          aria-label="Main navigation links"
        >
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              sx={{
                color: 'white',
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                px: 2,
                borderRadius: 1,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Mobile Navigation */}
        <Box 
          component="nav"
          sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, gap: 0.5 }}
          aria-label="Mobile navigation links"
        >
          {navItems.map((item) => (
            <IconButton
              key={item.path}
              component={Link}
              to={item.path}
              aria-label={item.label}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              sx={{
                color: 'white',
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>

        {/* User Info / Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.9, mr: 1 }}>
                {localStorage.getItem('userName') || localStorage.getItem('userEmail')}
              </Typography>
              <Button
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  },
                  px: 2,
                  borderRadius: 1,
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  },
                  px: 2,
                  borderRadius: 1,
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/signup"
                startIcon={<PersonAddIcon />}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  },
                  px: 2,
                  borderRadius: 1,
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
