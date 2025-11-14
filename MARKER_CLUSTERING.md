# Marker Clustering with Decluttering

## Overview

Advanced marker clustering system for fire hotspots with risk-based coloring, smooth decluster animations on zoom, and intelligent popups showing the top 3 hotspots sorted by risk score.

## Features

✅ **Risk-Based Cluster Colors** - Red (high), orange (medium), amber (low) based on average risk  
✅ **Dynamic Cluster Sizing** - Icon size adapts to cluster count (40px→60px)  
✅ **Top 3 Hotspots Popup** - Shows highest risk locations with weather data  
✅ **Smooth Decluster Animations** - 400ms cubic-bezier transitions on zoom  
✅ **Auto-Decluster at Zoom 12** - Individual markers appear at high zoom levels  
✅ **Spiderfy on Max Zoom** - Expands overlapping markers with spider legs  
✅ **Hover Popups** - Cluster information on mouseover  
✅ **Performance Optimized** - Chunked loading, GPU acceleration  

## Implementation Details

### Package Installation

```bash
npm install react-leaflet-cluster
```

### Cluster Icon Creation

Custom cluster icons are dynamically generated based on:

1. **Cluster Count** - Determines icon size
   - < 10 markers: 40px
   - 10-49 markers: 50px
   - ≥ 50 markers: 60px

