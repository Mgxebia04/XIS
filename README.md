# XIS - Xebia Interview Scheduler

An Internal Application to manage interview Scheduling process

## Frontend Setup

This is a React frontend application built with Vite, TypeScript, React Router v6, Axios, and Context API.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL:
```
VITE_API_BASE_URL=http://localhost:3001
# Or use your ngrok URL: https://xxxx-xx-xx-xx-xx.ngrok.io
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Project Structure

```
src/
├── components/       # Reusable React components
│   └── ProtectedRoute.tsx
├── contexts/        # React Context providers
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── Unauthorized.tsx
├── services/        # API service layer
│   └── api.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

### Features

- **Authentication**: Login page with Auth Context for state management
- **Protected Routes**: Role-based route protection (ready for HR/Panel roles)
- **API Service**: Axios-based service with interceptors for auth tokens
- **TypeScript**: Full type safety throughout the application
- **Modular Structure**: Clean, extensible architecture

### Next Steps

- Implement role-based routing (HR / Panel dashboards)
- Add business logic for interview scheduling
- Connect to backend API endpoints
