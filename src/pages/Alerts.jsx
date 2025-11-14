import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  LinearProgress,
  Switch,
  FormControlLabel,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { RISK_COLORS } from '../theme'
import { useRiskAlerts } from '../hooks/useRisk'
import { useSnackbar } from 'notistack'

const FALLBACK_ALERTS = [
  {
    id: 'AL-2041',
    severity: 'critical',
    title: 'Wind-driven spread expected within 2 hours',
    location: 'Nilgiris, Tamil Nadu',
    updated: '12 mins ago',
    details: 'Gusts above 45 km/h aligned with slopes. Hold bulldozer line at sector 7 and deploy aerial support.',
    sectors: ['S-07', 'S-08'],
    resources: '2 crews, 1 tanker',
  },
  {
    id: 'AL-2037',
    severity: 'high',
    title: 'Dry lightning cluster forecast',
    location: 'Gadchiroli, Maharashtra',
    updated: '28 mins ago',
    details: '14 strikes recorded in last pass. Patrol teams to sweep forest compartments 11B-15D.',
    sectors: ['11B', '15D'],
    resources: 'Patrol group Bravo',
  },
  {
    id: 'AL-2021',
    severity: 'medium',
    title: 'Community smoke reports pending validation',
    location: 'Shimla, Himachal Pradesh',
    updated: '45 mins ago',
    details: 'Three separate 112 calls referencing visible smoke. Dispatch reconnaissance drone once ceiling clears.',
    sectors: ['North Ridge'],
    resources: 'Recon drone',
  },
]

const REGION_OPTIONS = ['South Asia', 'Western Ghats', 'Central India', 'North East']

const severityPalette = {
  critical: RISK_COLORS.critical,
  high: RISK_COLORS.danger,
  medium: RISK_COLORS.medium,
  low: RISK_COLORS.safe,
}

