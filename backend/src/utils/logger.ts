import { env } from '../config/env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMessage = (level: LogLevel, message: string, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ') : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
};

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(formatMessage('info', message, ...args));
  },
  
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(formatMessage('warn', message, ...args));
  },
  
  error: (message: string, ...args: unknown[]): void => {
    console.error(formatMessage('error', message, ...args));
  },
  
  debug: (message: string, ...args: unknown[]): void => {
    if (!env.isProduction) {
      console.debug(formatMessage('debug', message, ...args));
    }
  },
};

