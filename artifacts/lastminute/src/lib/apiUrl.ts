/**
 * Returns the full URL for an API path, correctly prefixed with the app's
 * base URL for Replit's path-based routing.
 *
 * Example: getApiUrl("/user/saved-tours") → "/lastminute/api/user/saved-tours"
 */
export function getApiUrl(path: string): string {
  const base = (import.meta.env.BASE_URL as string).replace(/\/+$/, "");
  return `${base}/api${path}`;
}
