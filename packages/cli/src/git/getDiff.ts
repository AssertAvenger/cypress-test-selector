import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Logger } from "../output/logger.js";

const execAsync = promisify(exec);

/**
 * Auto-detect the base branch/commit for diff
 * Tries: origin/main, origin/master, main, master
 */
async function detectBaseBranch(): Promise<string> {
  const candidates = ["origin/main", "origin/master", "main", "master"];

  for (const candidate of candidates) {
    try {
      await execAsync(`git rev-parse --verify ${candidate}`, {
        stdio: "pipe",
      });
      return candidate;
    } catch {
      // Try next candidate
      continue;
    }
  }

  // Fallback to HEAD~1 if no branch found
  return "HEAD~1";
}

/**
 * Get raw git diff output
 *
 * @param base - Base reference (branch, commit, etc.)
 * @param logger - Logger instance
 * @returns Raw git diff output
 */
export async function getGitDiff(
  base: string | undefined,
  logger: Logger
): Promise<string> {
  // Auto-detect base if not provided
  const baseRef = base || (await detectBaseBranch());

  logger.debug(`Using git base: ${baseRef}`);

  try {
    // Get diff with --name-status format for better parsing
    // Use ... for range (merge base) or .. for direct comparison
    // Also include uncommitted changes with HEAD
    const { stdout: committedDiff } = await execAsync(
      `git diff --name-status ${baseRef}...HEAD`,
      {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    ).catch(() => ({ stdout: "", stderr: "" }));
    
    // Also get uncommitted changes
    const { stdout: uncommittedDiff, stderr } = await execAsync(
      `git diff --name-status HEAD`,
      {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    ).catch(() => ({ stdout: "", stderr: "" }));
    
    // Combine both diffs, deduplicate
    const combined = (committedDiff || "") + (uncommittedDiff || "");
    const stdout = combined;

    if (stderr) {
      logger.warn(`Git diff stderr: ${stderr}`);
    }

    if (!stdout || !stdout.trim()) {
      logger.info("No changes detected in git diff.");
      return "";
    }

    return stdout;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get git diff: ${errorMessage}`);
  }
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execAsync("git rev-parse --git-dir", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