function Alerts() {
  const [region, setRegion] = useState(REGION_OPTIONS[0])
  const [refreshKey, setRefreshKey] = useState(0)
  const [followFeed, setFollowFeed] = useState(true)
  const [hasNewWhilePaused, setHasNewWhilePaused] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const listRef = useRef(null)
  const { data, loading, error } = useRiskAlerts(region, true, refreshKey)
  const { enqueueSnackbar } = useSnackbar()

  const alerts = data?.alerts || FALLBACK_ALERTS
  const previousIdsRef = useRef(alerts.map(alert => alert.id))

  const groupedAlerts = useMemo(() => {
    const groups = []
    const processed = new Set()

    alerts.forEach((alert, index) => {
      if (processed.has(alert.id)) return

      const similar = alerts.slice(index + 1).filter(other => {
        if (processed.has(other.id)) return false
        const timeDiff = Math.abs(
          new Date().getTime() - new Date(alert.updated || Date.now()).getTime()
        )
        return (
          other.location === alert.location &&
          timeDiff <= 10 * 60 * 1000 &&
          !processed.has(other.id)
        )
      })

      if (similar.length > 0) {
        groups.push({
          id: `group-${alert.id}`,
          isGroup: true,
          main: alert,
          collapsed: similar,
          count: similar.length + 1,
        })
        processed.add(alert.id)
        similar.forEach(a => processed.add(a.id))
      } else {
        groups.push({ id: alert.id, isGroup: false, main: alert })
        processed.add(alert.id)
      }
    })

    return groups
  }, [alerts])

  const highPriorityCount = useMemo(
    () => alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length,
    [alerts]
  )

  useEffect(() => {
    const previousIds = previousIdsRef.current
    const latestIds = alerts.map(alert => alert.id)

    const newestId = latestIds[0]
    const isNew = newestId && !previousIds.includes(newestId)

    const topViewport = listRef.current?.state?.scrollOffset ?? 0
    const nearBottom = topViewport >= (groupedAlerts.length - 2) * 220

    if (isNew) {
      const newest = alerts[0]
      if (newest.severity === 'critical' || newest.severity === 'high') {
        enqueueSnackbar(`${newest.severity.toUpperCase()}: ${newest.title}`, {
          variant: newest.severity === 'critical' ? 'error' : 'warning',
          persist: false,
        })
      }

      if (followFeed || nearBottom) {
        listRef.current?.scrollToItem(0, 'smart')
      } else {
        setHasNewWhilePaused(true)
      }
    }

    previousIdsRef.current = latestIds
  }, [alerts, followFeed, groupedAlerts.length, enqueueSnackbar])

  const toggleGroup = groupId => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const expandAll = () => {
    const allGroupIds = groupedAlerts.filter(g => g.isGroup).map(g => g.id)
    setExpandedGroups(new Set(allGroupIds))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  const counts = useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        acc.total += 1
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      },
      { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
    )
  }, [alerts])

  const summaryCards = [
    { label: 'Total Alerts', value: counts.total, tone: '#1976d2' },
    { label: 'Critical', value: counts.critical, tone: RISK_COLORS.critical.main },
    { label: 'High', value: counts.high, tone: RISK_COLORS.danger.main },
    { label: 'Medium', value: counts.medium, tone: RISK_COLORS.medium.dark },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 4, backgroundColor: '#f5f9ff' }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            Alerts Console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor escalations, acknowledge tickets, and coordinate response priorities across regions.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                value={region}
                label="Region"
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGION_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => setRefreshKey(prev => prev + 1)}
            >
              Refresh feed
            </Button>
          </Stack>
          {loading && <LinearProgress color="primary" />}
          {error && (
            <Chip color="warning" variant="outlined" label={`API fallback in use: ${error}`} />
          )}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {summaryCards.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: card.tone }}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 560, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Live Feed
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="small" onClick={expandedGroups.size > 0 ? collapseAll : expandAll}>
                  {expandedGroups.size > 0 ? 'Collapse all' : 'Expand all'}
                </Button>
                <FormControlLabel
                  control={<Switch checked={followFeed} onChange={(_, checked) => {
                    setFollowFeed(checked)
                    if (checked) {
                      setHasNewWhilePaused(false)
                      listRef.current?.scrollToItem(0, 'smart')
                    }
                  }} size="small" />}
                  label="Follow"
                />
                <Chip label={`${highPriorityCount} high priority`} size="small" color="error" variant="outlined" />
              </Stack>
            </Stack>
            {!groupedAlerts.length && (
              <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                <Typography variant="body2" color="text.secondary">
                  No alerts in this region
                </Typography>
              </Box>
            )}
            {!!groupedAlerts.length && (
              <Box sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'auto', maxHeight: 480 }}>
                {groupedAlerts.map((item, index) => {
                  const alert = item.isGroup ? item.alert : item;
                  const isExpanded = item.isGroup && expandedGroups.has(item.groupId);
                  const palette = severityPalette[alert.severity] || RISK_COLORS.medium;

                  return (
                    <Box key={alert.id} sx={{ px: 1, py: 0.5 }}>
                      <Card variant="outlined" sx={{
                        bgcolor: alert.severity === 'CRITICAL' ? 'error.50' :
                                 alert.severity === 'HIGH' ? 'warning.50' :
                                 alert.severity === 'MEDIUM' ? 'info.50' : 'background.paper',
                        borderLeft: 4,
                        borderLeftColor: palette.main
                      }}>
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <Chip
                                  size="small"
                                  sx={{ backgroundColor: palette.main, color: '#fff', fontWeight: 600 }}
                                  icon={<WarningAmberIcon sx={{ color: 'inherit', fontSize: 14 }} />}
                                  label={alert.severity}
                                />
                                <Typography variant="caption" fontWeight={600}>
                                  {alert.location}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  {alert.updated}
                                </Typography>
                                {item.isGroup && (
                                  <Chip
                                    label={`+${item.similarAlerts.length}`}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => toggleGroup(item.groupId)}
                                    clickable
                                  />
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {alert.title || alert.details}
                              </Typography>
                            </Box>
                            {item.isGroup && (
                              <IconButton size="small" onClick={() => toggleGroup(item.groupId)}>
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            )}
                          </Stack>

                          {item.isGroup && (
                            <Collapse in={isExpanded}>
                              <Box sx={{ mt: 1, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                                {item.similarAlerts.map((similarAlert) => {
                                  const simPalette = severityPalette[similarAlert.severity] || RISK_COLORS.medium;
                                  return (
                                    <Card key={similarAlert.id} variant="outlined" sx={{ mb: 1, bgcolor: 'background.paper' }}>
                                      <CardContent sx={{ py: 0.5, '&:last-child': { pb: 0.5 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                          <Chip
                                            size="small"
                                            sx={{ backgroundColor: simPalette.main, color: '#fff', fontSize: 10 }}
                                            label={similarAlert.severity}
                                          />
                                          <Typography variant="caption" fontWeight={600}>
                                            {similarAlert.location}
                                          </Typography>
                                          <Typography variant="caption" color="text.disabled">
                                            {similarAlert.updated}
                                          </Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          {similarAlert.title || similarAlert.details}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </Box>
                            </Collapse>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
            {hasNewWhilePaused && !followFeed && (
              <Alert
                severity="info"
                sx={{ mt: 1 }}
                action={
                  <Button color="inherit" size="small" onClick={() => {
                    listRef.current?.scrollToItem(0, 'smart')
                    setHasNewWhilePaused(false)
                  }}>
                    View
                  </Button>
                }
              >
                New high-priority alert received
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Escalation timeline
            </Typography>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600}>
                    Critical queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {counts.critical} awaiting
                  </Typography>
                </Stack>
                <LinearProgress value={Math.min(counts.critical * 25, 100)} variant="determinate" color="error" />
              </Stack>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600}>
                    High queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {counts.high} awaiting
                  </Typography>
                </Stack>
                <LinearProgress value={Math.min(counts.high * 20, 100)} variant="determinate" color="warning" />
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Response checklist
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">Brief district magistrate</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">Confirm tanker status</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ReportProblemIcon color="warning" fontSize="small" />
                    <Typography variant="body2">Awaiting weather clearance for sortie</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Alerts
