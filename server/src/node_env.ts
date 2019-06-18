import { env } from 'process';

export const NODE_ENV = env.NODE_ENV || 'development';
export const isDev = NODE_ENV === 'development';
export const isProd = NODE_ENV === 'production';
