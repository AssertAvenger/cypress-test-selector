/**
 * Options for test discovery
 */
export interface DiscoverOptions {
  /** Root directory of the project */
  projectRoot: string;
  /** Custom test file patterns (defaults to standard Cypress patterns) */
  testPatterns?: string[];
  /** Additional exclusion patterns */
  exclude?: string[];
  /** Whether to extract metadata (tags, titles, tokens) - default: true */
  extractMetadata?: boolean;
}

/**
 * Discovered test file with metadata
 */
export interface DiscoveredTestFile {
  /** Absolute path to the test file */
  file: string;
  /** Extracted tags from the test file */
  tags: string[];
  /** Extracted test titles (describe/it blocks) */
  titles: string[];
  /** Tokens extracted from titles */
  tokens: string[];
}

