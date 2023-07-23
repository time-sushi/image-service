import { config } from 'dotenv';

config();

export const appConfigs = {
  BUCKET_NAME: process.env.BUCKET_NAME,
  PRESIGNED_URL_TTL: Number(process.env.PRESIGNED_URL_TTL),
  SECRET_KEY: process.env.SECRET_KEY || ''
};
