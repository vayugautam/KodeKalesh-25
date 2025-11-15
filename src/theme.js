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
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff5722',
      light: '#ff8a65',
      dark: '#e64a19',
      contrastText: '#ffffff',
    },
    success: {
      main: RISK_COLORS.safe.main,
      light: RISK_COLORS.safe.light,
      dark: RISK_COLORS.safe.dark,
      contrastText: '#ffffff',
    },
    warning: {
      main: RISK_COLORS.medium.dark,
      light: RISK_COLORS.medium.light,
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    error: {
      main: RISK_COLORS.danger.main,
      light: RISK_COLORS.danger.light,
      dark: RISK_COLORS.danger.dark,
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
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
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 6px 12px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.12)',
    '0px 10px 20px rgba(0,0,0,0.14)',
    '0px 12px 24px rgba(0,0,0,0.16)',
    '0px 14px 28px rgba(0,0,0,0.18)',
    '0px 16px 32px rgba(0,0,0,0.2)',
    '0px 18px 36px rgba(0,0,0,0.22)',
    '0px 20px 40px rgba(0,0,0,0.24)',
    '0px 22px 44px rgba(0,0,0,0.26)',
    '0px 24px 48px rgba(0,0,0,0.28)',
    '0px 26px 52px rgba(0,0,0,0.3)',
    '0px 28px 56px rgba(0,0,0,0.32)',
    '0px 30px 60px rgba(0,0,0,0.34)',
    '0px 32px 64px rgba(0,0,0,0.36)',
    '0px 34px 68px rgba(0,0,0,0.38)',
    '0px 36px 72px rgba(0,0,0,0.4)',
    '0px 38px 76px rgba(0,0,0,0.42)',
    '0px 40px 80px rgba(0,0,0,0.44)',
    '0px 42px 84px rgba(0,0,0,0.46)',
    '0px 44px 88px rgba(0,0,0,0.48)',
    '0px 46px 92px rgba(0,0,0,0.5)',
    '0px 48px 96px rgba(0,0,0,0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
})

export default theme
