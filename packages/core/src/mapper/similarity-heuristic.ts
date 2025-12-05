import { basename as pathBasename } from "node:path";
import type { ChangedFile } from "../diff/types.js";

/**
 * Extract base filename without extension
 * @param filePath - File path
 * @returns Base filename without extension
 */
function getBaseName(filePath: string): string {
  const base = pathBasename(filePath);
  // Remove extension(s)
  return base.replace(/\.[^.]+$/, "");
}

/**
 * Tokenize a filename by splitting on camelCase, underscores, and hyphens
 * @param filepath - File path to tokenize (extracts basename automatically)
 * @returns Array of tokens
 */
export function tokenizeFilename(filepath: string): string[] {
  // Extract basename and remove extension
  const basename = pathBasename(filepath).replace(/\.[^.]+$/, "");
  
  // Split on various delimiters and camelCase boundaries
  // First split on delimiters
  const parts = basename.split(/[-_]/);
  
  const tokens: string[] = [];
  
  for (const part of parts) {
    // Split camelCase: insert space before uppercase letters
    // e.g., "LoginForm" -> "Login Form"
    const camelSplit = part.replace(/([a-z])([A-Z])/g, "$1 $2");
    
    // Split on spaces and process each word
    const words = camelSplit.split(/\s+/);
    
    for (const word of words) {
      const lowercased = word.toLowerCase();
      if (lowercased.length > 0) {
        tokens.push(lowercased);
      }
    }
  }

  return tokens;
}

/**
 * Calculate Dice coefficient between two token arrays
 * Dice coefficient = 2 * |A ∩ B| / (|A| + |B|)
 *
 * @param tokens1 - First token array
 * @param tokens2 - Second token array
 * @returns Dice coefficient (0.0 to 1.0)
 */
export function diceCoefficient(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 && tokens2.length === 0) {
    return 1.0;
  }
  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0.0;
  }

  // Create sets for intersection calculation
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  // Calculate intersection
  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }

  // Dice coefficient
  return (2 * intersection) / (tokens1.length + tokens2.length);
}

/**
 * Calculate longest common subsequence (LCS) based similarity
 * This is a simpler alternative that works well for filenames
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0.0 to 1.0)
 */
function lcsSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) {
    return 1.0;
  }

  // Simple substring matching
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Calculate longest common substring
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  let maxLength = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        maxLength = Math.max(maxLength, dp[i][j]);
      }
    }
  }

  // Normalize by average length
  const avgLength = (m + n) / 2;
  return avgLength > 0 ? maxLength / avgLength : 0.0;
}

/**
 * Calculate filename similarity score between a changed file and a test file
 * Uses tokenization and Dice coefficient for accurate matching
 *
 * @param changedFile - Changed file
 * @param testPath - Test file path
 * @returns Score from 0.0 to 1.0
 */
export function calculateSimilarityScore(
  changedFile: ChangedFile,
  testPath: string
): number {
  // Use newPath for added/modified, oldPath for deleted/renamed
  const sourcePath = changedFile.newPath || changedFile.oldPath || "";
  if (!sourcePath) {
    return 0.0;
  }

  // Extract base names
  const sourceBase = getBaseName(sourcePath);
  const testBase = getBaseName(testPath);

  // Remove common test suffixes
  const testBaseClean = testBase
    .replace(/\.(spec|test|cy)$/i, "")
    .replace(/_?(spec|test|cy)$/i, "");

  // Tokenize both filenames
  const sourceTokens = tokenizeFilename(sourceBase);
  const testTokens = tokenizeFilename(testBaseClean);

  // Calculate Dice coefficient
  const diceScore = diceCoefficient(sourceTokens, testTokens);

  // Calculate LCS similarity as a fallback
  const lcsScore = lcsSimilarity(sourceBase, testBaseClean);

  // Combine both metrics (weight Dice more heavily)
  const combinedScore = diceScore * 0.7 + lcsScore * 0.3;

  // Bonus for exact match (after cleaning)
  if (sourceBase.toLowerCase() === testBaseClean.toLowerCase()) {
    return 1.0;
  }

  // Bonus for high token overlap
  if (diceScore > 0.8) {
    return Math.min(1.0, combinedScore + 0.1);
  }

  return combinedScore;
}

