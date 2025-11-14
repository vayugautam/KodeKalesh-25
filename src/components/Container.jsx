import PropTypes from 'prop-types'
import { Box } from '@mui/material'
import styles from './Container.module.css'

/**
 * Reusable Container component with max-width and auto-centering
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be contained
 * @param {boolean} props.fullWidth - If true, removes max-width constraint
 * @param {number|string} props.gap - Gap between child elements (CSS value)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.sx - Material-UI sx prop for additional styling
 * @param {string} props.maxWidth - Custom max-width ('sm'|'md'|'lg'|'xl'|'xxl' or CSS value)
 * @param {boolean} props.disablePadding - Remove responsive padding
 * @param {React.ElementType} props.component - HTML element type (default: 'div')
 */
function Container({ 
  children, 
  fullWidth = false, 
  gap = 0,
  className = '',
  sx = {},
  maxWidth = 'lg',
  disablePadding = false,
  component = 'div',
  ...otherProps 
}) {
  // Map maxWidth presets to pixel values
  const maxWidthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  }

  // Determine the actual max-width value
  const maxWidthValue = maxWidthMap[maxWidth] || maxWidth

  // Build container classes
  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    disablePadding ? styles.noPadding : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <Box
      component={component}
      className={containerClasses}
      sx={{
        maxWidth: fullWidth ? '100%' : maxWidthValue,
        gap: gap,
        ...sx
      }}
      {...otherProps}
    >
      {children}
    </Box>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  gap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  sx: PropTypes.object,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'xxl']),
  disablePadding: PropTypes.bool,
  component: PropTypes.elementType,
}

export default Container
