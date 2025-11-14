# Container Component Documentation

## Overview

A reusable, responsive container component that provides max-width constraints, auto-centering, and responsive padding. Perfect for creating consistent page layouts across your application.

## Features

✅ **Responsive max-width** - Choose from preset sizes (sm, md, lg, xl, xxl) or custom values  
✅ **Auto-centered content** - Automatically centers children horizontally  
✅ **Responsive padding** - Smart padding that adapts to screen size  
✅ **Gap support** - Easy spacing between child elements  
✅ **Full-width option** - Remove max-width for edge-to-edge layouts  
✅ **Material-UI integration** - Works seamlessly with MUI components  
✅ **Semantic HTML** - Render as any HTML element  
✅ **CSS Modules** - Scoped styling prevents conflicts  

## Installation

The component is already included in the project. Just import it:

```javascript
import Container from '../components/Container'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **Required** | Content to be contained |
| `fullWidth` | `boolean` | `false` | Removes max-width constraint |
| `gap` | `number \| string` | `0` | Gap between child elements (CSS value) |
| `maxWidth` | `string` | `'lg'` | Max-width preset or custom CSS value |
| `disablePadding` | `boolean` | `false` | Removes horizontal padding |
| `component` | `React.ElementType` | `'div'` | HTML element to render |
| `className` | `string` | `''` | Additional CSS classes |
| `sx` | `object` | `{}` | Material-UI sx prop |

## Max-Width Presets

| Preset | Value | Use Case |
|--------|-------|----------|
| `sm` | 640px | Forms, narrow content |
| `md` | 768px | Articles, single-column |
| `lg` | 1024px | **Default** - General content |
| `xl` | 1280px | Dashboards, wide layouts |
| `xxl` | 1536px | Extra-wide content |

## Responsive Padding

The container automatically adjusts padding based on screen size:

| Breakpoint | Padding (left/right) |
|------------|---------------------|
| < 640px | 16px |
| ≥ 640px | 24px |
| ≥ 768px | 32px |
| ≥ 1024px | 40px |
| ≥ 1280px | 48px |

## Usage Examples

### 1. Basic Usage (Default)

```javascript
import Container from '../components/Container'

function MyPage() {
  return (
    <Container>
      <h1>Welcome</h1>
      <p>This content is centered with max-width of 1024px</p>
    </Container>
  )
}
```

### 2. Small Container (Forms)

```javascript
<Container maxWidth="sm">
  <form>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Login</button>
  </form>
</Container>
```

### 3. Full Width Container

```javascript
<Container fullWidth>
  <header>
    <nav>Navigation spans full width</nav>
  </header>
</Container>
```

### 4. Container with Gap

```javascript
<Container gap={3}>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Container>
```

### 5. Extra Large Container (Dashboard)

```javascript
<Container maxWidth="xl">
  <Dashboard>
    Wide layout for complex dashboards
  </Dashboard>
</Container>
```

### 6. No Padding Container

```javascript
<Container disablePadding>
  <img src="hero.jpg" alt="Hero" style={{ width: '100%' }} />
</Container>
```

### 7. Custom Max-Width

```javascript
<Container maxWidth="900px">
  <article>Custom width content</article>
</Container>
```

### 8. Semantic HTML

```javascript
<Container component="section" maxWidth="md">
  <h2>Section Title</h2>
  <p>Renders as &lt;section&gt; element</p>
</Container>
```

### 9. With Material-UI Styling

```javascript
<Container 
  maxWidth="lg"
  sx={{ 
    backgroundColor: '#f5f5f5',
    py: 4,
    borderRadius: 2
  }}
>
  <Typography variant="h4">Styled Container</Typography>
</Container>
```

### 10. Nested Containers

```javascript
<Container fullWidth sx={{ backgroundColor: '#e0e0e0', py: 4 }}>
  <Container maxWidth="lg">
    <Paper>
      Centered content within full-width background
    </Paper>
  </Container>
</Container>
```

## Common Patterns

### Page Layout

```javascript
function Page() {
  return (
    <>
      {/* Full-width header */}
      <Container fullWidth disablePadding>
        <Header />
      </Container>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <MainContent />
      </Container>

      {/* Full-width footer */}
      <Container fullWidth disablePadding>
        <Footer />
      </Container>
    </>
  )
}
```

### Hero Section with Centered CTA

```javascript
<Container fullWidth sx={{ backgroundColor: '#1976d2', py: 8 }}>
  <Container maxWidth="md">
    <Typography variant="h2" color="white" align="center">
      Welcome to Our App
    </Typography>
    <Button variant="contained" fullWidth>
      Get Started
    </Button>
  </Container>
