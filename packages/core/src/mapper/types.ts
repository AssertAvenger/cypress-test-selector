import type { ChangedFile } from "../diff/types.js";

/**
 * Safety level for test selection
 */
export type SafetyLevel = "high" | "moderate" | "medium" | "low";

/**
 * Mapping score for a test file
 * Scores range from 0.0 to 1.0
 */
export interface TestMapping {
  /** Absolute path to the test file */
  testPath: string;
  /** Combined score from all heuristics (0.0 to 1.0) */
  score: number;
  /** Individual heuristic scores */
  heuristics: {
    directory: number;
    similarity: number;
    importGraph: number;
    tags: number;
    titles: number;
  };
  /** Reason for selection (for debugging/logging) */
  reason?: string;
}

/**
 * Result of mapping changed files to test files
 */
export interface MappingResult {
  /** Array of test mappings with scores */
  mappings: TestMapping[];
  /** Selected test paths based on safety level */
  selected: string[];
  /** Safety level used */
  safetyLevel: SafetyLevel;
  /** Threshold used for selection */
  threshold: number;
}

/**
 * Options for mapping changed files to tests
 */
export interface MappingOptions {
  /** Safety level for test selection */
  safetyLevel?: SafetyLevel;
  /** Custom threshold (overrides safety level if provided) */
  threshold?: number;
  /** Whether to include individual heuristic scores */
  includeScores?: boolean;
  /** Custom directory mapping weight (default: DEFAULT_WEIGHTS.directoryWeight) */
  directoryWeight?: number;
  /** Custom similarity weight (default: DEFAULT_WEIGHTS.similarityWeight) */
  similarityWeight?: number;
  /** Custom import graph weight (default: DEFAULT_WEIGHTS.importGraphWeight) */
  importGraphWeight?: number;
  /** Custom tag heuristic weight (default: DEFAULT_WEIGHTS.tagWeight) */
  tagWeight?: number;
  /** Custom title heuristic weight (default: DEFAULT_WEIGHTS.titleWeight) */
  titleWeight?: number;
}

/**
 * Safety level thresholds
 */
export const SAFETY_THRESHOLDS: Record<SafetyLevel, number> = {
  high: 0.0, // Select all tests with any score > 0
  moderate: 0.2, // Select tests with score >= 0.2 (between high and medium)
  medium: 0.4, // Select tests with score >= 0.4
  low: 0.7, // Select only tests with score >= 0.7
};

/**
 * Default weights for heuristic scoring
 * These weights control the relative importance of each heuristic in the combined score.
 * Higher weights mean the heuristic has more influence on the final score.
 */
export const DEFAULT_WEIGHTS = {
  /** Directory mapping weight - matches based on path segments */
  directoryWeight: 1.0,
  /** Filename similarity weight - matches based on token similarity */
  similarityWeight: 1.0,
  /** Import graph weight - matches based on import dependencies */
  importGraphWeight: 1.0,
  /** Tag heuristic weight - matches based on test tags */
  tagWeight: 0.5,
  /** Title heuristic weight - matches based on test titles */
  titleWeight: 0.4,
} as const;

