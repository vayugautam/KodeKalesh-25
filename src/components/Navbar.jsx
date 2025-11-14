import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import HomeIcon from '@mui/icons-material/Home'
import MapIcon from '@mui/icons-material/Map'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AssessmentIcon from '@mui/icons-material/Assessment'

function Navbar() {
  const location = useLocation()

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
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.9 }}>
            Real-time Monitoring
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
