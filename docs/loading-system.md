# MindTrack Loading System Documentation

## Overview

The MindTrack application features a comprehensive loading system designed to provide excellent user experience during data fetching, processing, and navigation. The system includes artistic splash screens, lazy loading components, and sophisticated loading state management.

## Components

### 1. Splash Screen (`SplashScreen`)

An artistic, animated splash screen that appears during app initialization.

**Features:**
- Animated logo with rotating brain icon
- Floating background elements and particles
- Progress bar with realistic loading simulation
- Smooth exit animation
- Configurable duration and progress display

**Usage:**
```tsx
<SplashScreen
  onComplete={() => console.log('Splash complete')}
  minDuration={3000}
  showProgress={true}
/>
```

### 2. Artistic Loaders

Healthcare-themed animated loaders for different contexts:

#### BrainLoader
- Neural network animation with pulsing connections
- Perfect for mental health related operations

#### DNALoader
- Double helix animation with base pairs
- Ideal for research and analysis contexts

#### HeartbeatLoader
- ECG-style heartbeat monitor
- Great for health monitoring features

#### MolecularLoader
- Animated molecular structure with orbital rings
- Suitable for scientific analysis

#### FormLoader
- Questionnaire completion animation
- Perfect for form submissions

#### AnalyticsLoader
- Data visualization with animated charts
- Ideal for report generation

**Usage:**
```tsx
<ArtisticLoader type="brain" size={60} />
<BrainLoader size={80} />
```

### 3. Loading State Management

#### useLoadingState Hook
Manages async operations with loading states:

```tsx
const { state, isLoading, execute, reset } = useLoadingState();

const handleSubmit = async () => {
  await execute(async () => {
    // Your async operation
    await api.submitForm(data);
  }, {
    minDuration: 1000,
    timeout: 30000,
    retryAttempts: 3
  });
};
```

#### Global Loading Manager
Centralized loading state management:

```tsx
const { setLoading, getState, isAnyLoading } = useGlobalLoading('myOperation');

setLoading('myOperation', true, 50); // key, loading, progress
```

### 4. Lazy Loading Components

#### LazyImage
Images with loading states and error handling:

```tsx
<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/path/to/placeholder.jpg"
  showSpinner={true}
/>
```

#### LazySection
Content that loads when scrolled into view:

```tsx
<LazySection fallback={<ComponentSkeleton />}>
  <ExpensiveComponent />
</LazySection>
```

#### LazyWrapper
Generic wrapper for delayed component loading:

```tsx
<LazyWrapper delay={500} fallback={<Spinner />}>
  <MyComponent />
</LazyWrapper>
```

### 5. Skeleton Loaders

Placeholder components that mimic content structure:

- `ComponentSkeleton` - Generic content placeholder
- `CardSkeleton` - Card component placeholder
- `TableSkeleton` - Data table placeholder

### 6. Loading Provider

App-wide loading state management:

```tsx
<LoadingProvider
  enableSplash={true}
  splashMinDuration={2500}
  skipSplashInDev={false}
  preloadResources={['/images/logo.png']}
>
  <App />
</LoadingProvider>
```

## Loading Sequences

Pre-defined loading sequences for common operations:

### Questionnaire Loading
```tsx
const sequence = QUESTIONNAIRE_LOADING_SEQUENCE;
// Phases: idle → initializing → loading → processing → finalizing → complete
```

### AI Analysis
```tsx
const sequence = AI_ANALYSIS_SEQUENCE;
// Phases: idle → initializing → loading → processing → finalizing → complete
```

## Utilities

### Progress Simulation
```tsx
await simulateProgress(
  (progress) => setProgress(progress),
  2000, // duration
  20    // steps
);
```

### Resource Preloading
```tsx
const { loaded, failed } = await preloadResources(
  ['/image1.jpg', '/image2.jpg'],
  (loaded, total) => console.log(`${loaded}/${total}`)
);
```

### Performance Metrics
```tsx
loadingMetrics.start('pageLoad');
// ... loading operations
const duration = loadingMetrics.end('pageLoad');
loadingMetrics.report(); // Console output of all metrics
```

## Best Practices

### 1. Loading States
- Always provide loading feedback for operations > 200ms
- Use appropriate loader types for context
- Implement error states and retry mechanisms

### 2. Performance
- Use lazy loading for non-critical content
- Preload important resources during splash screen
- Implement skeleton loaders for better perceived performance

### 3. Accessibility
- Ensure loading states are announced to screen readers
- Provide alternative text for loading animations
- Respect user's reduced motion preferences

### 4. User Experience
- Use realistic progress indicators when possible
- Provide contextual loading messages
- Implement smooth transitions between states

## Configuration

### Loading Messages
Customize loading messages in `loading-utils.ts`:

```tsx
export const LOADING_MESSAGES = {
  INITIALIZING: 'Initializing platform...',
  AI_ANALYZING: 'AI is analyzing responses...',
  // ... more messages
};
```

### Loading Durations
Standard timing constants:

```tsx
export const LOADING_DURATIONS = {
  MICRO: 150,      // Button clicks
  FAST: 300,       // Quick transitions
  STANDARD: 500,   // Normal loading
  SLOW: 1000,      // Complex operations
  SPLASH: 2500,    // Splash screen
};
```

## Examples

### Basic Loading State
```tsx
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = async () => {
    setIsLoading(true);
    try {
      await performAction();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {isLoading ? (
        <ArtisticLoader type="brain" />
      ) : (
        <button onClick={handleAction}>Perform Action</button>
      )}
    </div>
  );
}
```

### Advanced Loading with Progress
```tsx
function AdvancedComponent() {
  const { state, isLoading, execute, progress } = useLoadingState();
  
  const handleComplexOperation = async () => {
    await execute(async () => {
      // Simulate multi-step operation
      await step1(); // Updates progress internally
      await step2();
      await step3();
    }, {
      minDuration: 2000,
      retryAttempts: 2
    });
  };
  
  return (
    <div>
      {isLoading && (
        <div>
          <BrainLoader size={60} />
          <AnimatedProgress progress={progress} />
          <p>{LOADING_MESSAGES.AI_ANALYZING}</p>
        </div>
      )}
    </div>
  );
}
```

## Testing

Visit `/loading-demo` to see all loading components in action and test their functionality interactively.

## Browser Support

- Modern browsers with ES2018+ support
- Graceful degradation for older browsers
- Respects `prefers-reduced-motion` setting
- Works with screen readers and assistive technology