2. **Average Risk Score** - Determines color
   - ≥ 0.7: Red (#f44336) - High Risk
   - 0.5-0.69: Orange (#ff9800) - Medium Risk
   - < 0.5: Amber (#ffc107) - Low Risk

```javascript
const createClusterCustomIcon = (cluster) => {
  const childCount = cluster.getChildCount()
  const markers = cluster.getAllChildMarkers()
  
  // Calculate average risk
  const avgRisk = markers.reduce((sum, marker) => {
    const fire = FIRE_LOCATIONS.find(...)
    return sum + (fire?.riskScore || 0)
  }, 0) / childCount
  
  // Dynamic sizing and coloring
  const size = childCount < 10 ? 40 : childCount < 50 ? 50 : 60
  const bgColor = avgRisk >= 0.7 ? 'rgba(244,67,54,0.9)' : ...
  
  return L.divIcon({...})
}
```

### Cluster Configuration

```jsx
<MarkerClusterGroup
  ref={clusterGroupRef}
  chunkedLoading                      // Load markers in chunks (performance)
  iconCreateFunction={createClusterCustomIcon}
  spiderfyOnMaxZoom={true}           // Expand overlapping markers
  showCoverageOnHover={false}        // Hide coverage polygon
  zoomToBoundsOnClick={true}         // Zoom on cluster click
  maxClusterRadius={60}              // 60px clustering radius
  disableClusteringAtZoom={12}       // Individual markers at zoom 12+
  spiderfyDistanceMultiplier={1.5}   // Spider leg distance
  animate={true}                     // Enable animations
  animateAddingMarkers={true}        // Animate new markers
>
  {/* Individual markers */}
</MarkerClusterGroup>
```

### Cluster Popup Content

Popups display:

1. **Cluster Summary**
   - Total hotspot count
   - Average risk score (percentage)
   - Risk level badge (High/Medium/Low)

2. **Top 3 Hotspots** (sorted by risk score)
   - Ranking (#1, #2, #3)
   - Location name
   - Weather data (temperature, humidity, wind)
   - Individual risk percentage
   - Color-coded borders (red, orange, amber)

```javascript
const createClusterPopupContent = (cluster) => {
  const markers = cluster.getAllChildMarkers()
  
  // Sort by risk score descending
  const fires = markers
    .map(marker => findFireData(marker))
    .filter(Boolean)
    .sort((a, b) => b.riskScore - a.riskScore)
  
  const top3 = fires.slice(0, 3)
  const avgRisk = fires.reduce((sum, f) => sum + f.riskScore, 0) / fires.length
  
  return `<div>...</div>` // HTML content
}
```

### Event Handlers

```javascript
useEffect(() => {
  if (clusterGroupRef.current) {
    const clusterGroup = clusterGroupRef.current
    
    // Bind popup on hover
    clusterGroup.on('clustermouseover', (event) => {
      const cluster = event.layer
      const popupContent = createClusterPopupContent(cluster)
      cluster.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'cluster-popup'
      })
    })
    
    // Open popup on click
    clusterGroup.on('clusterclick', (event) => {
      event.layer.openPopup()
    })
  }
}, [])
```

## Animation Details

### Cluster Pulse Animation

```css
@keyframes cluster-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  }
}
```

- **Duration:** 2s infinite
- **Effect:** Gentle breathing animation
- **Purpose:** Draw attention to clusters

### Decluster Animation (Zoom In)

When zooming from level 10 → 12:

```
Frame 0ms:   Cluster visible (scale: 1, opacity: 1)
Frame 100ms: Cluster shrinking (scale: 0.7, opacity: 0.7)
Frame 200ms: Cluster fading (scale: 0.3, opacity: 0.3)
Frame 300ms: Markers appearing (scale: 0.5, opacity: 0)
Frame 400ms: Markers visible (scale: 1, opacity: 1)
```

```css
@keyframes marker-pop-in {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-20px);
  }
  50% {
    transform: scale(1.2) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

- **Duration:** 400ms
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) - bounce effect
- **Overshoot:** 1.2x scale at 50% (elastic feel)

### Spiderfy Animation (Max Zoom)

When multiple markers overlap at max zoom:

```css
@keyframes spiderfy-marker {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

Spider legs animate with dashed stroke:

```css
.leaflet-cluster-spider-leg {
  stroke: rgba(244, 67, 54, 0.6);
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  animation: spider-leg-dash 1s linear infinite;
}
```

## Zoom Behavior

| Zoom Level | Behavior | Cluster Radius | Markers |
|------------|----------|----------------|---------|
| 5-7 | Large clusters | 60px | Heavily clustered |
| 8-10 | Medium clusters | 60px | Moderate clustering |
| 11 | Small clusters | 60px | Few clusters |
| 12+ | **No clustering** | N/A | Individual markers |

### Transition at Zoom 12

```
Zoom 11 → 12:
- Clusters fade out (400ms)
- Individual markers pop in (400ms with bounce)
- Spider legs appear for overlapping markers
```

## Popup Design

### Cluster Popup Structure

```
┌──────────────────────────────────┐
│ 🔥 Fire Cluster                  │
│ 15 hotspots detected             │
├──────────────────────────────────┤
│ Average Risk Score               │
│ 78% [HIGH]                       │
├──────────────────────────────────┤
│ 📊 Top 3 Hotspots by Risk        │
│                                  │
│ #1 │ Maharashtra Fire Hotspot    │
│    │ 🌡️ 52°C │💧 18% │💨 22 km/h │
│    │ 92%                         │
│                                  │
│ #2 │ Madhya Pradesh Fire Zone    │
│    │ 🌡️ 45°C │💧 25% │💨 18 km/h │
│    │ 85%                         │
│                                  │
│ #3 │ Central India Fire          │
│    │ 🌡️ 48°C │💧 22% │💨 16 km/h │
│    │ 78%                         │
├──────────────────────────────────┤
│ 💡 Zoom in to see individual     │
│    markers                       │
└──────────────────────────────────┘
```

### Styling

- **Background colors:** Risk-based tinting (red/orange/amber)
- **Border left:** 3px colored stripe for ranking
- **Typography:** Clean hierarchy (13px names, 11px details)
- **Icons:** Emoji for visual clarity (🔥🌡️💧💨)
- **Responsive:** Max-width 320px, min-width 280px

## Performance Optimizations

### 1. Chunked Loading
```javascript
chunkedLoading={true}
```
Markers load in batches to prevent UI blocking.

### 2. GPU Acceleration
```css
.marker-cluster,
.leaflet-marker-icon {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

### 3. Reduced Clustering at High Zoom
```javascript
disableClusteringAtZoom={12}
```
Prevents unnecessary clustering calculations.

### 4. Optimized Transitions
```css
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```
Uses hardware-accelerated properties only.

## Usage Example

### Basic Setup

```jsx
import MarkerClusterGroup from 'react-leaflet-cluster'
import '../styles/markerCluster.css'

<MarkerClusterGroup
  ref={clusterGroupRef}
  iconCreateFunction={createClusterCustomIcon}
  maxClusterRadius={60}
  disableClusteringAtZoom={12}
  animate={true}
>
  {locations.map(location => (
    <Marker key={location.id} position={location.coords}>
      <Popup>{location.name}</Popup>
    </Marker>
  ))}
</MarkerClusterGroup>
```

### Custom Cluster Icons

```javascript
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 40 : count < 50 ? 50 : 60
  
  return L.divIcon({
    html: `<div style="...">
      <div>${count}</div>
      <div>markers</div>
    </div>`,
    iconSize: L.point(size, size, true)
  })
}
```

### Event Handling

```javascript
clusterGroup.on('clusterclick', (e) => {
  console.log('Cluster clicked:', e.layer.getChildCount())
})

clusterGroup.on('clustermouseover', (e) => {
  const popup = createPopup(e.layer)
  e.layer.bindPopup(popup).openPopup()
})
```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 61+ | ✅ Full support |
| Firefox | 55+ | ✅ Full support |
| Safari | 13+ | ✅ Full support |
| Edge | 79+ | ✅ Full support |
| Mobile Safari | 13+ | ✅ Full support |
| Chrome Android | 61+ | ✅ Full support |

Requires:
- CSS Animations (100% browser support)
- CSS Transforms (100% browser support)
- ES6 features (const, arrow functions, array methods)

## Troubleshooting

### Clusters not appearing?

Check that markers have unique keys:
```jsx
{markers.map(m => <Marker key={m.id} ... />)}
```

### Animations choppy?

Reduce cluster count or increase `maxClusterRadius`:
```javascript
maxClusterRadius={80} // Larger clusters, fewer total
```

### Popups not showing?

Ensure event handlers are bound:
```javascript
useEffect(() => {
  if (clusterGroupRef.current) {
    clusterGroupRef.current.on('clustermouseover', ...)
  }
}, [])
```

### Decluster too early/late?

Adjust zoom threshold:
```javascript
disableClusteringAtZoom={10} // Earlier decluster
disableClusteringAtZoom={14} // Later decluster
```

## Advanced Customization

### Custom Spider Legs

```css
.leaflet-cluster-spider-leg {
  stroke: #your-color;
  stroke-width: 3;
  stroke-dasharray: 10, 5;
}
```

### Custom Cluster Hover

```javascript
clusterGroup.on('clustermouseover', (e) => {
  e.layer.setIcon(hoverIcon)
})

clusterGroup.on('clustermouseout', (e) => {
  e.layer.setIcon(normalIcon)
})
```

### Cluster Animation Override

```css
.marker-cluster {
  animation: your-custom-animation 1s ease;
}
```

## Key Metrics

- **Cluster Radius:** 60px (configurable)
- **Decluster Zoom:** 12 (no clustering at zoom 12+)
- **Animation Duration:** 400ms
- **Pulse Duration:** 2s infinite
- **Spider Distance:** 1.5x multiplier
- **Top Hotspots Shown:** 3
- **Max Popup Width:** 320px

---

**Implemented for Forest Fire Prediction Dashboard** 🔥  
**Version:** 1.0.0  
**Package:** react-leaflet-cluster  
**Performance:** Optimized for 1000+ markers