</Container>
```

### Form Container

```javascript
<Container maxWidth="sm" sx={{ py: 4 }}>
  <Paper elevation={3} sx={{ p: 4 }}>
    <Typography variant="h5" gutterBottom>
      Sign Up
    </Typography>
    <form>
      <TextField fullWidth label="Name" />
      <TextField fullWidth label="Email" />
      <Button variant="contained" fullWidth>
        Submit
      </Button>
    </form>
  </Paper>
</Container>
```

### Grid Layout

```javascript
<Container maxWidth="xl" gap={3}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Card>Left Column</Card>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card>Right Column</Card>
    </Grid>
  </Grid>
</Container>
```

### Dashboard Layout

```javascript
<Container fullWidth disablePadding>
  <Sidebar />
  <Container maxWidth="xl" sx={{ ml: 'auto', py: 3 }}>
    <DashboardContent />
  </Container>
</Container>
```

## Accessibility

- **Semantic HTML**: Use the `component` prop to render appropriate elements (`<main>`, `<section>`, `<article>`, etc.)
- **Focus Management**: All interactive children remain keyboard accessible
- **Screen Readers**: Container doesn't interfere with content announcement

## Performance

- **CSS Modules**: Scoped styles with minimal CSS output
- **Zero JavaScript Overhead**: Pure CSS for responsive behavior
- **Optimized Re-renders**: Only updates when props change

## Browser Support

- ✅ Chrome 61+
- ✅ Firefox 36+
- ✅ Safari 10+
- ✅ Edge 79+
- ✅ IE 11 (with CSS Grid polyfill)

## Styling Customization

### Override Styles with className

```javascript
<Container className="my-custom-container">
  Content
</Container>
```

```css
.my-custom-container {
  background-color: #f0f0f0;
  border-radius: 8px;
}
```

### Override Styles with sx Prop

```javascript
<Container sx={{ 
  backgroundColor: 'primary.main',
  color: 'white',
  borderRadius: 2,
  boxShadow: 3
}}>
  Content
</Container>
```

## TypeScript Support

```typescript
interface ContainerProps {
  children: React.ReactNode
  fullWidth?: boolean
  gap?: number | string
  className?: string
  sx?: SxProps<Theme>
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | string
  disablePadding?: boolean
  component?: React.ElementType
}
```

## Comparison with MUI Container

| Feature | Our Container | MUI Container |
|---------|--------------|---------------|
| Responsive padding | ✅ Custom presets | ✅ Fixed |
| Gap support | ✅ Built-in | ❌ Need wrapper |
| Full-width option | ✅ Simple prop | ⚠️ `maxWidth={false}` |
| Custom max-width | ✅ Any CSS value | ⚠️ Limited presets |
| No padding option | ✅ `disablePadding` | ⚠️ `disableGutters` |
| File size | ✅ Smaller | ⚠️ Larger bundle |

## Migration from MUI Container

Replace:
```javascript
import { Container } from '@mui/material'
```

With:
```javascript
import Container from '../components/Container'
```

Most props are compatible. Key differences:
- `maxWidth={false}` → `fullWidth={true}`
- `disableGutters` → `disablePadding`

## Troubleshooting

### Content not centered?
Ensure parent elements don't have `display: flex` without `justify-content: center`

### Padding not responsive?
Check if `disablePadding={true}` is set accidentally

### Max-width not working?
Verify `fullWidth` prop is not set to `true`

### Gap not applying?
Make sure children are direct descendants, or use a flex/grid wrapper

## Related Components

- **Box** - For low-level layout needs
- **Stack** - For vertical/horizontal stacking
- **Grid** - For complex grid layouts

## Best Practices

1. ✅ Use `sm` for forms and narrow content
2. ✅ Use `lg` (default) for general page content
3. ✅ Use `xl` or `xxl` for dashboards and data-heavy layouts
4. ✅ Use `fullWidth` for headers, footers, and hero sections
5. ✅ Nest containers for complex layouts (full-width background + centered content)
6. ✅ Use `component` prop for semantic HTML
7. ❌ Don't nest multiple non-full-width containers
8. ❌ Don't use both `fullWidth` and `maxWidth` (fullWidth overrides)

---

**Created for the Forest Fire Prediction Dashboard** 🔥  
**Version:** 1.0.0
