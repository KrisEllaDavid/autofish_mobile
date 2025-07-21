# Global Loading Implementation

This document describes the global loading overlay implementation for the AutoFish mobile app.

## Overview

The app now includes a global loading overlay that appears during API requests, providing a consistent user experience with the AutoFish logo and blue loading dots animation.

## Components

### 1. LoadingOverlay Component
- **Location**: `src/components/LoadingOverlay.tsx`
- **Features**:
  - AutoFish white logo
  - Three blue animated dots (same as splash screen)
  - Semi-transparent backdrop with blur effect
  - High z-index (9999) to appear above all content

### 2. LoadingContext
- **Location**: `src/context/LoadingContext.tsx`
- **Features**:
  - Global loading state management
  - Support for multiple concurrent requests
  - `withLoading` wrapper for promises
  - Automatic show/hide loading overlay

### 3. API Integration
- **Location**: `src/services/apiWithLoading.ts`
- **Features**:
  - Wrapper around the main API client
  - Automatically shows loading overlay for all API calls
  - Uses the `withLoading` function from LoadingContext

## Usage

### For API Calls
Instead of using the direct API client, use the `useApiWithLoading` hook:

```typescript
import { useApiWithLoading } from '../services/apiWithLoading';

const MyComponent = () => {
  const api = useApiWithLoading();
  
  const handleLogin = async () => {
    try {
      // Loading overlay will automatically show during this call
      const result = await api.login({ email, password });
      // Loading overlay will automatically hide when call completes
    } catch (error) {
      // Loading overlay will hide even if there's an error
    }
  };
};
```

### Manual Loading Control
You can also manually control the loading state:

```typescript
import { useLoading } from '../context/LoadingContext';

const MyComponent = () => {
  const { showLoading, hideLoading, withLoading } = useLoading();
  
  const handleCustomOperation = async () => {
    showLoading();
    try {
      await someAsyncOperation();
    } finally {
      hideLoading();
    }
  };
  
  // Or use the wrapper
  const handleWithWrapper = async () => {
    await withLoading(someAsyncOperation());
  };
};
```

## Integration Points

### App.tsx
The LoadingProvider wraps the entire app, and LoadingOverlay is included in all main views:
- Splash screen
- Authenticated user view (HomePage)
- Unauthenticated user views (onboarding, login, etc.)

### HomePage
Updated to use `useApiWithLoading` instead of direct API calls:
- `getPublicFeed()` - shows loading when fetching publications
- `toggleLikePublication()` - shows loading when liking/unliking posts

### AuthContext
Updated to use the new API client for authentication operations.

## Visual Design

The loading overlay matches the splash screen design:
- **Background**: Semi-transparent black with blur effect
- **Logo**: AutoFish white logo (80x80px)
- **Animation**: Three blue dots (#009CB7) with staggered blink animation
- **Positioning**: Centered on screen with fade-in animation

## Benefits

1. **Consistent UX**: All API requests show the same loading indicator
2. **User Feedback**: Users know when the app is processing requests
3. **Professional Look**: Matches the app's design language
4. **Automatic Management**: No need to manually show/hide loading states
5. **Error Handling**: Loading overlay hides even if requests fail

## Technical Details

- **Z-Index**: 9999 to ensure it appears above all content
- **Backdrop Filter**: Blur effect for modern browsers
- **Animation**: CSS keyframes for smooth transitions
- **State Management**: React Context for global state
- **Concurrent Requests**: Counter-based system to handle multiple simultaneous requests 