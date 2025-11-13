import { Box, Paper, Skeleton, Grid } from '@mui/material'

export const MapSkeleton = () => (
  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
    <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
    <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
      <Skeleton variant="rectangular" width={120} height={40} />
    </Box>
  </Box>
)

export const SidebarSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 3, borderRadius: 1 }} />
    
    {/* Legend skeleton */}
    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
)

export const RightSidebarSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    {/* Header */}
    <Skeleton variant="text" width="70%" height={40} sx={{ mb: 3 }} />
    
    {/* Alerts */}
    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
      <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1 }} />
    </Box>

    {/* Timeline */}
    <Skeleton variant="text" width="50%" height={30} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1, mb: 3 }} />

    {/* Risk Score */}
    <Skeleton variant="text" width="50%" height={30} sx={{ mb: 1 }} />
    <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
  </Box>
)

export const WeatherPanelSkeleton = () => (
  <Grid container spacing={2}>
    {[1, 2, 3, 4, 5].map((item) => (
      <Grid item xs={12} sm={6} md={2.4} key={item}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={30} />
            </Box>
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
)

export const CardSkeleton = ({ count = 1 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: count }).map((_, index) => (
      <Paper key={index} elevation={1} sx={{ p: 2 }}>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1, mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </Paper>
    ))}
  </Box>
)

export const TableSkeleton = ({ rows = 5 }) => (
  <Box>
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1 }} />
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />
    ))}
  </Box>
)

export default {
  MapSkeleton,
  SidebarSkeleton,
  RightSidebarSkeleton,
  WeatherPanelSkeleton,
  CardSkeleton,
  TableSkeleton,
}
