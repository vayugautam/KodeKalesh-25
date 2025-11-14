# Animated Heatmap Transitions

## Overview

Smooth animated transitions for heatmap layers with crossfade effects and intensity interpolation. When new heatmap data arrives, the old layer fades out while the new layer fades in over 600ms with ease-in-out cubic easing.

## Features

✅ **Crossfade Transitions** - Smooth opacity crossfade between old and new heatmap layers  
✅ **Intensity Interpolation** - Gradual intensity changes for existing points  
✅ **Point Fade In/Out** - New points fade in, removed points fade out  
✅ **Timeline Synchronization** - Transitions work seamlessly with timeline predictions  
✅ **Easing Functions** - Ease-in-out cubic for natural-looking animations  
✅ **Performance Optimized** - Uses requestAnimationFrame for smooth 60fps  
✅ **Visual Feedback** - Transition indicator shows when animation is active  

## Implementation

### Custom Hook: `useHeatmapTransition`

```javascript
import { useHeatmapTransition } from '../hooks/useHeatmapTransition'

const { currentData, isTransitioning, progress } = useHeatmapTransition(
  oldData,      // Previous heatmap data
  newData,      // New heatmap data
  600,          // Duration in ms (default: 600)
  timelineValue // Timeline value for intensity calculation
)
```

### Hook Return Values

| Property | Type | Description |
|----------|------|-------------|
| `currentData` | `Array` | Interpolated data points for current frame |
| `isTransitioning` | `boolean` | Whether transition is in progress |
| `progress` | `number` | Transition progress (0 to 1) |

### Data Point Structure

Each interpolated point includes:

```javascript
{
  id: 'f1',
  position: [lat, lon],
  riskScore: 0.85,                    // Original risk score
  _interpolatedIntensity: 0.72,       // Calculated interpolated intensity
  _opacity: 0.95                      // Fade in/out opacity
}
```

## Usage in MapView

### AnimatedHeatmapLayer Component

```javascript
<AnimatedHeatmapLayer 
  points={displayFireLocations} 
  timelineValue={timelineValue}
  onTransitionChange={setHeatmapTransitioning}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `points` | `Array` | Array of fire location data points |
| `timelineValue` | `number` | Current timeline value (0-24 hours) |
| `onTransitionChange` | `function` | Callback when transition state changes |

## Transition Logic

### 1. Existing Points (in both old and new data)
- **Intensity interpolation**: Smooth transition from old to new intensity
- **Opacity**: Remains at 100%
- **Position**: Uses new data position

### 2. New Points (only in new data)
- **Fade In**: Opacity goes from 0% to 100%
- **Intensity**: Multiplied by fade-in progress
- **Duration**: 600ms

### 3. Removed Points (only in old data)
- **Fade Out**: Opacity goes from 100% to 0%
- **Intensity**: Multiplied by fade-out progress (1 - progress)
- **Removal**: Removed when opacity < 10%

### 4. Timeline Integration

Intensity adjusts based on timeline prediction:

```javascript
const intensityMultiplier = 1 + (timelineValue / 6) * 0.15
```

- **0 hours**: Base intensity
- **6 hours**: +15% intensity
- **12 hours**: +30% intensity
- **24 hours**: +60% intensity

## Animation Details

### Easing Function

Uses **ease-in-out cubic** for natural motion:

```javascript
const easeInOutCubic = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}
```

This creates:
- Slow start (ease-in)
- Fast middle
- Slow end (ease-out)

### Crossfade Implementation

Two layers exist during transition:

1. **Old Layer**
   - `minOpacity: 0.4 * (1 - progress)`
   - `maxOpacity: 0.8 * (1 - progress)`
   - Fades from 80% → 0%

2. **New Layer**
   - `minOpacity: 0.4 * progress`
   - `maxOpacity: 0.8 * progress`
   - Fades from 0% → 80%

### Frame-by-Frame Animation

```
Frame 0ms:   Old 80% | New 0%
Frame 150ms: Old 60% | New 20%
Frame 300ms: Old 40% | New 40%  ← Midpoint
Frame 450ms: Old 20% | New 60%
Frame 600ms: Old 0%  | New 80%
```

## Visual Indicators

### Transition Badge

Appears when heatmap is animating:

```jsx
{heatmapTransitioning && showHeatmap && (
  <Paper sx={{ /* styles */ }}>
    <PulseDot />
    <Typography>Transitioning heatmap...</Typography>
  </Paper>
)}
```

Features:
- Blue background (`rgba(25, 118, 210, 0.95)`)
- Pulsing dot animation
- Auto-hides when transition completes

## Performance Optimizations

### 1. RequestAnimationFrame
- Uses browser's animation loop
- Targets 60fps
- Automatically syncs with display refresh

### 2. Cleanup
- Cancels animation frames on unmount
- Removes old layers after fade-out
- Prevents memory leaks

### 3. Efficient Updates
- Only updates when data or timeline changes
- Caches previous data in refs
- Minimal re-renders

### 4. Layer Management
```javascript
// Keep track of layers
const heatLayerRef = useRef(null)      // Current layer
const oldHeatLayerRef = useRef(null)   // Fading out layer

