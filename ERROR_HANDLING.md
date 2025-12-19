# Error Handling Documentation

## Overview

The application now has a comprehensive error handling system that:

1. **Automatically logs out users when tokens become invalid** - No reload button needed
2. **Shows error popups for non-auth errors** - With a "Retour à l'accueil" (Go back to home) button

## How It Works

### Automatic Logout on Invalid Token

When the API client receives a 401 Unauthorized response:

1. It first attempts to refresh the access token using the refresh token
2. If refresh fails (token is invalid/expired):
   - Automatically clears all tokens from localStorage
   - Triggers the `onUnauthorizedCallback` in AuthContext
   - Clears all user data and resets authentication state
   - User is immediately redirected to the login page

**No user interaction required!** The logout happens automatically and seamlessly.

### Error Popup for Non-Auth Errors

For all other errors (network errors, validation errors, server errors, etc.):

1. A modal popup appears with:
   - Warning icon (⚠️)
   - Error title: "Oops!"
   - Error message describing what went wrong
   - "Retour à l'accueil" button to go back to home/login page

2. Authentication errors (401) do NOT show this popup - they trigger automatic logout instead

## Usage in Your Code

### Option 1: Let the system handle it automatically

Most API errors are already handled automatically. No code changes needed!

### Option 2: Manually trigger error popup (for custom error handling)

```typescript
import { useErrorHandler, handleApiError } from '../context/ErrorHandlerContext';

function MyComponent() {
  const { showError } = useErrorHandler();

  const handleSomething = async () => {
    try {
      await api.someOperation();
    } catch (error) {
      // Use the helper function to handle API errors
      handleApiError(error, showError);
    }
  };

  // Or manually show a custom error
  const showCustomError = () => {
    showError('Custom error message');
  };

  return (
    // Your component JSX
  );
}
```

## Architecture

### Files Modified/Created

1. **`src/services/api.ts`**
   - Added `onUnauthorizedCallback` mechanism
   - Modified `refreshAccessToken()` to trigger logout callback on failure

2. **`src/context/AuthContext.tsx`**
   - Added `useEffect` hook to setup automatic logout callback
   - Automatically clears all user data and localStorage when tokens become invalid

3. **`src/context/ErrorHandlerContext.tsx`** (NEW)
   - Provides `ErrorHandlerProvider` component
   - Exports `useErrorHandler` hook
   - Exports `handleApiError` helper function
   - Displays error modal with "go back to home" button

4. **`src/App.tsx`**
   - Wrapped AppContent with `ErrorHandlerProvider`
   - Added `handleGoHome` function to reset navigation state

5. **`src/components/ErrorBoundary.tsx`**
   - Updated button text from "Rafraîchir la page" to "Retour à l'accueil"
   - Changed button action to navigate to home instead of reload

## Error Flow Diagram

```
API Request
    ↓
401 Unauthorized?
    ↓ YES
Attempt Token Refresh
    ↓
Refresh Failed?
    ↓ YES
Trigger onUnauthorizedCallback
    ↓
AuthContext: Clear all data
    ↓
User redirected to login
    ↓ NO (Other Error)
Show Error Popup
    ↓
User clicks "Retour à l'accueil"
    ↓
Navigate to home/login page
```

## Benefits

✅ **Seamless User Experience** - No confusing reload buttons or error states
✅ **Automatic Session Management** - Invalid tokens handled automatically
✅ **Consistent Error Handling** - All errors handled the same way across the app
✅ **User-Friendly** - Clear error messages with simple action button
✅ **Secure** - Immediately logs out users when tokens expire

## Testing

To test the automatic logout:
1. Log in to the app
2. Manually delete or corrupt the tokens in localStorage
3. Make any API request
4. User should be automatically logged out and redirected to login

To test error popup:
1. Trigger a non-auth error (e.g., network error, validation error)
2. Error popup should appear with "Retour à l'accueil" button
3. Click button to return to home/login page
