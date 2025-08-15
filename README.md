# EMS User Portal

A modern, responsive React TypeScript application for student registration and authentication built with Vite and Tailwind CSS.

## Features

- ✨ Modern, responsive design optimized for mobile and desktop
- 🎨 Dark/Light theme support with CSS variables
- 🔐 User registration with comprehensive form validation
- 🔑 Login functionality
- 📱 Mobile-first responsive design
- ⚡ Fast development with Vite
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling

## Database Schema

The application is designed to work with the following user schema:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    rollno VARCHAR(50) UNIQUE,
    password TEXT,
    department TEXT,
    email VARCHAR(100) UNIQUE,
    phoneno BIGINT UNIQUE,
    yearofstudy INTEGER
);
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   ├── Input.tsx       # Custom input component
│   └── ThemeToggle.tsx # Theme switcher component
├── context/            # React contexts
│   └── ThemeContext.tsx # Theme management
├── pages/              # Page components
│   ├── SignupPage.tsx  # User registration page
│   └── LoginPage.tsx   # User login page
├── types/              # TypeScript type definitions
│   └── user.ts         # User-related types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and CSS variables
```

## Theme Customization

The application uses CSS variables for easy theme customization. You can modify the theme colors in `src/index.css`:

### Dark Theme Variables
```css
:root {
  --color-primary: #000000;        /* Pure black */
  --color-secondary: #111111;      /* Very dark gray */
  --color-accent: #ffffff;         /* Pure white */
  --color-background: #0a0a0a;     /* Deep black background */
  --color-surface: #1a1a1a;       /* Dark surface */
  --color-text: #ffffff;          /* White text */
  --color-text-secondary: #a3a3a3; /* Gray text */
  --color-border: #333333;        /* Dark border */
  --color-input-bg: #1f1f1f;      /* Input background */
  --color-button-hover: #333333;   /* Button hover state */
}
```

### Light Theme Variables
```css
.light-theme {
  --color-primary: #ffffff;
  --color-secondary: #f8f9fa;
  --color-accent: #000000;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #000000;
  --color-text-secondary: #6c757d;
  --color-border: #dee2e6;
  --color-input-bg: #ffffff;
  --color-button-hover: #e9ecef;
}
```

## Form Fields

### Signup Form
- **Name** - Full name of the user
- **Roll Number** - Unique student identifier
- **Email** - User's email address
- **Phone Number** - Contact number
- **Department** - Academic department selection
- **Year of Study** - Current academic year (1-4)
- **Password** - User password
- **Confirm Password** - Password confirmation

### Login Form
- **Roll Number** - User identifier
- **Password** - User password

## Responsive Design

The application is built with a mobile-first approach:

- **Mobile (< 640px)**: Single column layout, optimized touch targets
- **Tablet (640px+)**: Two-column layout for form fields where appropriate
- **Desktop (1024px+)**: Full desktop experience with hover states

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing

## Development Notes

- The theme toggle is positioned fixed in the top-right corner
- Form validation provides real-time feedback
- All components are fully typed with TypeScript
- The application uses semantic HTML for accessibility
- CSS variables allow for easy theme customization

## Next Steps

To complete the application, you might want to add:

1. **Backend Integration** - Connect to a real API
2. **Password Reset** - Implement forgot password functionality
3. **Email Verification** - Add email verification flow
4. **Dashboard** - Create a user dashboard after login
5. **Profile Management** - Allow users to update their profiles
6. **Admin Panel** - Add administrative functionality

## License

This project is for educational purposes.
