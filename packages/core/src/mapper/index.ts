import { dirname } from "node:path";
import type { ChangedFile } from "../diff/types.js";
import type {
  MappingResult,
  MappingOptions,
  SafetyLevel,
  TestMapping,
} from "./types.js";
import type { DiscoveredTestFile } from "../discovery/types.js";
import { calculateDirectoryScore } from "./directory-heuristic.js";
import { calculateSimilarityScore } from "./similarity-heuristic.js";
import { calculateImportGraphScore } from "./import-graph-heuristic.js";
import { calculateTagScore } from "./tag-heuristic.js";
import { calculateTitleScore } from "./title-heuristic.js";
import { combineScores } from "./scoring.js";
import { getThreshold, filterBySafety } from "./safety.js";
import { SAFETY_THRESHOLDS, DEFAULT_WEIGHTS } from "./types.js";

/**
 * Map changed files to test files using multiple heuristics
 *
 * @param diff - Array of changed files from git diff
 * @param tests - Array of absolute test file paths or DiscoveredTestFile[]
 * @param options - Mapping options
 * @returns Mapping result with scores and selected tests
 */
export async function mapDiffToTests(
  diff: ChangedFile[],
  tests: string[] | DiscoveredTestFile[],
  options: MappingOptions = {}
): Promise<MappingResult> {
  const {
    safetyLevel = "medium",
    threshold: customThreshold,
    directoryWeight = DEFAULT_WEIGHTS.directoryWeight,
    similarityWeight = DEFAULT_WEIGHTS.similarityWeight,
    importGraphWeight = DEFAULT_WEIGHTS.importGraphWeight,
    tagWeight = DEFAULT_WEIGHTS.tagWeight,
    titleWeight = DEFAULT_WEIGHTS.titleWeight,
  } = options;

  // Get threshold based on safety level
  const threshold = getThreshold(safetyLevel, customThreshold);

  // Calculate scores for each test file
  const mappings: TestMapping[] = [];

  // Normalize tests to DiscoveredTestFile format
  const testFiles: DiscoveredTestFile[] = tests.map((test) => {
    if (typeof test === "string") {
      // Simple string path - create minimal metadata
      return {
        file: test,
        tags: [],
        titles: [],
        tokens: [],
      };
    }
    return test;
  });

  // Get project root from first test file (assume all tests are in same project)
  // Try to find common ancestor that contains "cypress" directory
  let projectRoot = ".";
  if (testFiles.length > 0) {
    const firstTest = testFiles[0].file;
    // Find the directory containing "cypress"
    const cypressIndex = firstTest.indexOf("/cypress");
    if (cypressIndex > 0) {
      projectRoot = firstTest.substring(0, cypressIndex);
    } else {
      // Fallback: use parent of test file directory
      projectRoot = dirname(dirname(firstTest));
    }
  }

  for (const testFile of testFiles) {
    const testPath = testFile.file;
    let maxScore = 0.0;
    let maxDirectoryScore = 0.0;
    let maxSimilarityScore = 0.0;
    let maxImportScore = 0.0;
    let maxTagScore = 0.0;
    let maxTitleScore = 0.0;
    let bestReason = "";

    // Check against each changed file
    for (const changedFile of diff) {
      // Calculate directory score
      const dirScore = calculateDirectoryScore(changedFile, testPath);
      maxDirectoryScore = Math.max(maxDirectoryScore, dirScore);

      // Calculate similarity score
      const simScore = calculateSimilarityScore(changedFile, testPath);
      maxSimilarityScore = Math.max(maxSimilarityScore, simScore);

      // Calculate import graph score
      const importScore = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );
      maxImportScore = Math.max(maxImportScore, importScore);

      // Calculate tag score
      const tagScore = calculateTagScore(changedFile, testFile);
      maxTagScore = Math.max(maxTagScore, tagScore);

      // Calculate title score
      const titleScore = calculateTitleScore(changedFile, testFile);
      maxTitleScore = Math.max(maxTitleScore, titleScore);

      // Combine scores
      const combined = combineScores(
        [dirScore, simScore, importScore, tagScore, titleScore],
        [
          directoryWeight,
          similarityWeight,
          importGraphWeight,
          tagWeight,
          titleWeight,
        ]
      );

      if (combined > maxScore) {
        maxScore = combined;
        // Generate reason
        const reasons: string[] = [];
        if (dirScore > 0.5) reasons.push("directory match");
        if (simScore > 0.5) reasons.push("filename similarity");
        if (importScore > 0.5) reasons.push("import dependency");
        if (tagScore > 0.5) reasons.push("tag match");
        if (titleScore > 0.5) reasons.push("title match");
        bestReason = reasons.join(", ") || "low confidence match";
      }
    }

    // Only include if score > 0
    if (maxScore > 0) {
      mappings.push({
        testPath,
        score: maxScore,
        heuristics: {
          directory: maxDirectoryScore,
          similarity: maxSimilarityScore,
          importGraph: maxImportScore,
          tags: maxTagScore,
          titles: maxTitleScore,
        },
        reason: bestReason,
      });
    }
  }

  // Sort by score (descending)
  mappings.sort((a, b) => b.score - a.score);

  // Filter by safety level
  const selected = filterBySafety(mappings, threshold);

  return {
    mappings,
    selected,
    safetyLevel,
    threshold,
  };
}

// Export types
export type {
  MappingResult,
  MappingOptions,
  SafetyLevel,
  TestMapping,
};

// Export safety thresholds and default weights
export { SAFETY_THRESHOLDS, DEFAULT_WEIGHTS };

// Export individual heuristics for testing/advanced use
export {
  calculateDirectoryScore,
  calculateSimilarityScore,
  calculateImportGraphScore,
};

