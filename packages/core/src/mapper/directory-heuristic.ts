import { dirname, relative, normalize } from "node:path";
import type { ChangedFile } from "../diff/types.js";

/**
 * Normalize a path to POSIX style and split into segments
 * @param path - Path to normalize
 * @returns Array of path segments
 */
function normalizePathSegments(path: string): string[] {
  // Normalize to POSIX style
  const normalized = normalize(path).replace(/\\/g, "/");
  // Remove leading/trailing slashes and split
  return normalized.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
}

/**
 * Calculate directory similarity score between a changed file and a test file
 * Score = ratio of matching path segments / total segments
 *
 * @param changedFile - Changed file path
 * @param testPath - Test file path
 * @returns Score from 0.0 to 1.0
 */
export function calculateDirectoryScore(
  changedFile: ChangedFile,
  testPath: string
): number {
  // Use newPath for added/modified, oldPath for deleted/renamed
  const sourcePath = changedFile.newPath || changedFile.oldPath || "";
  if (!sourcePath) {
    return 0.0;
  }

  // Get directory paths (remove filename)
  const sourceDir = dirname(sourcePath);
  const testDir = dirname(testPath);

  // Normalize and split into segments
  const sourceSegments = normalizePathSegments(sourceDir);
  const testSegments = normalizePathSegments(testDir);

  // Remove common prefixes (like "src", "cypress", etc.) for better matching
  // This helps when source is in "src/" and tests are in "cypress/e2e/"
  const sourceFiltered = sourceSegments.filter(
    (seg) => !["src", "lib", "app"].includes(seg.toLowerCase())
  );
  const testFiltered = testSegments.filter(
    (seg) => !["cypress", "e2e", "tests"].includes(seg.toLowerCase())
  );

  // Calculate matching segments
  let matches = 0;
  const maxLength = Math.max(sourceFiltered.length, testFiltered.length);

  if (maxLength === 0) {
    // Both are at root, give partial score
    return 0.3;
  }

  // Compare segments from the end (most specific directories first)
  const minLength = Math.min(sourceFiltered.length, testFiltered.length);
  for (let i = 0; i < minLength; i++) {
    const sourceSeg = sourceFiltered[sourceFiltered.length - 1 - i].toLowerCase();
    const testSeg = testFiltered[testFiltered.length - 1 - i].toLowerCase();

    if (sourceSeg === testSeg) {
      matches++;
    } else {
      // Stop at first mismatch (directories should match from the end)
      break;
    }
  }

  // Score based on matching segments
  // Weight recent matches more heavily
  const baseScore = matches / maxLength;

  // Bonus for exact directory match
  if (sourceFiltered.length === testFiltered.length && matches === minLength) {
    return Math.min(1.0, baseScore + 0.2);
  }

  return baseScore;
}

