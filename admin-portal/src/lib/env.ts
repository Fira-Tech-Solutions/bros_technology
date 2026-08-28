export const env = {
  API_URL: (import.meta.env.VITE_API_URL || 'https://api.broslaptop.com').replace(/\/$/, ''),
  DOCS_URL: (import.meta.env.VITE_DOCS_URL || 'https://doc.broslaptop.com').replace(/\/$/, ''),
} as const;

export const API_URL = env.API_URL;
export const DOCS_URL = env.DOCS_URL;
