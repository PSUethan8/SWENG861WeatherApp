import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      // Don't redirect if already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface WeatherData {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: { all: number };
    wind: { speed: number };
    visibility: number;
    pop: number;
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface WeatherResponse {
  source: 'cache' | 'live';
  fetchedAt: string;
  data: WeatherData | ForecastData;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User }>('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, displayName?: string) => {
    const response = await apiClient.post<{ user: User }>('/auth/register', { email, password, displayName });
    return response.data;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  
  getGoogleAuthStatus: async () => {
    const response = await apiClient.get<{ available: boolean }>('/auth/google/status');
    return response.data;
  },
};

// User API
export const userApi = {
  getMe: async () => {
    const response = await apiClient.get<User>('/api/user/me');
    return response.data;
  },
};

// Weather API
export interface WeatherQueryParams {
  locationType?: 'city' | 'coords' | 'zip';
  city?: string;
  lat?: string;
  lon?: string;
  zip?: string;
  units?: 'metric' | 'imperial';
  type?: 'current' | 'forecast';
}

export const weatherApi = {
  getWeather: async (params: WeatherQueryParams) => {
    const response = await apiClient.get<WeatherResponse>('/api/weather', { params });
    return response.data;
  },
};

