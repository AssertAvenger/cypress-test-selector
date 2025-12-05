import type { ChangedFile } from "../diff/types.js";
import type { DiscoveredTestFile } from "../discovery/types.js";
import { tokenizeFilename } from "./similarity-heuristic.js";

/**
 * Calculate tag-based similarity score
 *
 * @param changedFile - Changed file
 * @param testFile - Test file with metadata
 * @returns Score from 0.0 to 1.0
 */
export function calculateTagScore(
  changedFile: ChangedFile,
  testFile: DiscoveredTestFile
): number {
  // Use newPath for added/modified, oldPath for deleted/renamed
  const sourcePath = changedFile.newPath || changedFile.oldPath || "";
  if (!sourcePath || testFile.tags.length === 0) {
    return 0.0;
  }

  // Extract tokens from changed file name
  const sourceTokens = tokenizeFilename(sourcePath);

  // Check for exact tag matches
  const testTagsLower = testFile.tags.map((t) => t.toLowerCase());
  const sourceTokensLower = sourceTokens.map((t) => t.toLowerCase());

  // Exact tag match (any tag matches any token) → 1.0
  for (const tag of testTagsLower) {
    if (sourceTokensLower.includes(tag)) {
      return 1.0;
    }
  }

  // Partial overlap (token match) → 0.4-0.7
  // Also tokenize tags to match individual parts
  const tagTokens = new Set<string>();
  for (const tag of testTagsLower) {
    // Split tag on hyphens/underscores and add all parts
    tag.split(/[-_]/).forEach((part) => tagTokens.add(part));
    // Also add the full tag
    tagTokens.add(tag);
  }

  let matches = 0;
  for (const tagToken of tagTokens) {
    if (sourceTokensLower.includes(tagToken)) {
      matches++;
    }
  }
  
  // Also check if any source token is contained in any tag
  for (const token of sourceTokensLower) {
    for (const tag of testTagsLower) {
      if (tag.includes(token) || token.includes(tag)) {
        matches++;
        break; // Count each token only once
      }
    }
  }

  if (matches > 0) {
    // Calculate overlap ratio
    const maxLength = Math.max(testTagsLower.length, sourceTokensLower.length);
    const overlapRatio = matches / maxLength;

    // Map to 0.4-0.7 range
    if (overlapRatio >= 0.5) {
      return 0.7;
    } else if (overlapRatio >= 0.3) {
      return 0.5;
    } else {
      return 0.4;
    }
  }

  // No match → 0
  return 0.0;
}

