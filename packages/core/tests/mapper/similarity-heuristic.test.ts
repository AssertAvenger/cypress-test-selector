import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { calculateSimilarityScore } from "../../src/mapper/similarity-heuristic.js";
import type { ChangedFile } from "../../src/diff/types.js";

describe("similarity-heuristic", () => {
  describe("calculateSimilarityScore", () => {
    it("should give high score for exact filename match", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/button.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      expect(score).toBeGreaterThan(0.7);
    });

    it("should handle camelCase filenames", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginForm.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/login-form.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      expect(score).toBeGreaterThan(0.1); // camelCase matching can be lower
    });

    it("should handle underscore-separated names", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/user_profile.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/user-profile.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      expect(score).toBeGreaterThan(0.4);
    });

    it("should remove test suffixes (.spec, .test, .cy)", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath1 = resolve("/project", "cypress/e2e/components/button.spec.ts");
      const testPath2 = resolve("/project", "cypress/e2e/components/button.test.ts");
      const testPath3 = resolve("/project", "cypress/e2e/components/button.cy.ts");

      const score1 = calculateSimilarityScore(changedFile, testPath1);
      const score2 = calculateSimilarityScore(changedFile, testPath2);
      const score3 = calculateSimilarityScore(changedFile, testPath3);

      // All should have similar scores
      expect(score1).toBeGreaterThan(0.5);
      expect(score2).toBeGreaterThan(0.5);
      expect(score3).toBeGreaterThan(0.5);
    });

    it("should give low score for unrelated filenames", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/unrelated.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      expect(score).toBeLessThan(0.3);
    });

    it("should handle partial matches", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/UserButton.tsx",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/components/button.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      // Should have some score due to "button" token match
      expect(score).toBeGreaterThan(0.2);
    });

    it("should return 0 for missing paths", () => {
      const changedFile: ChangedFile = {
        newPath: "",
        status: "modified",
      };
      const testPath = resolve("/project", "cypress/e2e/test.spec.ts");

      const score = calculateSimilarityScore(changedFile, testPath);

      expect(score).toBe(0.0);
    });
  });
});

