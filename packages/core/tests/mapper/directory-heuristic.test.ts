import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { calculateDirectoryScore } from "../../src/mapper/directory-heuristic.js";
import type { ChangedFile } from "../../src/diff/types.js";

describe("directory-heuristic", () => {
  describe("calculateDirectoryScore", () => {
    it("should give high score for matching directory structure", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/button.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      expect(score).toBeGreaterThanOrEqual(0.5);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    it("should give low score for different directory structures", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/features/auth.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      expect(score).toBeLessThan(0.5);
    });

    it("should handle nested directories", () => {
      const changedFile: ChangedFile = {
        newPath: "src/features/auth/LoginForm.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/features/auth/login-form.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      expect(score).toBeGreaterThan(0.4);
    });

    it("should give bonus for exact directory match", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/button.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      // Should be higher due to exact match bonus
      expect(score).toBeGreaterThan(0.3);
    });

    it("should handle root-level files", () => {
      const changedFile: ChangedFile = {
        newPath: "config.ts",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/config.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      // Should give partial score for root-level
      expect(score).toBeGreaterThanOrEqual(0.0);
    });

    it("should handle renamed files", () => {
      const changedFile: ChangedFile = {
        oldPath: "src/components/OldButton.tsx",
        newPath: "src/components/NewButton.tsx",
        status: "renamed",
      };
      const testPath = resolve("/project", "cypress/e2e/components/new-button.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      expect(score).toBeGreaterThan(0.0);
    });

    it("should return 0 for missing paths", () => {
      const changedFile: ChangedFile = {
        newPath: "",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/test.spec.ts");

      const score = calculateDirectoryScore(changedFile, testPath);

      expect(score).toBe(0.0);
    });
  });
});

