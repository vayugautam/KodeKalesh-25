import { Container, Typography, Box, Button } from '@mui/material'
import { useState } from 'react'
import MapComponent from '../components/MapComponent'
import ChartComponent from '../components/ChartComponent'
import { useCounter } from '../hooks/useCounter'

function Home() {
  const { count, increment, decrement, reset } = useCounter(0)

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Kodekalesh25
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          React + Vite with Material-UI, Leaflet, Recharts & Axios
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>Counter Demo (Custom Hook)</Typography>
          <Typography variant="h4" sx={{ my: 2 }}>Count: {count}</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={increment}>Increment</Button>
            <Button variant="contained" onClick={decrement}>Decrement</Button>
            <Button variant="outlined" onClick={reset}>Reset</Button>
          </Box>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>Chart Demo</Typography>
          <ChartComponent />
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>Map Demo (Leaflet)</Typography>
          <MapComponent />
        </Box>
      </Box>
    </Container>
  )
}

export default Home
