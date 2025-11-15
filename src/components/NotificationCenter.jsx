import { useState, useEffect } from 'react'
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoIcon from '@mui/icons-material/Info'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const NOTIFICATION_DURATION = 6000

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const shouldNotify = Math.random() > 0.7 // 30% chance every 30 seconds
      
      if (shouldNotify) {
        const notificationTypes = [
          {
            severity: 'warning',
            title: 'High Fire Risk Detected',
            message: 'Temperature above 35°C with low humidity in Nilgiris region',
          },
          {
            severity: 'info',
            title: 'Weather Update',
            message: 'Wind speed increasing in Western Ghats - monitor closely',
          },
          {
            severity: 'success',
            title: 'Alert Acknowledged',
            message: 'Response team deployed to Gadchiroli sector',
          },
          {
            severity: 'error',
            title: 'Critical Alert',
            message: 'Smoke detected via satellite in Shimla forest area',
          },
        ]
        
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        
        const newNotification = {
          id: Date.now(),
          ...randomNotification,
          timestamp: new Date().toLocaleTimeString(),
        }
        
        setNotifications((prev) => [...prev, newNotification])
        
        // Auto-remove after duration
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
        }, NOTIFICATION_DURATION)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleClose = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity={notification.severity}
          sx={{
            boxShadow: 4,
            borderRadius: 2,
            animation: 'slideInRight 0.3s ease-out',
            '@keyframes slideInRight': {
              from: {
                transform: 'translateX(400px)',
                opacity: 0,
              },
              to: {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
          }}
          action={
            <IconButton
              size="small"
              onClick={() => handleClose(notification.id)}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {notification.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {notification.message}
            </Typography>
            <Chip
              label={notification.timestamp}
              size="small"
              sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
            />
          </Box>
        </Alert>
      ))}
    </Box>
  )
}

export default NotificationCenter
