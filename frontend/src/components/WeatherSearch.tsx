import { useState } from 'react';
import { Search, MapPin, Navigation, Hash, Thermometer } from 'lucide-react';
import Loader from './Loader';

export type LocationType = 'city' | 'coords' | 'zip';
export type Units = 'metric' | 'imperial';

export interface SearchParams {
  locationType: LocationType;
  city?: string;
  lat?: string;
  lon?: string;
  zip?: string;
  units: Units;
}

interface WeatherSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export default function WeatherSearch({ onSearch, isLoading }: WeatherSearchProps) {
  const [locationType, setLocationType] = useState<LocationType>('city');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [zip, setZip] = useState('');
  const [units, setUnits] = useState<Units>('metric');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: SearchParams = {
      locationType,
      units,
    };

    if (locationType === 'city' && city) {
      params.city = city;
    } else if (locationType === 'coords' && lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else if (locationType === 'zip' && zip) {
      params.zip = zip;
    } else {
      return; // Invalid input
    }

    onSearch(params);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(4));
        setLon(position.coords.longitude.toFixed(4));
        setLocationType('coords');
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location');
        setIsGettingLocation(false);
      }
    );
  };

  const locationTabs = [
    { type: 'city' as LocationType, label: 'City', icon: MapPin },
    { type: 'coords' as LocationType, label: 'Coordinates', icon: Navigation },
    { type: 'zip' as LocationType, label: 'ZIP Code', icon: Hash },
  ];

  return (
    <div className="card p-6">
      {/* Location type tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-storm-800/50 rounded-xl">
        {locationTabs.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setLocationType(type)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                       text-sm font-medium transition-all duration-200
                       ${locationType === type 
                         ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25' 
                         : 'text-storm-400 hover:text-white hover:bg-storm-700'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City input */}
        {locationType === 'city' && (
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-storm-300 mb-2">
              City name
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-storm-500" />
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input pl-12"
                placeholder="London, GB or New York, US"
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-storm-500">
              You can add country code for better accuracy (e.g., "Paris, FR")
            </p>
          </div>
        )}

        {/* Coordinates input */}
        {locationType === 'coords' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-storm-300 mb-2">
                  Latitude
                </label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="input"
                  placeholder="40.7128"
                  required
                />
              </div>
              <div>
                <label htmlFor="lon" className="block text-sm font-medium text-storm-300 mb-2">
                  Longitude
                </label>
                <input
                  id="lon"
                  type="number"
                  step="any"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="input"
                  placeholder="-74.0060"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {isGettingLocation ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Use my current location
                </>
              )}
            </button>
          </div>
        )}

        {/* ZIP code input */}
        {locationType === 'zip' && (
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-storm-300 mb-2">
              ZIP / Postal code
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-storm-500" />
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="input pl-12"
                placeholder="10001,US or SW1A 1AA,GB"
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-storm-500">
              Include country code for international ZIP codes
            </p>
          </div>
        )}

        {/* Units toggle */}
        <div className="flex items-center gap-4 pt-2">
          <span className="text-sm text-storm-400 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Units:
          </span>
          <div className="flex p-1 bg-storm-800/50 rounded-lg">
            <button
              type="button"
              onClick={() => setUnits('metric')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all
                        ${units === 'metric' 
                          ? 'bg-sky-500 text-white' 
                          : 'text-storm-400 hover:text-white'}`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setUnits('imperial')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all
                        ${units === 'imperial' 
                          ? 'bg-sky-500 text-white' 
                          : 'text-storm-400 hover:text-white'}`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              Get Weather
            </>
          )}
        </button>
      </form>
    </div>
  );
}

