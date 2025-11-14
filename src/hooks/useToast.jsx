/**
 * Toast Notification Hook
 * Provides toast notifications for errors, success, and info messages
 */

import { useState, useCallback } from 'react'
import { Snackbar, Alert, Slide } from '@mui/material'

function SlideTransition(props) {
  return <Slide {...props} direction="up" />
}

export const useToast = () => {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error' | 'warning' | 'info' | 'success'
    duration: 6000
  })

  const showToast = useCallback((message, severity = 'info', duration = 6000) => {
    setToast({
      open: true,
      message,
      severity,
      duration
    })
  }, [])

  const showError = useCallback((message, duration = 6000) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const showSuccess = useCallback((message, duration = 4000) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const showWarning = useCallback((message, duration = 5000) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const showInfo = useCallback((message, duration = 4000) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setToast(prev => ({ ...prev, open: false }))
  }, [])

  const ToastComponent = useCallback(() => (
    <Snackbar
      open={toast.open}
      autoHideDuration={toast.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{ zIndex: 10000 }}
    >
      <Alert
        onClose={handleClose}
        severity={toast.severity}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: 300,
          boxShadow: 3,
          fontWeight: 500
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  ), [toast, handleClose])

  return {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    ToastComponent
  }
}
