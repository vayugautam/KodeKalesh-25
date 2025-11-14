import { Box, Typography, Paper, Button, Stack } from '@mui/material'
import Container from './Container'

/**
 * Example component demonstrating Container usage
 */
function ContainerExample() {
  return (
    <Box sx={{ backgroundColor: '#f5f5f5', py: 4 }}>
      {/* Example 1: Default Container (lg max-width) */}
      <Container sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Default Container (lg - 1024px)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This container has a max-width of 1024px and is auto-centered with responsive padding.
          </Typography>
        </Paper>
      </Container>

      {/* Example 2: Small Container */}
      <Container maxWidth="sm" sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Small Container (sm - 640px)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Perfect for narrow content like forms or single-column layouts.
          </Typography>
        </Paper>
      </Container>

      {/* Example 3: Full Width Container */}
      <Container fullWidth sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Full Width Container
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This container spans the full width of the viewport with responsive padding.
          </Typography>
        </Paper>
      </Container>

      {/* Example 4: Container with Gap */}
      <Container gap={3} sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Container with Gap (24px)
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained">Button 1</Button>
          <Button variant="contained">Button 2</Button>
          <Button variant="contained">Button 3</Button>
        </Stack>
      </Container>

      {/* Example 5: Extra Large Container */}
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Extra Large Container (xl - 1280px)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Great for dashboards and wide content layouts.
          </Typography>
        </Paper>
      </Container>

      {/* Example 6: Container with No Padding */}
      <Container disablePadding sx={{ mb: 4 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3,
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: 0
          }}
        >
          <Typography variant="h5" gutterBottom>
            No Padding Container
          </Typography>
          <Typography variant="body1">
            This container has no horizontal padding - useful for full-bleed designs.
          </Typography>
        </Paper>
      </Container>

      {/* Example 7: Custom Max-Width */}
      <Container maxWidth="900px" sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Custom Max-Width (900px)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You can pass any CSS value for max-width.
          </Typography>
        </Paper>
      </Container>

      {/* Example 8: Container as Section */}
      <Container component="section" maxWidth="md" sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Semantic HTML (section element)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This container renders as a &lt;section&gt; element for better semantics.
          </Typography>
        </Paper>
      </Container>

      {/* Example 9: Nested Containers */}
      <Container fullWidth sx={{ backgroundColor: '#e0e0e0', py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Nested Containers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Full-width outer container with centered inner container.
            </Typography>
          </Paper>
        </Container>
      </Container>
    </Box>
  )
}

export default ContainerExample
