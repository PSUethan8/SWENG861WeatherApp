import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeatherCard from '../../components/WeatherCard';
import { WeatherData } from '../../lib/apiClient';

const mockWeatherData: WeatherData = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  main: {
    temp: 20,
    feels_like: 19,
    temp_min: 18,
    temp_max: 22,
    pressure: 1013,
    humidity: 65,
  },
  visibility: 10000,
  wind: { speed: 5.5, deg: 180 },
  clouds: { all: 0 },
  dt: 1700000000,
  sys: {
    country: 'GB',
    sunrise: 1699948800,
    sunset: 1699984800,
  },
  timezone: 0,
  name: 'London',
};

describe('WeatherCard Component', () => {
  it('displays the city name', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('displays the country code', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('GB')).toBeInTheDocument();
  });

  it('displays the weather description', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });

  it('displays temperature in metric', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('displays temperature in imperial', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="imperial"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('°F')).toBeInTheDocument();
  });

  it('displays humidity', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
  });

  it('displays wind speed', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('5.5 m/s')).toBeInTheDocument();
    expect(screen.getByText('Wind')).toBeInTheDocument();
  });

  it('displays pressure', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
    expect(screen.getByText('Pressure')).toBeInTheDocument();
  });

  it('displays data source indicator', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="cache"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('Data: Cached')).toBeInTheDocument();
  });

  it('displays live data source', () => {
    render(
      <WeatherCard
        data={mockWeatherData}
        units="metric"
        source="live"
        fetchedAt="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('Data: Live')).toBeInTheDocument();
  });
});

