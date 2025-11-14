# Scrolling and Accessibility Guide

## 📜 Smooth Scrolling Implementation

This application includes a comprehensive smooth scrolling system with proper offset handling for fixed headers and enhanced accessibility features.

## 🎯 Features

### 1. **Smooth Scrolling with Header Offset**
- All scrollable containers have `scroll-behavior: smooth`
- Fixed header offset of 80px is applied automatically
- Works with hash links, programmatic scrolling, and anchor navigation

### 2. **Keyboard-Only Focus Indicators**
- Focus outlines only appear when using keyboard navigation (`:focus-visible`)
- Mouse users don't see focus outlines
- Clear 3px blue outline with shadow for better visibility
- High contrast mode support

### 3. **Accessibility Features**
- Skip to main content link (Tab on page load)
- Proper ARIA attributes on all interactive elements
- Semantic HTML structure
- Screen reader friendly
- Reduced motion support for users who prefer less animation

## 🛠️ Usage

### Import Scroll Utilities

```javascript
import { scrollToRef, scrollToId, scrollToTop } from '../utils/scrollUtils'
// or
import { useScrollToElement } from '../hooks/useScrollToElement'
```

### Using the Hook

```javascript
function MyComponent() {
  const sectionRef = useRef(null)
  const { scrollToRef, scrollToTop } = useScrollToElement(80) // 80px offset

  return (
    <>
      <button onClick={() => scrollToRef(sectionRef)}>
        Scroll to Section
      </button>
      <button onClick={scrollToTop}>
        Back to Top
      </button>
      
      <div ref={sectionRef} className="scroll-target">
        Content here
      </div>
    </>
  )
}
```

### Using Helper Functions

```javascript
import { scrollToRef, scrollToId, scrollToSelector, scrollToTop } from '../utils/scrollUtils'

// Scroll to a React ref
const myRef = useRef(null)
scrollToRef(myRef, 80) // 80px offset

// Scroll to element by ID
scrollToId('section-1', 80)

// Scroll to element by CSS selector
scrollToSelector('.my-section', 80)

// Scroll to top of page
scrollToTop()
```

### HTML Hash Links

```html
<!-- Automatically uses 80px offset from CSS -->
<a href="#section-1">Go to Section 1</a>

<div id="section-1" class="scroll-target">
  Content
</div>
```

## 🎨 CSS Classes

### Scroll Target

Add this class to elements you want to scroll to:

```html
<div class="scroll-target" id="my-section">
  Content
</div>
```

### Focusable Elements

Add this class for custom focus styling:

```html
<button class="focusable">Click Me</button>
```

### Screen Reader Only

Hide content visually but keep it accessible:

```html
<span class="sr-only">Hidden from visual users</span>
```

### Focus Within Highlight

Highlight containers when child elements are focused:

```html
<div class="focus-within-highlight">
  <input type="text" />
</div>
```

## ⌨️ Keyboard Navigation

The app automatically detects keyboard vs mouse usage:

