import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  LocalFireDepartment,
  TrendingUp,
  Schedule,
  Warning,
} from '@mui/icons-material';
import { RISK_COLORS, getRiskColor, getRiskLevel } from '../theme';
import TimelineControl from './TimelineControl';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const RightSidebar = ({ selectedLocation, weatherData, prediction, lastRequest, onTimeChange }) => {
  const [timelineIndex, setTimelineIndex] = useState(0);

  const baseWeatherRisk = weatherData?.risk?.score || 72;
  const liveModelRisk = typeof prediction?.score === 'number' ? prediction.score : null;
  const hasModelScore = typeof liveModelRisk === 'number';
  const baseRisk = hasModelScore ? liveModelRisk : baseWeatherRisk;
  const clampRisk = (value) => {
    const numeric = Number.isFinite(value) ? value : 0;
    return Math.max(0, Math.min(Math.round(numeric), 100));
  };
  const formatToken = (token) => (typeof token === 'string' ? token.toUpperCase() : token);
  const formatNumber = (value, suffix = '') => (typeof value === 'number' ? `${value}${suffix}` : undefined);

  // All prediction data points - dynamically calculated based on real weather
  const allPredictions = useMemo(
    () => [
      { time: 0, risk: baseRisk, spread: '0 km', direction: '-', label: 'Current' },
      { time: 2, risk: Math.min(baseRisk - 5, 95), spread: '1.2 km', direction: 'NE' },
      { time: 4, risk: Math.min(baseRisk, 95), spread: '1.8 km', direction: 'NE' },
      { time: 6, risk: Math.min(baseRisk + 3, 98), spread: '2.5 km', direction: 'E' },
      { time: 12, risk: Math.min(baseRisk + 10, 98), spread: '4.2 km', direction: 'E' },
      { time: 18, risk: Math.min(baseRisk + 16, 99), spread: '6.1 km', direction: 'SE' },
      { time: 24, risk: Math.min(baseRisk + 20, 99), spread: '8.5 km', direction: 'SE' },
    ],
    [baseRisk]
  );

  const timelineStops = useMemo(
    () =>
      allPredictions.map(point => ({
        label: `${point.time}h`,
        value: point.time,
        meta: point,
      })),
    [allPredictions]
  );

  useEffect(() => {
    setTimelineIndex(prev => Math.min(prev, timelineStops.length - 1));
  }, [timelineStops.length]);

  const currentPrediction = allPredictions[timelineIndex] || allPredictions[0];
  const timelineValue = currentPrediction?.time ?? 0;

  // Notify parent component of time change
  useEffect(() => {
    if (currentPrediction && onTimeChange) {
      onTimeChange(currentPrediction.time, currentPrediction);
    }
  }, [currentPrediction, onTimeChange]);

  const handleTimelineSeek = index => {
    setTimelineIndex(index);
  };

  const handleTimelineTick = index => {
    setTimelineIndex(index);
  };

  // Dummy prediction data
  const predictionData = {
    currentRisk: clampRisk(currentPrediction.risk),
    dangerLevel: getRiskLevel(currentPrediction.risk).level,
    spreadRadius: currentPrediction.spread,
    predictions: {
      sixHour: [
        { time: '2h', risk: clampRisk(currentPrediction.risk - 7), spread: '1.2 km', direction: 'NE' },
        { time: '4h', risk: clampRisk(currentPrediction.risk - 2), spread: '1.8 km', direction: 'NE' },
        { time: '6h', risk: clampRisk(currentPrediction.risk + 3), spread: '2.5 km', direction: 'E' },
      ],
      twentyFourHour: [
        { time: '6h', risk: clampRisk(currentPrediction.risk + 3), spread: '2.5 km', direction: 'E' },
        { time: '12h', risk: clampRisk(currentPrediction.risk + 10), spread: '4.2 km', direction: 'E' },
        { time: '18h', risk: clampRisk(currentPrediction.risk + 16), spread: '6.1 km', direction: 'SE' },
        { time: '24h', risk: clampRisk(currentPrediction.risk + 20), spread: '8.5 km', direction: 'SE' },
      ],
    },
  };

  const timelineDanger = getRiskLevel(predictionData.currentRisk);
  const modelDanger = hasModelScore ? getRiskLevel(liveModelRisk) : null;
  const modelScoreDisplay = hasModelScore ? Math.round(liveModelRisk) : '—';

  // Generate alerts based on weather data
  const generateAlerts = () => {
    const alerts = [];
    const weather = weatherData?.current;
    const combinedRisk = hasModelScore ? liveModelRisk : predictionData.currentRisk;

    if (hasModelScore) {
      if (liveModelRisk >= 85) {
        alerts.push({
          icon: '🔥',
          text: 'Model predicts critical fire activity',
          critical: true,
        });
      } else if (liveModelRisk >= 70) {
        alerts.push({
          icon: '🔥',
          text: 'Model indicates elevated fire risk',
          critical: false,
        });
      }
    }
    
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
    if (combinedRisk > 80) {
      alerts.push({ 
        icon: '🔥', 
        text: 'Fire cluster forming in Sector 4', 
        critical: true 
      });
    } else if (combinedRisk > 60) {
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
        <TimelineControl
          timeline={timelineStops}
          initialIndex={timelineIndex}
          onSeek={handleTimelineSeek}
          onTick={handleTimelineTick}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
            mt: 2,
            backgroundColor: '#f0f7ff',
            borderRadius: 1,
            border: '1px solid #1976d2',
          }}
        >
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
            label={timelineDanger.level}
            color={timelineDanger.mui}
            size="small"
            icon={<Warning />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h2" fontWeight="bold" color={timelineDanger.color.main}>
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
              backgroundColor: timelineDanger.color.main,
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

      {/* Live Model Output */}
      <Paper elevation={2} sx={{ m: 2, mt: 0, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">
              Latest Model Output
            </Typography>
          </Box>
          {prediction ? (
            <Chip label="Live" color="success" size="small" />
          ) : (
            <Chip label="Awaiting run" color="default" size="small" />
          )}
        </Box>

        {prediction ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography variant="h3" fontWeight="bold" color={modelDanger?.color?.main || 'text.primary'}>
                {modelScoreDisplay}
              </Typography>
              <Typography variant="h6" color="text.secondary">/ 100</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={prediction.bucket || 'Unknown bucket'}
                size="small"
                sx={{ fontWeight: 'bold', backgroundColor: modelDanger?.color?.bg || '#eee', color: modelDanger?.color?.text || 'inherit' }}
              />
              {prediction.color && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: prediction.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <Typography variant="caption" color="text.secondary">
                    Model color
                  </Typography>
                </Box>
              )}
            </Box>

            {lastRequest && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                {[
                  {
                    label: 'Grid Cell',
                    value:
                      Number.isFinite(lastRequest.X) && Number.isFinite(lastRequest.Y)
                        ? `X${lastRequest.X} · Y${lastRequest.Y}`
                        : undefined,
                  },
                  { label: 'Month', value: formatToken(lastRequest.month) },
                  { label: 'Day', value: formatToken(lastRequest.day) },
                  { label: 'Temp', value: formatNumber(lastRequest.temp, '°C') },
                  { label: 'Humidity', value: formatNumber(lastRequest.RH, '%') },
                  { label: 'Wind', value: formatNumber(lastRequest.wind, ' km/h') },
                  { label: 'Rain', value: formatNumber(lastRequest.rain, ' mm') },
                  { label: 'FFMC', value: formatNumber(lastRequest.FFMC) },
                  { label: 'DMC', value: formatNumber(lastRequest.DMC) },
                  { label: 'DC', value: formatNumber(lastRequest.DC) },
                  { label: 'ISI', value: formatNumber(lastRequest.ISI) },
                ].map(({ label, value }) => (
                  value !== undefined && (
                    <Box key={label} sx={{ p: 1, borderRadius: 1, backgroundColor: '#f7f9fc', border: '1px solid #e3e9f2' }}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {value}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Run a prediction from the left sidebar to see live model output using the current weather snapshot.
          </Typography>
        )}
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

RightSidebar.propTypes = {
  selectedLocation: PropTypes.shape({
    name: PropTypes.string,
    region: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  weatherData: PropTypes.shape({
    risk: PropTypes.shape({
      score: PropTypes.number,
    }),
    current: PropTypes.shape({
      temperature: PropTypes.number,
      humidity: PropTypes.number,
      windSpeed: PropTypes.number,
      windDirection: PropTypes.string,
    }),
  }),
  prediction: PropTypes.shape({
    score: PropTypes.number,
    bucket: PropTypes.string,
    color: PropTypes.string,
  }),
  lastRequest: PropTypes.shape({
    X: PropTypes.number,
    Y: PropTypes.number,
    month: PropTypes.string,
    day: PropTypes.string,
    temp: PropTypes.number,
    RH: PropTypes.number,
    wind: PropTypes.number,
    rain: PropTypes.number,
    FFMC: PropTypes.number,
    DMC: PropTypes.number,
    DC: PropTypes.number,
    ISI: PropTypes.number,
  }),
  onTimeChange: PropTypes.func,
};
