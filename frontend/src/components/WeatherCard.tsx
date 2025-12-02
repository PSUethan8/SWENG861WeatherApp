import { 
  Droplets, 
  Wind, 
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  CloudFog,
  Cloudy
} from 'lucide-react';
import { WeatherData } from '../lib/apiClient';
import { Units } from './WeatherSearch';

interface WeatherCardProps {
  data: WeatherData;
  units: Units;
  source: 'cache' | 'live';
  fetchedAt: string;
}

function getWeatherIcon(iconCode: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '01d': Sun,
    '01n': Sun,
    '02d': Cloudy,
    '02n': Cloudy,
    '03d': Cloud,
    '03n': Cloud,
    '04d': Cloud,
    '04n': Cloud,
    '09d': CloudRain,
    '09n': CloudRain,
    '10d': CloudRain,
    '10n': CloudRain,
    '11d': CloudLightning,
    '11n': CloudLightning,
    '13d': CloudSnow,
    '13n': CloudSnow,
    '50d': CloudFog,
    '50n': CloudFog,
  };
  return iconMap[iconCode] || Cloud;
}

function getWeatherGradient(weatherMain: string): string {
  const gradients: Record<string, string> = {
    Clear: 'from-amber-400 via-orange-400 to-yellow-500',
    Clouds: 'from-slate-400 via-slate-500 to-slate-600',
    Rain: 'from-blue-400 via-blue-500 to-indigo-600',
    Drizzle: 'from-blue-300 via-blue-400 to-blue-500',
    Thunderstorm: 'from-purple-500 via-purple-600 to-indigo-700',
    Snow: 'from-cyan-200 via-blue-200 to-white',
    Mist: 'from-gray-300 via-gray-400 to-gray-500',
    Fog: 'from-gray-300 via-gray-400 to-gray-500',
    Haze: 'from-amber-200 via-amber-300 to-orange-300',
  };
  return gradients[weatherMain] || gradients.Clouds;
}

function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

export default function WeatherCard({ data, units, source, fetchedAt }: WeatherCardProps) {
  const weather = data.weather[0];
  const WeatherIcon = getWeatherIcon(weather.icon);
  const gradient = getWeatherGradient(weather.main);
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Header with gradient */}
      <div className={`relative p-8 bg-gradient-to-br ${gradient}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                 backgroundSize: '24px 24px'
               }} 
          />
        </div>
        
        <div className="relative flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {data.name}
              {data.sys.country && (
                <span className="text-white/70 text-xl ml-2">{data.sys.country}</span>
              )}
            </h2>
            <p className="text-white/80 capitalize">{weather.description}</p>
          </div>
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <WeatherIcon className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="relative mt-6 flex items-end justify-between">
          <div>
            <div className="text-7xl font-light text-white tracking-tight">
              {Math.round(data.main.temp)}
              <span className="text-3xl">{tempUnit}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-white/80">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-4 h-4" />
                {Math.round(data.main.temp_max)}{tempUnit}
              </span>
              <span className="flex items-center gap-1">
                <ArrowDown className="w-4 h-4" />
                {Math.round(data.main.temp_min)}{tempUnit}
              </span>
            </div>
          </div>
          <div className="text-right text-white/70 text-sm">
            <p>Feels like {Math.round(data.main.feels_like)}{tempUnit}</p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DetailItem
          icon={Droplets}
          label="Humidity"
          value={`${data.main.humidity}%`}
        />
        <DetailItem
          icon={Wind}
          label="Wind"
          value={`${data.wind.speed} ${speedUnit}`}
        />
        <DetailItem
          icon={Eye}
          label="Visibility"
          value={`${(data.visibility / 1000).toFixed(1)} km`}
        />
        <DetailItem
          icon={Gauge}
          label="Pressure"
          value={`${data.main.pressure} hPa`}
        />
      </div>

      {/* Sunrise/Sunset */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-around p-4 bg-storm-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Sunrise className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-storm-400">Sunrise</p>
              <p className="font-medium">{formatTime(data.sys.sunrise, data.timezone)}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-storm-700" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Sunset className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-storm-400">Sunset</p>
              <p className="font-medium">{formatTime(data.sys.sunset, data.timezone)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-storm-800/30 border-t border-storm-800 flex items-center justify-between text-xs text-storm-500">
        <span>
          Data: {source === 'cache' ? 'Cached' : 'Live'}
        </span>
        <span>
          Updated: {new Date(fetchedAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function DetailItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-storm-800/30 rounded-xl">
      <div className="p-2 bg-sky-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-sky-400" />
      </div>
      <div>
        <p className="text-xs text-storm-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

