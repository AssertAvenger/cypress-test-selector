import { parseRawDiff } from "./parseRawDiff.js";
import { normalizeDiff } from "./normalizeDiff.js";
import type { ChangedFile, RawDiffEntry, ParseOptions, ParseResult } from "./types.js";

/**
 * Parse git diff output and return normalized changed files
 * This is the main public API for the diff parser
 *
 * @param diffOutput - Raw git diff output (any format)
 * @param options - Optional parsing configuration
 * @returns ParseResult with normalized files and any warnings
 */
export function parseDiff(
  diffOutput: string,
  options: ParseOptions = {}
): ParseResult {
  const warnings: string[] = [];

  try {
    // Parse raw diff
    const rawEntries = parseRawDiff(diffOutput, options);

    if (rawEntries.length === 0 && diffOutput.trim()) {
      warnings.push("Diff output provided but no files were parsed");
    }

    // Normalize entries
    const files = normalizeDiff(rawEntries);

    return {
      files,
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    warnings.push(`Error parsing diff: ${message}`);
    return {
      files: [],
      warnings,
    };
  }
}

// Export types
export type { ChangedFile, RawDiffEntry, ParseOptions, ParseResult };

// Export lower-level functions for advanced use cases
export { parseRawDiff, normalizeDiff };

