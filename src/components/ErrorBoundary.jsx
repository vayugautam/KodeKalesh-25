import React from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, Button, Paper } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

const IS_DEV = import.meta.env.MODE === 'development'

/**
 * Error Boundary component to catch and display errors gracefully
 * Prevents entire app crash when component errors occur
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    })
    // Reload the page to reset state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center'
            }}
          >
            <ErrorOutlineIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2
              }} 
            />
            
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {this.props.errorMessage || 
               'An unexpected error occurred while loading this component. Please try refreshing the page.'}
            </Typography>

            {IS_DEV && this.state.error && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  textAlign: 'left',
                  bgcolor: 'grey.50',
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Paper>
            )}

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              size="large"
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  errorMessage: PropTypes.string,
}
