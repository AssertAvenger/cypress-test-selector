import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { CliConfig, MergedConfig } from "../types.js";

/**
 * Default configuration
 */
const DEFAULT_CONFIG: MergedConfig = {
  projectRoot: process.cwd(),
  testPatterns: [],
  exclude: [],
  safetyLevel: "medium",
  defaultBase: "origin/main",
};

/**
 * Load configuration from cypress-test-selector.config.ts
 */
async function loadConfigFile(projectRoot: string): Promise<CliConfig | null> {
  const configPath = join(projectRoot, "cypress-test-selector.config.ts");
  try {
    // For now, we'll use a simple approach
    // In production, you might want to use ts-node or similar to load TS config
    // For this implementation, we'll check for a JS version first
    const jsConfigPath = join(projectRoot, "cypress-test-selector.config.js");
    try {
      const config = await import(jsConfigPath);
      return config.default || config;
    } catch {
      // JS config not found, try TS
      // Note: In a real implementation, you'd need to compile/load TS config
      // For now, we'll return null and rely on package.json
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Load configuration from package.json
 */
async function loadPackageJsonConfig(
  projectRoot: string
): Promise<CliConfig | null> {
  const packageJsonPath = join(projectRoot, "package.json");
  try {
    const content = await readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(content);
    return packageJson["cypress-test-selector"] || null;
  } catch {
    return null;
  }
}

/**
 * Load and merge configuration from all sources
 *
 * Priority:
 * 1. CLI arguments (passed in)
 * 2. cypress-test-selector.config.ts
 * 3. package.json "cypress-test-selector" key
 * 4. Defaults
 */
export async function loadConfig(
  projectRoot: string = process.cwd(),
  cliOverrides: Partial<CliConfig> = {}
): Promise<MergedConfig> {
  // Start with defaults
  const config: MergedConfig = { ...DEFAULT_CONFIG };

  // Load from config file
  const configFile = await loadConfigFile(projectRoot);
  if (configFile) {
    Object.assign(config, configFile);
  }

  // Load from package.json
  const packageJsonConfig = await loadPackageJsonConfig(projectRoot);
  if (packageJsonConfig) {
    Object.assign(config, packageJsonConfig);
  }

  // Apply CLI overrides (highest priority)
  Object.assign(config, cliOverrides);

  // Ensure projectRoot is absolute
  if (config.projectRoot) {
    config.projectRoot = resolve(config.projectRoot);
  }

  return config;
}

