import { Box, Container, Typography, Link, Grid, IconButton, Divider } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        py: 4,
        mt: 'auto',
        borderTop: '3px solid #1976d2',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 28, color: '#ff5722' }} />
              <Typography variant="h6" fontWeight="bold">
                FireGuard AI
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7, fontStyle: 'italic', display: 'block', mb: 1 }}>
              Predicting Fires Before They Spread
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
              Real-time forest fire risk assessment and prediction system powered by AI and weather data analysis.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Home
              </Link>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Live Map
              </Link>
              <Link href="/alerts" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Active Alerts
              </Link>
              <Link href="/reports" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Reports & Analytics
              </Link>
            </Box>
          </Grid>

          {/* Contact & Social */}
          <Grid item xs={12} sm={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Connect With Us
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Follow us for real-time updates and alerts
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
                href="https://github.com/vayugautam/KodeKalesh-25"
                target="_blank"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © 2025 FireGuard AI. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Powered by Open-Meteo Weather API
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
