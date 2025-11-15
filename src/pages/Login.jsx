import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Stack
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LocalFireDepartment
} from '@mui/icons-material'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (isAuthenticated) {
      navigate('/map', { replace: true })
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // For demo: accept any email/password
      if (formData.email && formData.password.length >= 6) {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', formData.email)
        navigate('/map')
      } else {
        setError('Invalid credentials. Password must be at least 6 characters.')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalFireDepartment
              sx={{
                fontSize: 64,
                color: 'primary.main',
                filter: 'drop-shadow(0 4px 8px rgba(255,87,34,0.3))'
              }}
            />
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              FireGuard AI
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
              Predicting Fires Before They Spread
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access the prediction system
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  )
                }}
                autoComplete="email"
                autoFocus
                sx={{
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                    WebkitTextFillColor: '#000',
                    caretColor: '#000',
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '2px',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                autoComplete="current-password"
                sx={{
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                    WebkitTextFillColor: '#000',
                    caretColor: '#000',
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 100px #fff inset !important',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: '2px',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5568d3 30%, #66428c 90%)'
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

          {/* Demo Info */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'info.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.200'
            }}
          >
            <Typography variant="caption" color="info.main" display="block" fontWeight={600}>
              Demo Mode
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Use any email and password (min 6 characters) to sign in
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
