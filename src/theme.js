import { createTheme } from '@mui/material/styles'

// Consistent color palette for fire risk levels
export const RISK_COLORS = {
  safe: {
    main: '#4caf50',      // Green
    light: '#81c784',
    dark: '#388e3c',
    bg: '#e8f5e9',
    text: '#1b5e20',
  },
  medium: {
    main: '#ffd54f',      // Yellow/Orange
    light: '#ffe082',
    dark: '#ffa000',
    bg: '#fff9e6',
    text: '#f57c00',
  },
  danger: {
    main: '#f44336',      // Red
    light: '#ef5350',
    dark: '#d32f2f',
    bg: '#ffebee',
    text: '#c62828',
  },
  critical: {
    main: '#b71c1c',      // Dark Red
    light: '#c62828',
    dark: '#7f0000',
    bg: '#ffcdd2',
    text: '#b71c1c',
  }
}

// Helper function to get risk color based on score (0-100)
export const getRiskColor = (score) => {
  if (score < 30) return RISK_COLORS.safe.main
  if (score < 60) return RISK_COLORS.medium.main
  if (score < 80) return RISK_COLORS.danger.main
  return RISK_COLORS.critical.main
}

// Helper function to get risk level
export const getRiskLevel = (score) => {
  if (score < 30) return { level: 'Safe', color: RISK_COLORS.safe, mui: 'success' }
  if (score < 60) return { level: 'Medium', color: RISK_COLORS.medium, mui: 'warning' }
  if (score < 80) return { level: 'High', color: RISK_COLORS.danger, mui: 'error' }
  return { level: 'Critical', color: RISK_COLORS.critical, mui: 'error' }
}

// Material-UI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ff5722',
      light: '#ff8a65',
      dark: '#e64a19',
    },
    success: {
      main: RISK_COLORS.safe.main,
      light: RISK_COLORS.safe.light,
      dark: RISK_COLORS.safe.dark,
    },
    warning: {
      main: RISK_COLORS.medium.dark,
      light: RISK_COLORS.medium.light,
      dark: '#f57c00',
    },
    error: {
      main: RISK_COLORS.danger.main,
      light: RISK_COLORS.danger.light,
      dark: RISK_COLORS.danger.dark,
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

export default theme
