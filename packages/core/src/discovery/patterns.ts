/**
 * Default patterns for discovering Cypress test files
 * These patterns match common Cypress test file naming conventions
 */
export const DEFAULT_TEST_PATTERNS = [
  "cypress/e2e/**/*.cy.{ts,tsx,js,jsx}",
  "cypress/e2e/**/*.spec.{ts,tsx,js,jsx}",
  "cypress/e2e/**/*.test.{ts,tsx,js,jsx}",
] as const;

/**
 * Default exclusion patterns
 * These directories are typically excluded from test discovery
 */
export const DEFAULT_EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.cache/**",
  "**/.cycache/**",
  "**/.git/**",
  "**/coverage/**",
] as const;

/**
 * Normalize a pattern to ensure it works correctly with fast-glob
 * @param pattern - Pattern string
 * @returns Normalized pattern
 */
export function normalizePattern(pattern: string): string {
  // Remove leading slashes that might cause issues
  return pattern.replace(/^\/+/, "");
}

/**
 * Combine multiple patterns into a single array, normalizing each
 * @param patterns - Array of pattern strings
 * @returns Normalized pattern array
 */
export function normalizePatterns(patterns: string[]): string[] {
  return patterns.map(normalizePattern);
}

