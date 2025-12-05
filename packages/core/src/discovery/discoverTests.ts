import fg from "fast-glob";
import { resolve } from "node:path";
import type { DiscoverOptions, DiscoveredTestFile } from "./types.js";
import {
  DEFAULT_TEST_PATTERNS,
  DEFAULT_EXCLUDE_PATTERNS,
  normalizePatterns,
} from "./patterns.js";
import { extractTestMetadata } from "./metadata.js";

/**
 * Normalize a path to POSIX style (forward slashes)
 * @param path - Path to normalize
 * @returns POSIX-style path
 */
function toPosixPath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Discover Cypress test files in the project
 *
 * @param options - Discovery options
 * @returns Promise resolving to array of absolute test file paths, or DiscoveredTestFile[] if extractMetadata is true
 */
export async function discoverTests(
  options: DiscoverOptions
): Promise<string[] | DiscoveredTestFile[]> {
  const { projectRoot, testPatterns, exclude, extractMetadata = true } = options;

  // Resolve project root to absolute path
  const rootPath = resolve(projectRoot);

  // Determine patterns to use
  const patterns = testPatterns ?? DEFAULT_TEST_PATTERNS;
  const normalizedPatterns = normalizePatterns([...patterns]);

  // Determine exclusion patterns
  const excludePatterns = [
    ...DEFAULT_EXCLUDE_PATTERNS,
    ...(exclude ?? []),
  ];
  const normalizedExclude = normalizePatterns(excludePatterns);

  // Use fast-glob to find test files
  const files = await fg(normalizedPatterns, {
    cwd: rootPath,
    absolute: true,
    ignore: normalizedExclude,
    onlyFiles: true,
    caseSensitiveMatch: false,
    // Follow symlinks (common in monorepos)
    followSymbolicLinks: true,
  });

  // Normalize paths to POSIX style and deduplicate
  const normalizedFiles = files
    .map((file) => {
      // fast-glob already returns absolute paths when absolute: true
      // Just normalize to POSIX style
      return toPosixPath(file);
    })
    .filter((file, index, array) => {
      // Deduplicate: keep first occurrence
      return array.indexOf(file) === index;
    })
    .sort(); // Sort for consistent output

  // If metadata extraction is disabled, return simple string array
  if (!extractMetadata) {
    return normalizedFiles;
  }

  // Extract metadata for each test file
  const filesWithMetadata: DiscoveredTestFile[] = await Promise.all(
    normalizedFiles.map(async (file) => {
      const metadata = await extractTestMetadata(file);
      return {
        file,
        ...metadata,
      };
    })
  );

  return filesWithMetadata;
}

