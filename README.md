# EMS User Portal

A modern React TypeScript application for student authentication and management with comprehensive auth flow, built with Vite and Tailwind CSS.

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Configure VITE_BACKEND_URL in .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Modern React with full type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v3** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **CSS Variables** - Dynamic theming system

## 🏗️ Project Structure

```
src/
├── api.ts                    # API client with interceptors
├── components/
│   ├── AuthGuard.tsx        # Prevents auth'd users from auth pages
│   ├── Button.tsx           # Reusable button component
│   ├── EmailVerificationModal.tsx  # Email verification UI
│   ├── Input.tsx            # Form input component
│   ├── ProtectedRoute.tsx   # Route protection for auth'd users
│   ├── ThemeToggle.tsx      # Dark/light theme switcher
│   └── ToastProvider.tsx    # Toast notification provider
├── context/
│   ├── AuthContext.tsx      # Authentication state management
│   └── ThemeContext.tsx     # Theme state management
├── pages/
│   ├── DashboardPage.tsx    # Protected dashboard
│   ├── ForgotPasswordPage.tsx  # 3-step password reset flow
│   ├── HomePage.tsx         # Smart routing based on auth status
│   ├── LoginPage.tsx        # Authentication page
│   └── SignupPage.tsx       # Registration with email verification
├── types/
│   └── user.ts              # TypeScript interfaces
├── utils/
│   └── toast.ts             # Themed toast utilities
├── App.tsx                  # Main app with routing
└── main.tsx                 # Entry point
```

## 🔐 Authentication Flow

### Route Protection
- **`AuthGuard`** - Redirects authenticated users away from auth pages
- **`ProtectedRoute`** - Requires authentication for access
- **`HomePage`** - Smart routing: `/dashboard` if auth'd, `/signup` if not

### Features Implemented
- ✅ User registration with email verification
- ✅ Login with secure credential validation
- ✅ 3-step forgot password flow (email → code → reset)
- ✅ Token-based authentication with auto-refresh
- ✅ Cookie-based session management
- ✅ Logout functionality
- ✅ Protected routes and auth guards

## 🎨 Theming System

Dynamic theme switching using CSS variables:

```css
/* Dark Theme (default) */
:root {
  --primary: #000000;
  --surface: #1a1a1a;
  --accent: #ffffff;
  --text: #ffffff;
  --background: #0a0a0a;
  /* ... more variables */
}
```

Theme toggle persists preference and applies immediately across the app.

## 📡 API Integration

### Endpoints
- `POST /auth/user/signup` - User registration
- `POST /auth/user/login` - User authentication  
- `POST /auth/user/logout` - User logout
- `GET /auth/user/status` - Check auth status
- `GET /auth/user/getnewaccesstoken` - Refresh access token
- `POST /auth/user/generateemailcode` - Send email verification
- `POST /auth/user/generatecode` - Send password reset code
- `POST /auth/user/verifycode` - Verify reset code
- `POST /auth/user/resetpassword` - Reset password

### Features
- Automatic token refresh with axios interceptors
- Cookie-based authentication
- Error handling with user-friendly toasts
- Request retry logic for failed auth

## 🚀 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Development Notes

### Key Implementation Details
- **No infinite loops**: Auth status check excluded from token refresh
- **Proper loading states**: Each form has independent loading state
- **Security**: Generic error messages to prevent user enumeration
- **UX**: Toast notifications match app theme
- **Responsive**: Mobile-first design with consistent spacing

### Environment Variables
```bash
VITE_BACKEND_URL=http://localhost:3000  # Backend API URL
```

### TypeScript Interfaces
All API requests/responses are fully typed with comprehensive interfaces for type safety.

## 🎯 Production Ready Features

- ✅ Full authentication flow
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Route protection
- ✅ Theme persistence
- ✅ Toast notifications
- ✅ Form validation
- ✅ TypeScript coverage

---

**For Developers**: This codebase follows React best practices with proper state management, route protection, and type safety. All authentication flows are production-ready with comprehensive error handling.
