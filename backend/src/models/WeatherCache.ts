import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherCache extends Document {
  _id: mongoose.Types.ObjectId;
  locationKey: string;
  type: 'current' | 'forecast';
  queryParams: Record<string, unknown>;
  data: Record<string, unknown>;
  fetchedAt: Date;
  expiresAt: Date;
}

const weatherCacheSchema = new Schema<IWeatherCache>(
  {
    locationKey: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['current', 'forecast'],
      required: true,
    },
    queryParams: {
      type: Schema.Types.Mixed,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient lookups
weatherCacheSchema.index({ locationKey: 1, type: 1 }, { unique: true });

// TTL index for automatic document expiration
weatherCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WeatherCache = mongoose.model<IWeatherCache>('WeatherCache', weatherCacheSchema);

