import { useRef } from 'react'
import { Box, Button, Stack, Typography, Paper } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { scrollToRef, scrollToTop, useScrollToElement } from '../utils/scrollUtils'

/**
 * Example component demonstrating scroll utilities usage
 */
function ScrollExample() {
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)

  // Using the hook
  const { scrollToRef: scrollTo } = useScrollToElement(80)

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation Buttons */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          position: 'sticky', 
          top: 80, 
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Scroll Navigation Example
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button 
            variant="contained" 
            onClick={() => scrollToRef(section1Ref)}
            className="focusable"
          >
            Go to Section 1
          </Button>
          <Button 
            variant="contained" 
            onClick={() => scrollTo(section2Ref)}
            className="focusable"
          >
            Go to Section 2
          </Button>
          <Button 
            variant="contained" 
            onClick={() => scrollToRef(section3Ref)}
            className="focusable"
          >
            Go to Section 3
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<KeyboardArrowUpIcon />}
            onClick={scrollToTop}
            className="focusable"
          >
            Back to Top
          </Button>
        </Stack>
      </Paper>

      {/* Section 1 */}
      <Paper 
        ref={section1Ref} 
        id="section-1"
        className="scroll-target"
        elevation={2} 
        sx={{ p: 4, mb: 3, minHeight: '400px' }}
      >
        <Typography variant="h4" gutterBottom>
          Section 1
        </Typography>
        <Typography variant="body1" paragraph>
          This section demonstrates smooth scrolling with proper offset for the fixed header.
          Click the navigation buttons above to jump between sections smoothly.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Notice how the scroll stops with perfect spacing from the header (80px offset).
        </Typography>
      </Paper>

      {/* Section 2 */}
      <Paper 
        ref={section2Ref} 
        id="section-2"
        className="scroll-target"
        elevation={2} 
        sx={{ p: 4, mb: 3, minHeight: '400px' }}
      >
        <Typography variant="h4" gutterBottom>
          Section 2
        </Typography>
        <Typography variant="body1" paragraph>
          Accessibility features include:
        </Typography>
        <ul>
          <li>Clear focus outlines visible only for keyboard navigation</li>
          <li>Skip to main content link (press Tab on page load)</li>
          <li>ARIA labels and semantic HTML</li>
          <li>Keyboard shortcuts (Ctrl+B for sidebar, / for search)</li>
          <li>Reduced motion support for users who prefer less animation</li>
        </ul>
      </Paper>

      {/* Section 3 */}
      <Paper 
        ref={section3Ref} 
        id="section-3"
        className="scroll-target"
        elevation={2} 
        sx={{ p: 4, mb: 3, minHeight: '400px' }}
      >
        <Typography variant="h4" gutterBottom>
          Section 3
        </Typography>
        <Typography variant="body1" paragraph>
          Try these keyboard interactions:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • Press <kbd>Tab</kbd> to navigate between focusable elements
          </Typography>
          <Typography variant="body2">
            • Press <kbd>Shift+Tab</kbd> to navigate backwards
          </Typography>
          <Typography variant="body2">
            • Press <kbd>Enter</kbd> or <kbd>Space</kbd> on buttons
          </Typography>
          <Typography variant="body2">
            • Press <kbd>Ctrl+B</kbd> to toggle the sidebar
          </Typography>
          <Typography variant="body2">
            • Press <kbd>/</kbd> to focus search (if available)
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ScrollExample
