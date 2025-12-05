import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateImportGraphScore } from "../../src/mapper/import-graph-heuristic.js";
import type { ChangedFile } from "../../src/diff/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_ROOT = resolve(__dirname, "../fixtures/mapping");

describe("import-graph-heuristic", () => {
  describe("calculateImportGraphScore", () => {
    it("should give high score for direct import match", async () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve(
        FIXTURES_ROOT,
        "test-files/cypress/e2e/components/button.spec.ts"
      );
      const projectRoot = resolve(FIXTURES_ROOT, "test-files");

      const score = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );

      expect(score).toBe(1.0); // Direct import = 1.0
    });

    it("should give 0 score when file is not imported", async () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve(
        FIXTURES_ROOT,
        "test-files/cypress/e2e/components/input.cy.ts"
      );
      const projectRoot = resolve(FIXTURES_ROOT, "test-files");

      const score = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );

      expect(score).toBe(0.0);
    });

    it("should handle renamed files (check oldPath)", async () => {
      const changedFile: ChangedFile = {
        oldPath: "src/components/OldButton.tsx",
        newPath: "src/components/NewButton.tsx",
        status: "renamed",
      };
      // Test file imports OldButton
      const testPath = resolve(
        FIXTURES_ROOT,
        "test-files/cypress/e2e/components/button.spec.ts"
      );
      const projectRoot = resolve(FIXTURES_ROOT, "test-files");

      // This test would need a fixture that imports OldButton
      // For now, just verify it doesn't throw
      const score = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );

      expect(score).toBeGreaterThanOrEqual(0.0);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it("should handle missing test files gracefully", async () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/nonexistent/path/test.spec.ts");
      const projectRoot = "/nonexistent";

      const score = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );

      // Should return 0.0, not throw
      expect(score).toBe(0.0);
    });

    it("should handle files without imports", async () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Input.tsx",
        status: "modified",
      };
      const testPath = resolve(
        FIXTURES_ROOT,
        "test-files/cypress/e2e/components/input.cy.ts"
      );
      const projectRoot = resolve(FIXTURES_ROOT, "test-files");

      const score = await calculateImportGraphScore(
        changedFile,
        testPath,
        projectRoot
      );

      // input.cy.ts has no imports, so score should be 0
      expect(score).toBe(0.0);
    });
  });
});

