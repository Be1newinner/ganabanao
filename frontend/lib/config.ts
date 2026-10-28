/** Public settings only — every secret lives on the API server (NFR-10). */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "GanaBanao";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8005").replace(/\/$/, "");
export const API_BASE = `${API_URL}/api/v1`;
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com";
