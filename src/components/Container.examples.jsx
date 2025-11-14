const containerExamples = `
<Container>
  <YourContent />
</Container>

<Container maxWidth="sm">
  <Form />
</Container>

<Container fullWidth>
  <Header />
</Container>

<Container gap={3}>
  <Card />
  <Card />
  <Card />
</Container>

<Container maxWidth="sm">640px</Container>
<Container maxWidth="md">768px</Container>
<Container maxWidth="lg">1024px (default)</Container>
<Container maxWidth="xl">1280px</Container>
<Container maxWidth="xxl">1536px</Container>

<Container maxWidth="900px">
  <Content />
</Container>

<Container fullWidth sx={{ backgroundColor: '#1976d2', py: 8 }}>
  <Container maxWidth="md">
    <Hero />
  </Container>
</Container>

<Container maxWidth="sm" sx={{ py: 4 }}>
  <Paper sx={{ p: 4 }}>
    <LoginForm />
  </Paper>
</Container>

<Container maxWidth="xl" gap={3}>
  <DashboardGrid />
</Container>

<>
  <Container fullWidth disablePadding>
    <Navbar />
  </Container>
  
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <MainContent />
  </Container>
  
  <Container fullWidth disablePadding>
    <Footer />
  </Container>
</>

// ============================================
// ADVANCED OPTIONS
// ============================================

// No padding
<Container disablePadding>
  <FullBleedImage />
</Container>

// Semantic HTML
<Container component="section" maxWidth="md">
  <Article />
</Container>

// Custom styling
<Container 
  maxWidth="lg"
  gap={2}
  sx={{ 
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    p: 3
  }}
>
  <Content />
</Container>

// Additional classes
<Container className="my-custom-class" maxWidth="md">
  <Content />
</Container>

// ============================================
// RESPONSIVE PADDING
// ============================================

/*
< 640px:  16px (left/right)
≥ 640px:  24px
≥ 768px:  32px
≥ 1024px: 40px
≥ 1280px: 48px
*/

// ============================================
// PROPS REFERENCE
// ============================================

/**
 * @prop {ReactNode} children - Required content
 * @prop {boolean} fullWidth - Remove max-width (default: false)
 * @prop {number|string} gap - Gap between children (default: 0)
 * @prop {string} maxWidth - Size preset or CSS value (default: 'lg')
 * @prop {boolean} disablePadding - Remove horizontal padding (default: false)
 * @prop {ElementType} component - HTML element (default: 'div')
 * @prop {string} className - Additional classes
 * @prop {object} sx - Material-UI styling
 */

// ============================================
// TIPS
// ============================================

// ✅ DO: Use semantic HTML
<Container component="main" maxWidth="lg">
  <PageContent />
</Container>

// ✅ DO: Nest for complex layouts
<Container fullWidth sx={{ bg: 'grey.100' }}>
  <Container maxWidth="lg">
    <CenteredContent />
  </Container>
</Container>

// ❌ DON'T: Nest non-full-width containers
<Container maxWidth="lg">
  <Container maxWidth="md"> {/* Unnecessary */}
    <Content />
  </Container>
</Container>

// ❌ DON'T: Use both fullWidth and maxWidth
<Container fullWidth maxWidth="lg"> {/* fullWidth wins */}
  <Content />
</Container>
`;

export default containerExamples;
