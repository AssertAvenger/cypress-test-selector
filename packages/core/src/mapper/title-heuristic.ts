import type { ChangedFile } from "../diff/types.js";
import type { DiscoveredTestFile } from "../discovery/types.js";
import { tokenizeFilename, diceCoefficient } from "./similarity-heuristic.js";

/**
 * Calculate title-based similarity score
 *
 * @param changedFile - Changed file
 * @param testFile - Test file with metadata
 * @returns Score from 0.0 to 1.0
 */
export function calculateTitleScore(
  changedFile: ChangedFile,
  testFile: DiscoveredTestFile
): number {
  // Use newPath for added/modified, oldPath for deleted/renamed
  const sourcePath = changedFile.newPath || changedFile.oldPath || "";
  if (!sourcePath || testFile.tokens.length === 0) {
    return 0.0;
  }

  // Extract tokens from changed file name
  const sourceTokens = tokenizeFilename(sourcePath);

  // Calculate token overlap using Dice coefficient
  const testTokens = testFile.tokens;
  const overlapCount = testTokens.filter((token) =>
    sourceTokens.includes(token)
  ).length;
  
  // Calculate overlap ratio: overlapping tokens / total unique tokens
  const totalUniqueTokens = new Set([...sourceTokens, ...testTokens]).size;
  const overlapRatio =
    totalUniqueTokens > 0 ? overlapCount / totalUniqueTokens : 0;
  
  // Calculate Dice coefficient for better matching
  const diceScore = diceCoefficient(sourceTokens, testTokens);

  // Exact phrase match → 1.0
  // Check if any title exactly matches the source filename (after normalization)
  const sourceBase = sourcePath.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
  const sourceBaseLower = sourceBase.toLowerCase();
  for (const title of testFile.titles) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes(sourceBaseLower) || sourceBaseLower.includes(titleLower)) {
      return 1.0;
    }
  }

  // Overlap ratio > 0.6 → 0.8
  // Use Dice score as well for better accuracy
  if (overlapRatio > 0.6 || diceScore > 0.6) {
    return 0.8;
  }

  // Overlap ratio > 0.3 → 0.4-0.6 (based on Dice coefficient)
  if (overlapRatio > 0.3 || diceScore > 0.3) {
    // Use Dice coefficient to fine-tune between 0.4 and 0.6
    return 0.4 + diceScore * 0.2;
  }

  // Otherwise → 0
  return 0.0;
}

