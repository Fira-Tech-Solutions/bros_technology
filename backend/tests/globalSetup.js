/**
 * Jest Global Setup
 *
 * Runs once before the entire test suite starts.  Its sole purpose is to
 * ensure process.env is populated with the values from .env.test so that
 * Prisma and application code read the correct test database URL.
 *
 * Jest globalSetup files run in a separate process, so we import dotenv
 * and load .env.test here.  The child test workers inherit this env.
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
  const result = config({
    path: path.resolve(__dirname, '..', '.env.test'),
  });

  if (result.error) {
    console.warn('[globalSetup] Could not load .env.test:', result.error.message);
  } else {
    console.log('[globalSetup] Loaded .env.test — NODE_ENV:', process.env.NODE_ENV);
  }
}
