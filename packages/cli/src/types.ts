/**
 * CLI configuration options
 */
export interface CliConfig {
  /** Project root directory */
  projectRoot?: string;
  /** Test file patterns */
  testPatterns?: string[];
  /** Exclusion patterns */
  exclude?: string[];
  /** Safety level for test selection */
  safetyLevel?: "high" | "moderate" | "medium" | "low";
  /** Custom threshold (overrides safety level) */
  threshold?: number;
  /** Default git base branch */
  defaultBase?: string;
}

/**
 * Command options for diff command
 */
export interface DiffCommandOptions {
  /** Git base reference (branch, commit, etc.) */
  base?: string;
  /** Output format */
  format?: "human" | "json";
  /** Verbose output with scoring breakdown */
  verbose?: boolean;
  /** Custom test patterns (overrides config) */
  patterns?: string[];
  /** Logging level */
  logLevel?: "silent" | "normal" | "verbose" | "debug";
}

/**
 * Merged configuration (CLI config + defaults)
 */
export interface MergedConfig extends Required<Omit<CliConfig, "threshold">> {
  threshold?: number;
}

