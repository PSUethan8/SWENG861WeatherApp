import { useState } from 'react';
import { Cloud, AlertCircle, Sparkles } from 'lucide-react';
import WeatherSearch, { SearchParams, Units } from '../components/WeatherSearch';
import WeatherCard from '../components/WeatherCard';
import ForecastList from '../components/ForecastList';
import Loader from '../components/Loader';
import { weatherApi, WeatherData, ForecastData } from '../lib/apiClient';

interface WeatherState {
  current: {
    data: WeatherData;
    source: 'cache' | 'live';
    fetchedAt: string;
  } | null;
  forecast: {
    data: ForecastData;
    source: 'cache' | 'live';
    fetchedAt: string;
  } | null;
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherState>({ current: null, forecast: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchUnits, setLastSearchUnits] = useState<Units>('metric');

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError('');
    setLastSearchUnits(params.units);

    try {
      // Fetch both current weather and forecast in parallel
      const [currentResult, forecastResult] = await Promise.all([
        weatherApi.getWeather({ ...params, type: 'current' }),
        weatherApi.getWeather({ ...params, type: 'forecast' }),
      ]);

      setWeather({
        current: {
          data: currentResult.data as WeatherData,
          source: currentResult.source,
          fetchedAt: currentResult.fetchedAt,
        },
        forecast: {
          data: forecastResult.data as ForecastData,
          source: forecastResult.source,
          fetchedAt: forecastResult.fetchedAt,
        },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch weather data');
      setWeather({ current: null, forecast: null });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-gradient">Weather Forecast</span>
        </h1>
        <p className="text-storm-400">
          Get real-time weather updates for any location worldwide
        </p>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        {/* Search panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <WeatherSearch onSearch={handleSearch} isLoading={isLoading} />
          
          {/* Quick tips */}
          <div className="mt-4 p-4 bg-storm-900/30 rounded-xl border border-storm-800">
            <h4 className="text-sm font-medium text-storm-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Quick tips
            </h4>
            <ul className="text-xs text-storm-500 space-y-1.5">
              <li>• Add country codes for accuracy (e.g., "Paris, FR")</li>
              <li>• Use coordinates for precise locations</li>
              <li>• Weather data is cached for 5 minutes</li>
            </ul>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-6">
          {/* Error state */}
          {error && (
            <div className="card p-6 border-red-500/20 bg-red-500/5 animate-fade-in">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unable to fetch weather</p>
                  <p className="text-sm text-red-400/70">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="card p-12 flex flex-col items-center justify-center animate-fade-in">
              <Loader size="lg" className="mb-4" />
              <p className="text-storm-400">Fetching weather data...</p>
            </div>
          )}

          {/* Weather results */}
          {!isLoading && weather.current && (
            <WeatherCard 
              data={weather.current.data} 
              units={lastSearchUnits}
              source={weather.current.source}
              fetchedAt={weather.current.fetchedAt}
            />
          )}

          {!isLoading && weather.forecast && (
            <ForecastList 
              data={weather.forecast.data} 
              units={lastSearchUnits}
            />
          )}

          {/* Empty state */}
          {!isLoading && !error && !weather.current && (
            <div className="card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="p-4 bg-storm-800/50 rounded-2xl mb-4">
                <Cloud className="w-12 h-12 text-storm-500" />
              </div>
              <h3 className="text-lg font-medium text-storm-300 mb-2">
                No weather data yet
              </h3>
              <p className="text-storm-500 max-w-sm">
                Search for a city, enter coordinates, or use your current location 
                to see the weather forecast.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

