import { readFile } from "node:fs/promises";
import { resolve, dirname, normalize, relative } from "node:path";
import type { ChangedFile } from "../diff/types.js";

/**
 * Regular expression to match ES6 import statements
 * Matches: import ... from "path" or import ... from 'path'
 */
const IMPORT_REGEX = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?["']([^"']+)["']/g;

/**
 * Regular expression to match require() statements
 * Matches: require("path") or require('path')
 */
const REQUIRE_REGEX = /require\s*\(\s*["']([^"']+)["']\s*\)/g;

/**
 * Normalize an import path to an absolute path relative to project root
 * @param importPath - Import path from the file
 * @param testFileDir - Directory of the test file
 * @param projectRoot - Project root directory
 * @returns Normalized absolute path or null if cannot be resolved
 */
function normalizeImportPath(
  importPath: string,
  testFileDir: string,
  projectRoot: string
): string | null {
  // Skip node_modules and external packages
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    // Relative import
    try {
      const resolved = resolve(testFileDir, importPath);
      // Normalize to POSIX style
      return normalize(resolved).replace(/\\/g, "/");
    } catch {
      return null;
    }
  }

  // Try resolving as if it's from project root (for absolute imports from root)
  if (!importPath.includes("node_modules") && !importPath.includes("@")) {
    try {
      const resolved = resolve(projectRoot, importPath);
      if (resolved.startsWith(projectRoot)) {
        return normalize(resolved).replace(/\\/g, "/");
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Extract all import paths from a test file
 * @param testFilePath - Path to the test file
 * @param projectRoot - Project root directory
 * @returns Array of normalized import paths
 */
async function extractImports(
  testFilePath: string,
  projectRoot: string
): Promise<string[]> {
  try {
    const content = await readFile(testFilePath, "utf-8");
    const testFileDir = dirname(testFilePath);
    const imports: string[] = [];

    // Match ES6 imports
    let match;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      const normalized = normalizeImportPath(importPath, testFileDir, projectRoot);
      if (normalized) {
        imports.push(normalized);
      }
    }

    // Match require() statements
    while ((match = REQUIRE_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      const normalized = normalizeImportPath(importPath, testFileDir, projectRoot);
      if (normalized) {
        imports.push(normalized);
      }
    }

    return imports;
  } catch (error) {
    // If file cannot be read, return empty array
    return [];
  }
}

/**
 * Check if a changed file path matches any import path
 * Handles various path formats and extensions
 *
 * @param changedFilePath - Path to the changed file
 * @param importPaths - Array of import paths from test file
 * @returns true if there's a match
 */
function matchesImport(
  changedFilePath: string,
  importPaths: string[]
): boolean {
  const normalizedChanged = normalize(changedFilePath).replace(/\\/g, "/");

  for (const importPath of importPaths) {
    const normalizedImport = normalize(importPath).replace(/\\/g, "/");

    // Exact match
    if (normalizedChanged === normalizedImport) {
      return true;
    }

    // Match without extensions
    const changedNoExt = normalizedChanged.replace(/\.[^.]+$/, "");
    const importNoExt = normalizedImport.replace(/\.[^.]+$/, "");

    if (changedNoExt === importNoExt) {
      return true;
    }

    // Match with index file resolution
    // e.g., "src/component" matches "src/component/index.ts"
    if (
      normalizedChanged.replace(/\/index\.[^.]+$/, "") === importNoExt ||
      normalizedImport.replace(/\/index\.[^.]+$/, "") === changedNoExt
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate import graph score between a changed file and a test file
 * High score (1.0) for direct imports, 0.0 for no imports
 *
 * @param changedFile - Changed file
 * @param testPath - Test file path
 * @param projectRoot - Project root directory
 * @returns Score from 0.0 to 1.0
 */
export async function calculateImportGraphScore(
  changedFile: ChangedFile,
  testPath: string,
  projectRoot: string
): Promise<number> {
  // Use newPath for added/modified, oldPath for deleted/renamed
  const sourcePath = changedFile.newPath || changedFile.oldPath || "";
  if (!sourcePath) {
    return 0.0;
  }

  // Resolve to absolute path
  const absoluteSourcePath = resolve(projectRoot, sourcePath)
    .replace(/\\/g, "/");

  // Extract imports from test file
  const imports = await extractImports(testPath, projectRoot);

  // Check if changed file is imported
  if (matchesImport(absoluteSourcePath, imports)) {
    return 1.0; // Direct import = high confidence
  }

  // Also check oldPath for renamed files
  if (changedFile.oldPath) {
    const absoluteOldPath = resolve(projectRoot, changedFile.oldPath)
      .replace(/\\/g, "/");
    if (matchesImport(absoluteOldPath, imports)) {
      return 1.0;
    }
  }

  return 0.0; // No import match
}

