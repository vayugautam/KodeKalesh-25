import PropTypes from 'prop-types'
import { Card, CardContent, Typography, Box } from '@mui/material'

/**
 * Example Card component demonstrating Material-UI usage
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.ReactNode} props.children - Card content
 */
function CustomCard({ title, description, children }) {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        <Box>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CustomCard

CustomCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
}
