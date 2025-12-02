import axios from 'axios';
import { WeatherCache } from '../models/WeatherCache.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { createError } from '../middleware/errorHandler.js';

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// In-flight request deduplication
const inFlightRequests = new Map<string, Promise<WeatherResponse>>();

export interface WeatherQuery {
  locationType: 'city' | 'coords' | 'zip';
  city?: string;
  lat?: string;
  lon?: string;
  zip?: string;
  units: 'metric' | 'imperial';
  type: 'current' | 'forecast';
}

export interface WeatherResponse {
  source: 'cache' | 'live';
  fetchedAt: string;
  data: Record<string, unknown>;
}

function normalizeLocationKey(query: WeatherQuery): string {
  const { locationType, city, lat, lon, zip, units, type } = query;
  
  let locationPart: string;
  switch (locationType) {
    case 'city':
      locationPart = `city:${city?.toLowerCase().trim()}`;
      break;
    case 'coords':
      // Round to 2 decimal places for reasonable precision
      locationPart = `coords:${parseFloat(lat || '0').toFixed(2)},${parseFloat(lon || '0').toFixed(2)}`;
      break;
    case 'zip':
      locationPart = `zip:${zip?.trim()}`;
      break;
    default:
      throw createError('Invalid location type', 400);
  }
  
  return `${type}:${locationPart}:${units}`;
}

function buildOwmParams(query: WeatherQuery): Record<string, string> {
  const params: Record<string, string> = {
    appid: env.openWeatherMapApiKey,
    units: query.units,
  };
  
  switch (query.locationType) {
    case 'city':
      if (!query.city) throw createError('City is required', 400);
      params.q = query.city;
      break;
    case 'coords':
      if (!query.lat || !query.lon) throw createError('Latitude and longitude are required', 400);
      params.lat = query.lat;
      params.lon = query.lon;
      break;
    case 'zip':
      if (!query.zip) throw createError('Zip code is required', 400);
      params.zip = query.zip;
      break;
  }
  
  return params;
}

async function fetchFromOwm(query: WeatherQuery): Promise<Record<string, unknown>> {
  const endpoint = query.type === 'current' ? '/weather' : '/forecast';
  const params = buildOwmParams(query);
  
  // Log the full URL for debugging (mask API key)
  const maskedKey = env.openWeatherMapApiKey 
    ? `${env.openWeatherMapApiKey.slice(0, 4)}...${env.openWeatherMapApiKey.slice(-4)}`
    : 'NOT SET';
  logger.info(`Fetching from OWM: ${OWM_BASE_URL}${endpoint} (API key: ${maskedKey})`);
  
  try {
    const response = await axios.get(`${OWM_BASE_URL}${endpoint}`, {
      params,
      timeout: 10000,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const message = responseData?.message || error.message;
      
      // Log the full error for debugging
      logger.error(`OWM API Error - Status: ${status}, Response:`, responseData);
      
      if (status === 401) {
        // Provide more helpful error message
        throw createError(
          'Invalid API key. If you just created your key, it may take up to 2 hours to activate. ' +
          `OpenWeatherMap says: "${message}"`,
          401
        );
      } else if (status === 404) {
        throw createError(`Location not found: ${message}`, 404);
      } else if (status === 429) {
        throw createError('API rate limit exceeded. Please try again later.', 429);
      }
      
      throw createError(`Weather API error: ${message}`, status || 500);
    }
    
    throw error;
  }
}

export async function getWeather(query: WeatherQuery): Promise<WeatherResponse> {
  if (!env.openWeatherMapApiKey) {
    throw createError('OpenWeatherMap API key not configured', 500);
  }
  
  const locationKey = normalizeLocationKey(query);
  const ttl = query.type === 'current' ? env.cacheTtlCurrent : env.cacheTtlForecast;
  
  // Check cache first
  const cached = await WeatherCache.findOne({
    locationKey,
    type: query.type,
  });
  
  if (cached && cached.expiresAt > new Date()) {
    logger.debug(`Cache hit for ${locationKey}`);
    return {
      source: 'cache',
      fetchedAt: cached.fetchedAt.toISOString(),
      data: cached.data,
    };
  }
  
  // Check for in-flight request (deduplication)
  const inFlight = inFlightRequests.get(locationKey);
  if (inFlight) {
    logger.debug(`Awaiting in-flight request for ${locationKey}`);
    return inFlight;
  }
  
  // Create new request
  const fetchPromise = (async (): Promise<WeatherResponse> => {
    try {
      logger.debug(`Cache miss for ${locationKey}, fetching from OWM`);
      
      const data = await fetchFromOwm(query);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl);
      
      // Upsert cache
      await WeatherCache.findOneAndUpdate(
        { locationKey, type: query.type },
        {
          locationKey,
          type: query.type,
          queryParams: query,
          data,
          fetchedAt: now,
          expiresAt,
        },
        { upsert: true, new: true }
      );
      
      return {
        source: 'live',
        fetchedAt: now.toISOString(),
        data,
      };
    } finally {
      // Clean up in-flight request
      inFlightRequests.delete(locationKey);
    }
  })();
  
  inFlightRequests.set(locationKey, fetchPromise);
  return fetchPromise;
}

