/**
 * Tree search configuration
 *
 * These values can be overridden via environment variables for different
 * environments (development, staging, production).
 *
 * Environment variables:
 * - VITE_TREE_SEARCH_ENDPOINT: Custom search API endpoint
 * - VITE_TREE_SEARCH_APP_TOKEN: Application authentication token
 */

/**
 * Default search endpoint
 * Override with VITE_TREE_SEARCH_ENDPOINT environment variable
 */
export const TREE_SEARCH_ENDPOINT =
  (import.meta.env.VITE_TREE_SEARCH_ENDPOINT as string | undefined) ||
  'https://replace-with-real-api/tree-search'

/**
 * Default application token for search API authentication
 * Override with VITE_TREE_SEARCH_APP_TOKEN environment variable
 *
 * IMPORTANT: In production, this should always be set via environment variable
 * and never hard-coded. Consider using a secure secrets management solution.
 */
export const TREE_SEARCH_APP_TOKEN =
  (import.meta.env.VITE_TREE_SEARCH_APP_TOKEN as string | undefined) || '123lidor'

/**
 * Search debounce delay in milliseconds
 *
 * Controls how long to wait after user stops typing before
 * executing the search API call. Helps reduce unnecessary requests.
 */
export const TREE_SEARCH_DEBOUNCE_MS = 350
