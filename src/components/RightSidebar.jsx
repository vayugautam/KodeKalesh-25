import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  LocalFireDepartment,
  TrendingUp,
  Schedule,
  Warning,
} from '@mui/icons-material';

const RightSidebar = ({ selectedLocation }) => {
  // Dummy prediction data
  const predictionData = {
    currentRisk: 72,
    dangerLevel: 'High',
    spreadRadius: '2.3 km',
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
