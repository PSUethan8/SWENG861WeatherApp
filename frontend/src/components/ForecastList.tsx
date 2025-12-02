import { 
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  CloudFog,
  Cloudy,
  Droplets,
  Wind
} from 'lucide-react';
import { ForecastData } from '../lib/apiClient';
import { Units } from './WeatherSearch';

interface ForecastListProps {
  data: ForecastData;
  units: Units;
}

interface DayForecast {
  date: string;
  dayName: string;
  temps: number[];
  weather: { main: string; icon: string; description: string };
  humidity: number[];
  wind: number[];
  pop: number; // Probability of precipitation
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

function processForecastData(data: ForecastData): DayForecast[] {
  const days = new Map<string, DayForecast>();
  
  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    const dayDate = new Date(item.dt * 1000);
    
    if (!days.has(date)) {
      days.set(date, {
        date,
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        temps: [],
        weather: item.weather[0],
        humidity: [],
        wind: [],
        pop: 0,
      });
    }
    
    const day = days.get(date)!;
    day.temps.push(item.main.temp);
    day.humidity.push(item.main.humidity);
    day.wind.push(item.wind.speed);
    day.pop = Math.max(day.pop, item.pop);
    
    // Use midday weather as the representative weather
    const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
    if (hour >= 11 && hour <= 14) {
      day.weather = item.weather[0];
    }
  });
  
  return Array.from(days.values()).slice(0, 5);
}

export default function ForecastList({ data, units }: ForecastListProps) {
  const forecasts = processForecastData(data);
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="card p-6 animate-fade-in animate-delay-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-sky-500/20 rounded-lg">
          <Cloud className="w-4 h-4 text-sky-400" />
        </span>
        5-Day Forecast
      </h3>
      
      <div className="grid gap-3">
        {forecasts.map((day, index) => {
          const Icon = getWeatherIcon(day.weather.icon);
          const minTemp = Math.round(Math.min(...day.temps));
          const maxTemp = Math.round(Math.max(...day.temps));
          const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length);
          const avgWind = (day.wind.reduce((a, b) => a + b, 0) / day.wind.length).toFixed(1);
          const isToday = index === 0;
          
          return (
            <div 
              key={day.date}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                        ${isToday 
                          ? 'bg-sky-500/10 border border-sky-500/20' 
                          : 'bg-storm-800/30 hover:bg-storm-800/50'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Day */}
              <div className="w-16 flex-shrink-0">
                <p className={`font-medium ${isToday ? 'text-sky-400' : 'text-white'}`}>
                  {isToday ? 'Today' : day.dayName}
                </p>
                <p className="text-xs text-storm-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Icon + Description */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${isToday ? 'bg-sky-500/20' : 'bg-storm-700/50'}`}>
                  <Icon className={`w-6 h-6 ${isToday ? 'text-sky-400' : 'text-storm-300'}`} />
                </div>
                <p className="text-sm text-storm-400 capitalize truncate hidden sm:block">
                  {day.weather.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                {day.pop > 0.1 && (
                  <div className="flex items-center gap-1 text-blue-400">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-xs">{Math.round(day.pop * 100)}%</span>
                  </div>
                )}
                <div className="hidden md:flex items-center gap-1 text-storm-400">
                  <Wind className="w-3.5 h-3.5" />
                  <span className="text-xs">{avgWind}{speedUnit}</span>
                </div>
                <div className="flex items-center gap-1 text-storm-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="text-xs">{avgHumidity}%</span>
                </div>
              </div>

              {/* Temp range */}
              <div className="flex items-center gap-2 w-24 justify-end">
                <span className="font-medium">{maxTemp}{tempUnit}</span>
                <div className="w-12 h-1.5 bg-storm-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                    style={{ 
                      width: '100%',
                    }}
                  />
                </div>
                <span className="text-storm-400">{minTemp}{tempUnit}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* City info */}
      <div className="mt-4 pt-4 border-t border-storm-800 text-sm text-storm-500 flex items-center justify-between">
        <span>{data.city.name}, {data.city.country}</span>
        <span>
          {data.city.coord.lat.toFixed(2)}°, {data.city.coord.lon.toFixed(2)}°
        </span>
      </div>
    </div>
  );
}

