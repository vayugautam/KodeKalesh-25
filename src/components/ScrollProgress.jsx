import { useState, useEffect } from 'react'
import { Box } from '@mui/material'

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scrolled = (scrollPx / winHeightPx) * 100

      setScrollProgress(scrolled)
    }

    window.addEventListener('scroll', updateScrollProgress)
    updateScrollProgress() // Initial call

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: 0,
        width: `${scrollProgress}%`,
        height: 3,
        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        zIndex: 1300,
        transition: 'width 0.1s ease-out',
      }}
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Page scroll progress"
    />
  )
}

export default ScrollProgress
