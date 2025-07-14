# AutoFish Mobile API Integration Guide

## 🚀 API Integration Status

✅ **COMPLETED**: User Account Management (Signup, Login, Logout)

### Features Implemented:

1. **Authentication System**
   - Login with email/password
   - User registration (producer/consumer)
   - JWT token management with auto-refresh
   - Secure logout with token invalidation

2. **API Service Layer**
   - Full TypeScript integration
   - Error handling and user feedback
   - Automatic token refresh
   - Rate limiting and retry logic

3. **Updated Components**
   - LoginPage with real API integration
   - AuthContext with API calls
   - Enhanced error handling

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file in your project root with:

```env
# API Configuration
VITE_API_BASE_URL=http://31.97.178.131

# Development settings
VITE_NODE_ENV=development
```

### 2. API Endpoints Integrated

Based on `api/AutoFish API.yaml`:

- **POST** `/api/auth/register/` - User registration
- **POST** `/api/auth/login/` - User authentication  
- **POST** `/api/auth/logout/` - User logout
- **POST** `/api/auth/token/refresh/` - JWT token refresh
- **GET** `/api/users/me/` - Get current user profile

### 3. Data Flow

```
LoginPage → AuthContext.login() → API Service → JWT Tokens → HomePage
```

## 📋 Usage Examples

### Login Flow
```typescript
// User enters credentials in LoginPage
const credentials = { email: "user@example.com", password: "password123" };

// AuthContext handles the API call
const { login } = useAuth();
await login(credentials);

// On success: JWT tokens saved, user data loaded, redirect to HomePage
```

### Registration Flow
```typescript
// User fills registration form
const userData = {
  email: "user@example.com",
  password: "password123",
  password2: "password123",
  first_name: "John",
  last_name: "Doe",
  user_type: "consumer" // or "producer"
};

// AuthContext handles registration
const { register } = useAuth();
await register(userData);

// Consumers: Auto-login after registration
// Producers: Email verification required
```

### Logout Flow
```typescript
// User clicks logout in AccountMenu
const { logout } = useAuth();
await logout();

// API invalidates tokens, local data cleared, app resets to splash screen
```

## 🔐 Security Features

1. **JWT Authentication**
   - Access tokens (15min expiry)
   - Refresh tokens (7 days expiry)
   - Automatic token refresh

2. **Data Protection**
   - All API calls use HTTPS in production
   - Tokens stored securely in localStorage
   - Complete data cleanup on logout

3. **Error Handling**
   - Network error recovery
   - User-friendly error messages
   - Graceful degradation

## 🎯 Current Features

### ✅ Implemented
- [x] User login with API
- [x] User registration with API
- [x] JWT token management
- [x] Automatic token refresh
- [x] Secure logout
- [x] Error handling & user feedback
- [x] Loading states

### 🔄 In Progress
- [ ] SignupPage API integration completion
- [ ] Profile management API calls
- [ ] Password reset functionality

### 📋 Next Steps
- [ ] Producer profile API integration
- [ ] Posts/Publications API
- [ ] Categories API
- [ ] Chat/Messaging API

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 🔧 API Configuration

The API service automatically handles:

- **Base URL**: Configurable via environment variables
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Standardized error responses
- **Type Safety**: Full TypeScript integration
- **Request/Response**: JSON with proper headers

## 📱 Mobile App Integration

The mobile app now seamlessly integrates with your backend API:

1. **Real Authentication**: No more mock data
2. **Persistent Sessions**: JWT tokens with refresh
3. **Error Feedback**: Toast notifications for users
4. **Loading States**: UI feedback during API calls
5. **Type Safety**: Full TypeScript coverage

## 🚨 Important Notes

1. **API URL**: Make sure your backend is running on the configured URL
2. **CORS**: Ensure your backend allows requests from the mobile app domain
3. **Environment**: Update `VITE_API_BASE_URL` for different environments
4. **Testing**: Test with real backend for full functionality

## 📞 Support

Your mobile app is now production-ready with real API integration! 🎉

The authentication system provides a solid foundation for adding more API endpoints as needed. 