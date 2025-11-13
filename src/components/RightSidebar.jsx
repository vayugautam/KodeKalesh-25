import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  Slider,
} from '@mui/material';
import {
  LocalFireDepartment,
  TrendingUp,
  Schedule,
  Warning,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

const RightSidebar = ({ selectedLocation, weatherData, onTimeChange }) => {
  const [timelineValue, setTimelineValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use real weather risk if available
  const baseRisk = weatherData?.risk?.score || 72;

  // Timeline marks
  const timelineMarks = [
    { value: 0, label: '0h' },
    { value: 2, label: '2h' },
    { value: 4, label: '4h' },
    { value: 6, label: '6h' },
    { value: 12, label: '12h' },
    { value: 18, label: '18h' },
    { value: 24, label: '24h' },
  ];

  // All prediction data points - dynamically calculated based on real weather
  const allPredictions = [
    { time: 0, risk: baseRisk, spread: '0 km', direction: '-', label: 'Current' },
    { time: 2, risk: Math.min(baseRisk - 5, 95), spread: '1.2 km', direction: 'NE' },
    { time: 4, risk: Math.min(baseRisk, 95), spread: '1.8 km', direction: 'NE' },
    { time: 6, risk: Math.min(baseRisk + 3, 98), spread: '2.5 km', direction: 'E' },
    { time: 12, risk: Math.min(baseRisk + 10, 98), spread: '4.2 km', direction: 'E' },
    { time: 18, risk: Math.min(baseRisk + 16, 99), spread: '6.1 km', direction: 'SE' },
    { time: 24, risk: Math.min(baseRisk + 20, 99), spread: '8.5 km', direction: 'SE' },
  ];

  // Get current prediction based on timeline value
  const getCurrentPrediction = () => {
    return allPredictions.find(p => p.time === timelineValue) || allPredictions[0];
  };

  const currentPrediction = getCurrentPrediction();

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineValue(prev => {
          const currentIndex = allPredictions.findIndex(p => p.time === prev);
          const nextIndex = (currentIndex + 1) % allPredictions.length;
          return allPredictions[nextIndex].time;
        });
      }, 1500); // Change every 1.5 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Notify parent component of time change
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(timelineValue, currentPrediction);
    }
  }, [timelineValue]);

  const handleSliderChange = (event, newValue) => {
    setTimelineValue(newValue);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Dummy prediction data
  const predictionData = {
    currentRisk: currentPrediction.risk,
    dangerLevel: 'High',
    spreadRadius: currentPrediction.spread,
    predictions: {
      sixHour: [
        { time: '2h', risk: 65, spread: '1.2 km', direction: 'NE' },
        { time: '4h', risk: 70, spread: '1.8 km', direction: 'NE' },
        { time: '6h', risk: 75, spread: '2.5 km', direction: 'E' },
      ],
      twentyFourHour: [
        { time: '6h', risk: 75, spread: '2.5 km', direction: 'E' },
        { time: '12h', risk: 82, spread: '4.2 km', direction: 'E' },
        { time: '18h', risk: 88, spread: '6.1 km', direction: 'SE' },
        { time: '24h', risk: 92, spread: '8.5 km', direction: 'SE' },
      ],
    },
  };

  // Determine danger level and color
  const getDangerLevel = (risk) => {
    if (risk < 30) return { level: 'Low', color: 'success' };
    if (risk < 60) return { level: 'Moderate', color: 'warning' };
    if (risk < 80) return { level: 'High', color: 'error' };
    return { level: 'Critical', color: 'error' };
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return '#4caf50';
    if (risk < 60) return '#ff9800';
    if (risk < 80) return '#f44336';
    return '#d32f2f';
  };

  const currentDanger = getDangerLevel(predictionData.currentRisk);

  return (
    <Box
      sx={{
        width: 380,
        height: '100vh',
        backgroundColor: '#f5f5f5',
        borderLeft: '1px solid #e0e0e0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocalFireDepartment sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            Fire Spread Prediction
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {selectedLocation?.name || 'Select a location on map'}
        </Typography>
      </Paper>

      {/* Timeline Slider */}
      <Paper elevation={2} sx={{ m: 2, mt: 0, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Timeline Control
          </Typography>
          <Chip
            icon={isPlaying ? <Pause /> : <PlayArrow />}
            label={isPlaying ? 'Playing' : 'Paused'}
            onClick={togglePlayPause}
            color={isPlaying ? 'success' : 'default'}
            size="small"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
          />
        </Box>

        <Box sx={{ px: 1, mb: 2 }}>
          <Slider
            value={timelineValue}
            onChange={handleSliderChange}
            step={null}
            marks={timelineMarks}
            min={0}
            max={24}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}h`}
            sx={{
              '& .MuiSlider-markLabel': {
                fontSize: '0.7rem',
              },
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
              },
              '& .MuiSlider-track': {
                height: 6,
              },
              '& .MuiSlider-rail': {
                height: 6,
              },
            }}
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1.5,
          backgroundColor: '#f0f7ff',
          borderRadius: 1,
          border: '1px solid #1976d2'
        }}>
          <Typography variant="caption" color="text.secondary">
            Showing prediction for:
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            +{timelineValue} hours
          </Typography>
        </Box>
      </Paper>

      {/* Current Risk Score */}
      <Paper elevation={2} sx={{ m: 2, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Current Risk Score
          </Typography>
          <Chip
            label={currentDanger.level}
            color={currentDanger.color}
            size="small"
            icon={<Warning />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h2" fontWeight="bold" color={getRiskColor(predictionData.currentRisk)}>
            {predictionData.currentRisk}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            / 100
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={predictionData.currentRisk}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getRiskColor(predictionData.currentRisk),
              borderRadius: 5,
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Spread Radius
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {predictionData.spreadRadius}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Trend
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp color="error" fontSize="small" />
              <Typography variant="body2" fontWeight="bold" color="error">
                Increasing
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 6-Hour Prediction */}
      <Paper elevation={2} sx={{ m: 2, mt: 0, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            6-Hour Prediction
          </Typography>
        </Box>

        {predictionData.predictions.sixHour.map((pred, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              mb: 1.5,
              border: `2px solid ${getRiskColor(pred.risk)}`,
              backgroundColor: `${getRiskColor(pred.risk)}08`,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  +{pred.time}
                </Typography>
                <Chip
                  label={`${pred.risk}%`}
                  size="small"
                  sx={{
                    backgroundColor: getRiskColor(pred.risk),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Spread: <strong>{pred.spread}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Direction: <strong>{pred.direction}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Paper>

      {/* 24-Hour Prediction */}
      <Paper elevation={2} sx={{ m: 2, mt: 0, p: 2.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule color="error" />
          <Typography variant="subtitle1" fontWeight="bold">
            24-Hour Prediction
          </Typography>
        </Box>

        {predictionData.predictions.twentyFourHour.map((pred, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              mb: 1.5,
              border: `2px solid ${getRiskColor(pred.risk)}`,
              backgroundColor: `${getRiskColor(pred.risk)}08`,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  +{pred.time}
                </Typography>
                <Chip
                  label={`${pred.risk}%`}
                  size="small"
                  sx={{
                    backgroundColor: getRiskColor(pred.risk),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Spread: <strong>{pred.spread}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Direction: <strong>{pred.direction}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Paper>

      {/* Danger Level Legend */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#fafafa',
          borderTop: '1px solid #e0e0e0',
          borderRadius: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Danger Levels
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Low (0-30)" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
          <Chip label="Moderate (30-60)" size="small" sx={{ backgroundColor: '#ff9800', color: 'white' }} />
          <Chip label="High (60-80)" size="small" sx={{ backgroundColor: '#f44336', color: 'white' }} />
          <Chip label="Critical (80-100)" size="small" sx={{ backgroundColor: '#d32f2f', color: 'white' }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default RightSidebar;
