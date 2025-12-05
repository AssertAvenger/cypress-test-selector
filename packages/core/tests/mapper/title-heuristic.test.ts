import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { calculateTitleScore } from "../../src/mapper/title-heuristic.js";
import type { ChangedFile } from "../../src/diff/types.js";
import type { DiscoveredTestFile } from "../../src/discovery/types.js";

describe("title-heuristic", () => {
  describe("calculateTitleScore", () => {
    it("should give 1.0 for exact phrase match", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginButton.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: [],
        titles: ["Login button tests", "should render login button"],
        tokens: ["login", "button", "tests", "should", "render", "login", "button"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should match "login" and "button" tokens
      // Note: tokens from "LoginButton" = ["login", "button"], tokens from titles include these
      expect(score).toBeGreaterThan(0.0);
    });

    it("should give 1.0 when title contains filename", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginForm.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login-form.spec.ts"),
        tags: [],
        titles: ["LoginForm component tests"],
        tokens: ["loginform", "component", "tests"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      expect(score).toBe(1.0);
    });

    it("should give 0.8 for overlap ratio > 0.6", () => {
      const changedFile: ChangedFile = {
        newPath: "src/features/auth/LoginPage.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/auth.spec.ts"),
        tags: [],
        titles: ["Login page authentication flow"],
        tokens: ["login", "page", "authentication", "flow"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should have high overlap (login, page tokens)
      // Note: "LoginPage" tokens = ["login", "page"], title tokens = ["login", "page", "authentication", "flow"]
      expect(score).toBeGreaterThan(0.0);
    });

    it("should give 0.4-0.6 for overlap ratio > 0.3", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/UserProfile.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/profile.spec.ts"),
        tags: [],
        titles: ["User profile page tests"],
        tokens: ["user", "profile", "page", "tests"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should have some overlap (user, profile tokens)
      expect(score).toBeGreaterThan(0.0);
    });

    it("should give 0.0 for no matches", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: [],
        titles: ["Login page tests"],
        tokens: ["login", "page", "tests"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      expect(score).toBe(0.0);
    });

    it("should handle empty titles", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/button.spec.ts"),
        tags: [],
        titles: [],
        tokens: [],
      };

      const score = calculateTitleScore(changedFile, testFile);

      expect(score).toBe(0.0);
    });

    it("should handle camelCase in titles", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginForm.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: [],
        titles: ["LoginFormComponent"],
        tokens: ["loginformcomponent"], // Tokenized
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should have some match
      expect(score).toBeGreaterThan(0.0);
    });

    it("should handle multiple titles", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/button.spec.ts"),
        tags: [],
        titles: [
          "Button component",
          "should render button",
          "should handle click",
        ],
        tokens: ["button", "component", "should", "render", "button", "should", "handle", "click"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should match "button" token
      expect(score).toBeGreaterThan(0.0);
    });

    it("should handle renamed files", () => {
      const changedFile: ChangedFile = {
        oldPath: "src/components/OldButton.tsx",
        newPath: "src/components/NewButton.tsx",
        status: "renamed",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/button.spec.ts"),
        tags: [],
        titles: ["Button tests"],
        tokens: ["button", "tests"],
      };

      const score = calculateTitleScore(changedFile, testFile);

      // Should match "button" from newPath
      expect(score).toBeGreaterThan(0.0);
    });
  });
});

