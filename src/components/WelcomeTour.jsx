import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  IconButton,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MapIcon from '@mui/icons-material/Map'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const tourSteps = [
  {
    label: 'Welcome to FireGuard AI',
    icon: <LocalFireDepartmentIcon color="error" />,
    description: 'An AI-powered platform for real-time forest fire risk assessment and prediction across India.',
    features: [
      'Real-time weather integration',
      'ML-based fire risk prediction',
      'Interactive risk mapping',
      'Automated alert system',
    ],
  },
  {
    label: 'Interactive Map',
    icon: <MapIcon color="primary" />,
    description: 'Click anywhere on the map to get instant fire risk predictions for that location.',
    features: [
      'Click map to select location',
      'View real-time weather data',
      'See ML prediction scores',
      'Draw areas for batch analysis',
    ],
  },
  {
    label: 'Alert Console',
    icon: <NotificationsActiveIcon color="warning" />,
    description: 'Monitor critical fire alerts and manage response priorities across regions.',
    features: [
      'Real-time alert feed',
      'Priority-based filtering',
      'Response checklist',
      'Regional coverage',
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: <AssessmentIcon color="success" />,
    description: 'Generate detailed reports and track prediction accuracy over time.',
    features: [
      'PDF report export',
      'Historical analytics',
      'Forecast accuracy tracker',
      'Automated intelligence',
    ],
  },
]

const WelcomeTour = () => {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenWelcomeTour')
    if (!hasSeenTour) {
      const timer = setTimeout(() => setOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem('hasSeenWelcomeTour', 'true')
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleFinish = () => {
    localStorage.setItem('hasSeenWelcomeTour', 'true')
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalFireDepartmentIcon sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight={700}>
            Getting Started
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
          {tourSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="h6" fontWeight={600} color="white">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 1,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" color="white" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {step.features.map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                        <Typography variant="body2" color="white">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': { borderColor: 'white' },
          }}
        >
          Skip Tour
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ color: 'white' }}
        >
          Back
        </Button>
        {activeStep === tourSteps.length - 1 ? (
          <Button
            onClick={handleFinish}
            variant="contained"
            color="success"
            sx={{ fontWeight: 600 }}
          >
            Get Started
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: '#667eea',
              fontWeight: 600,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default WelcomeTour