// Cleanup
if (progress >= 0.98) {
  map.removeLayer(oldHeatLayerRef.current)
  oldHeatLayerRef.current = null
}
```

## Timeline Transition Example

When timeline slider moves from 0h → 6h:

```javascript
// Point f1 transitions
{
  id: 'f1',
  position: [23.5937, 78.9629],
  riskScore: 0.85,
  
  // Frame 0: Intensity = 0.85 * 1.0 = 0.85
  // Frame 300ms: Intensity = 0.85 * 1.075 = 0.914
  // Frame 600ms: Intensity = 0.85 * 1.15 = 0.978
}
```

Visual effect:
- Heatmap gradually becomes more intense
- Smooth color transitions (green → yellow → red)
- Radius expands slightly
- All changes animated over 600ms

## Use Cases

### 1. Timeline Changes
User moves slider → Heatmap smoothly transitions

### 2. Data Updates
New fire locations detected → Fade in new points

### 3. Risk Level Changes
Fire intensity increases → Smooth intensity ramp-up

### 4. Location Removal
Fire extinguished → Fade out point

## Browser Support

- ✅ Chrome 61+
- ✅ Firefox 55+
- ✅ Safari 13+
- ✅ Edge 79+

Requires:
- `requestAnimationFrame` support
- ES6 features (const, let, arrow functions)
- React Hooks

## Troubleshooting

### Transition too fast/slow?

Adjust duration:
```javascript
useHeatmapTransition(oldData, newData, 1000) // 1 second
```

### Choppy animations?

Ensure no heavy computations in render cycle:
```javascript
// ✅ Good - memoized
const processedData = useMemo(() => {
  return heavyComputation(data)
}, [data])

// ❌ Bad - recalculates every frame
const processedData = heavyComputation(data)
```

### Layers not removing?

Check cleanup in useEffect:
```javascript
useEffect(() => {
  // ... animation code ...
  
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }
}, [dependencies])
```

## Advanced Usage

### Custom Easing

Modify the easing function for different feels:

```javascript
// Linear (no easing)
const linear = (t) => t

// Ease-out (fast start, slow end)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

// Bounce (overshoot and return)
const bounce = (t) => {
  if (t < 0.5) return 4 * t * t
  return 1 - Math.pow(-2 * t + 2, 2) / 2
}
```

### Multiple Heatmap Layers

Transition each independently:

```javascript
const fires = useHeatmapTransition(oldFires, newFires, 600)
const floods = useHeatmapTransition(oldFloods, newFloods, 600)

return (
  <>
    <AnimatedHeatmapLayer data={fires.currentData} />
    <AnimatedHeatmapLayer data={floods.currentData} />
  </>
)
```

## Related Utilities

### useIntensityTransition

For simple value transitions:

```javascript
import { useIntensityTransition } from '../hooks/useHeatmapTransition'

const currentIntensity = useIntensityTransition(oldValue, newValue, 600)
```

Use for:
- Risk score badges
- Temperature displays
- Any numeric value that needs smooth transitions

---

**Implemented for Forest Fire Prediction Dashboard** 🔥  
**Version:** 1.0.0  
**Animation Duration:** 600ms  
**Frame Rate:** 60fps
