# Weather Forecast App

A full-stack weather forecasting web application built with Node.js, Express, React, and MongoDB. Users can authenticate and view weather forecasts for any location worldwide using the OpenWeatherMap API.

![Weather App](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## Features

- **User Authentication**
  - Local email/password registration and login
  - Google OAuth integration (optional)
  - Session-based authentication with secure cookies

- **Weather Data**
  - Current weather conditions
  - 5-day forecast
  - Support for city name, coordinates, and ZIP code searches
  - Metric and Imperial unit options

- **Smart Caching**
  - Server-side caching to minimize API calls
  - 5-minute cache for current weather
  - 30-minute cache for forecasts
  - Request deduplication

- **Modern UI**
  - Responsive design with Tailwind CSS
  - Beautiful gradient-based weather cards
  - Smooth animations and transitions
  - Dark theme optimized

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose ODM)
- **Passport.js** - Authentication (local + Google OAuth)
- **express-session** - Session management
- **Zod** - Request validation
- **Axios** - HTTP client for OpenWeatherMap API

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - API client

## Project Structure

```
weather-forecast-app/
├── backend/
│   ├── src/
│   │   ├── config/        # Environment, database, passport config
│   │   ├── middleware/    # Auth and error handling middleware
│   │   ├── models/        # Mongoose models (User, WeatherCache)
│   │   ├── routes/        # API routes (auth, user, weather)
│   │   ├── services/      # Business logic (auth, weather)
│   │   ├── utils/         # Utilities (logger)
│   │   └── index.ts       # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/           # API client, auth context
│   │   ├── routes/        # Page components
│   │   └── styles/        # CSS files
│   ├── package.json
│   └── vite.config.ts
├── package.json           # Root package with dev scripts
└── README.md
```

## Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** (local installation or MongoDB Atlas)
- **OpenWeatherMap API Key** ([Get one free](https://openweathermap.org/api))

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd weather-forecast-app

# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/weather-app

# Session (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key

# OpenWeatherMap API (required)
OPENWEATHERMAP_API_KEY=your-api-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Frontend URL
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` to point to your MongoDB instance.

```bash
# If using local MongoDB
mongod
```

### 4. Start Development Servers

```bash
# Start both backend and frontend concurrently
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend (port 4000)
npm run dev:backend

# Terminal 2 - Frontend (port 5173)
npm run dev:frontend
```

### 5. Open the App

Navigate to [http://localhost:5173](http://localhost:5173)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout current session |
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/me` | Get current user info |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather` | Get weather data |

**Weather Query Parameters:**
- `locationType`: `city` | `coords` | `zip`
- `city`: City name (e.g., "London,GB")
- `lat`, `lon`: Coordinates
- `zip`: ZIP code (e.g., "10001,US")
- `units`: `metric` | `imperial`
- `type`: `current` | `forecast`

## Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

In production, the backend serves the frontend static files from `frontend/dist`.

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 4000 | Backend server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `SESSION_SECRET` | Yes | - | Session encryption secret |
| `OPENWEATHERMAP_API_KEY` | Yes | - | OWM API key |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | No | - | Google OAuth callback URL |
| `FRONTEND_ORIGIN` | No | http://localhost:5173 | Frontend URL for CORS |

## Security Features

- Password hashing with bcrypt (12 rounds)
- HTTP-only session cookies
- CORS restricted to frontend origin
- Helmet.js security headers
- Rate limiting on API routes
- Server-side API key protection
- Input validation with Zod

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

