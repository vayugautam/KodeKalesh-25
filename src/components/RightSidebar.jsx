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
import { RISK_COLORS, getRiskColor, getRiskLevel } from '../theme';

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
    return getRiskLevel(risk);
  };

  const currentDanger = getDangerLevel(predictionData.currentRisk);

  // Generate alerts based on weather data
  const generateAlerts = () => {
    const alerts = [];
    const weather = weatherData?.current;
    
    if (weather) {
      // High wind speed alert (critical if > 30 km/h)
      if (weather.windSpeed > 30) {
        alerts.push({ 
          icon: '⚠', 
          text: 'High wind speed detected', 
          critical: true 
        });
      } else if (weather.windSpeed > 20) {
        alerts.push({ 
          icon: '⚠', 
          text: 'Moderate wind speed detected', 
          critical: false 
        });
      }

      // Low humidity alert (critical if < 20%)
      if (weather.humidity < 20) {
        alerts.push({ 
          icon: '⚡', 
          text: 'Low humidity increases risk', 
          critical: true 
        });
      } else if (weather.humidity < 40) {
        alerts.push({ 
          icon: '⚡', 
          text: 'Humidity below normal levels', 
          critical: false 
        });
      }

      // High temperature alert (critical if > 35°C)
      if (weather.temperature > 35) {
        alerts.push({ 
          icon: '🌡️', 
          text: 'Extreme temperature detected', 
          critical: true 
        });
      } else if (weather.temperature > 30) {
        alerts.push({ 
          icon: '🌡️', 
          text: 'High temperature conditions', 
          critical: false 
        });
      }
    }

    // Fire cluster alert based on risk score
    if (baseRisk > 80) {
      alerts.push({ 
        icon: '🔥', 
        text: 'Fire cluster forming in Sector 4', 
        critical: true 
      });
    } else if (baseRisk > 60) {
      alerts.push({ 
        icon: '🔥', 
        text: 'Elevated fire risk in area', 
        critical: false 
      });
    }

    // Add dummy alert if no alerts
    if (alerts.length === 0) {
      alerts.push({ 
        icon: '✓', 
        text: 'No critical alerts at this time', 
        critical: false 
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

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

      {/* Alerts Section */}
      <Paper elevation={2} sx={{ m: 2, mt: 2, p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ fontSize: 18, color: '#f57c00' }} />
          Active Alerts
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {alerts.map((alert, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: alert.critical ? RISK_COLORS.danger.bg : '#f5f5f5',
                border: `1px solid ${alert.critical ? RISK_COLORS.danger.main : '#e0e0e0'}`,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: alert.critical ? `0 2px 8px ${RISK_COLORS.danger.light}40` : '0 2px 4px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Typography sx={{ fontSize: '1.2rem', minWidth: '24px' }}>
                {alert.icon}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  flexGrow: 1,
                  color: alert.critical ? RISK_COLORS.danger.text : 'text.primary',
                  fontWeight: alert.critical ? 600 : 400,
                }}
              >
                {alert.text}
              </Typography>
            </Box>
          ))}
        </Box>
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
            color={currentDanger.mui}
            size="small"
            icon={<Warning />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h2" fontWeight="bold" color={currentDanger.color.main}>
            {Math.round(predictionData.currentRisk)}
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
              backgroundColor: currentDanger.color.main,
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
              backgroundColor: `${getRiskColor(pred.risk)}15`,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  +{pred.time}
                </Typography>
                <Chip
                  label={`${Math.round(pred.risk)}%`}
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
              backgroundColor: `${getRiskColor(pred.risk)}15`,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  +{pred.time}
                </Typography>
                <Chip
                  label={`${Math.round(pred.risk)}%`}
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
          <Chip label="Safe (0-30)" size="small" sx={{ backgroundColor: RISK_COLORS.safe.main, color: 'white' }} />
          <Chip label="Medium (30-60)" size="small" sx={{ backgroundColor: RISK_COLORS.medium.dark, color: 'white' }} />
          <Chip label="High (60-80)" size="small" sx={{ backgroundColor: RISK_COLORS.danger.main, color: 'white' }} />
          <Chip label="Critical (80-100)" size="small" sx={{ backgroundColor: RISK_COLORS.critical.main, color: 'white' }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default RightSidebar;