- **Tab** - Navigate to next focusable element
- **Shift+Tab** - Navigate to previous element
- **Enter/Space** - Activate buttons and links
- **Ctrl+B** - Toggle sidebar
- **/** - Focus search input
- **Esc** - Close modals/dialogs

## 🎯 CSS Variables

You can customize scroll behavior using CSS variables:

```css
:root {
  --header-height: 64px;
  --scroll-offset: 80px;
  --scrollbar-width: 10px;
}
```

## 📱 Responsive Behavior

On mobile devices (< 768px):
- Scroll offset reduces to 64px
- Touch-friendly scrolling enabled
- Momentum scrolling on iOS

## ♿ Accessibility Features

### Skip to Main Content

Press **Tab** on page load to reveal the "Skip to main content" link:

```html
<a href="#main-content" class="skip-to-main">
  Skip to main content
</a>
```

### Focus Indicators

Focus outlines automatically show for:
- Buttons
- Links
- Form inputs
- Custom interactive elements

### Reduced Motion

Users who prefer reduced motion will see:
- No scroll animations (instant scroll)
- No CSS transitions
- No animations

This is automatically handled via `@media (prefers-reduced-motion: reduce)`.

### High Contrast Mode

Users with high contrast settings will see:
- Thicker focus outlines (4px)
- Larger outline offset
- Enhanced shadows

## 🧪 Testing

### Test Keyboard Navigation

1. Press **Tab** on page load
2. Verify "Skip to main content" appears
3. Tab through interactive elements
4. Confirm blue focus outlines appear

### Test Smooth Scrolling

1. Click navigation links
2. Verify smooth scroll animation
3. Confirm proper offset (no content under header)

### Test Accessibility

1. Use a screen reader (NVDA, JAWS, VoiceOver)
2. Verify all interactive elements are announced
3. Check ARIA labels are read correctly

### Test Reduced Motion

1. Enable reduced motion in OS settings
2. Verify no scroll animations occur
3. Confirm instant scrolling

## 📄 Related Files

- `src/hooks/useScrollToElement.js` - Custom React hook
- `src/utils/scrollUtils.js` - Utility functions
- `src/styles/smoothScroll.css` - Smooth scrolling styles
- `src/styles/accessibility.css` - Accessibility styles
- `src/components/ScrollExample.jsx` - Usage example

## 🎓 Examples

### Example 1: Scroll to Section on Button Click

```javascript
import { scrollToRef } from '../utils/scrollUtils'

function MyPage() {
  const aboutRef = useRef(null)

  return (
    <>
      <button onClick={() => scrollToRef(aboutRef)}>
        Learn More
      </button>
      
      <div ref={aboutRef} className="scroll-target">
        <h2>About Us</h2>
        <p>Content here...</p>
      </div>
    </>
  )
}
```

### Example 2: Table of Contents

```javascript
import { scrollToId } from '../utils/scrollUtils'

function TableOfContents() {
  return (
    <nav>
      <button onClick={() => scrollToId('intro')}>Introduction</button>
      <button onClick={() => scrollToId('features')}>Features</button>
      <button onClick={() => scrollToId('contact')}>Contact</button>
    </nav>
  )
}
```

### Example 3: Back to Top Button

```javascript
import { useState, useEffect } from 'react'
import { Fab } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { scrollToTop } from '../utils/scrollUtils'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.pageYOffset > 300)
    }
    window.addEventListener('scroll', toggleVisible)
    return () => window.removeEventListener('scroll', toggleVisible)
  }, [])

  return visible ? (
    <Fab 
      color="primary" 
      onClick={scrollToTop}
      sx={{ position: 'fixed', bottom: 20, right: 20 }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  ) : null
}
```

## 🔧 Customization

### Change Scroll Offset

```javascript
// Default: 80px
const { scrollToRef } = useScrollToElement(100) // 100px offset

// Or in helper function
scrollToRef(myRef, 100)
```

### Disable Smooth Scroll for Specific Element

```css
.instant-scroll {
  scroll-behavior: auto !important;
}
```

### Custom Focus Outline Color

```css
.my-button:focus-visible {
  outline-color: #ff0000; /* Red outline */
}
```

## 📊 Browser Support

- ✅ Chrome 61+
- ✅ Firefox 36+
- ✅ Safari 15.4+
- ✅ Edge 79+
- ⚠️ IE 11 (needs polyfill for `:focus-visible`)

## 🚀 Performance

- Smooth scrolling uses native CSS `scroll-behavior`
- No JavaScript animations (better performance)
- Minimal JavaScript only for offset calculations
- Efficient event listeners with cleanup

## 📝 Best Practices

1. **Always add `className="scroll-target"`** to elements you want to scroll to
2. **Use semantic HTML** for better accessibility
3. **Add ARIA labels** to interactive elements without visible text
4. **Test with keyboard only** to verify all functionality is accessible
5. **Use `:focus-visible`** instead of `:focus` for custom styles

---

**Built with accessibility in mind ♿**
