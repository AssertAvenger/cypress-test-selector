import { discoverTests } from "./discoverTests.js";
import {
  DEFAULT_TEST_PATTERNS,
  DEFAULT_EXCLUDE_PATTERNS,
  normalizePattern,
  normalizePatterns,
} from "./patterns.js";
import type { DiscoverOptions } from "./types.js";

// Export main API
export { discoverTests };

// Export metadata utilities
export { extractTestMetadata, tokenizeText } from "./metadata.js";

// Export types
export type { DiscoverOptions };
export type { DiscoveredTestFile } from "./types.js";

// Export pattern utilities for advanced use cases
export {
  DEFAULT_TEST_PATTERNS,
  DEFAULT_EXCLUDE_PATTERNS,
  normalizePattern,
  normalizePatterns,
};

