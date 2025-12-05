import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { calculateTagScore } from "../../src/mapper/tag-heuristic.js";
import type { ChangedFile } from "../../src/diff/types.js";
import type { DiscoveredTestFile } from "../../src/discovery/types.js";

describe("tag-heuristic", () => {
  describe("calculateTagScore", () => {
    it("should give 1.0 for exact tag match", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginButton.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: ["login"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      expect(score).toBe(1.0); // "login" tag matches "login" token
    });

    it("should give 1.0 for multiple tag matches", () => {
      const changedFile: ChangedFile = {
        newPath: "src/features/auth/LoginForm.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/auth.spec.ts"),
        tags: ["auth", "login", "user"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      expect(score).toBe(1.0); // "login" or "auth" matches
    });

    it("should give 0.4-0.7 for partial token overlap", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/UserProfile.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/profile.spec.ts"),
        tags: ["user-profile"], // Only hyphenated tag, no exact "profile" match
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      // Should have partial overlap (user, profile tokens from "user-profile")
      // "profile" token from UserProfile matches "profile" part of "user-profile" tag
      // This should give partial match, not exact (since "user-profile" != "profile")
      expect(score).toBeGreaterThanOrEqual(0.4);
      expect(score).toBeLessThanOrEqual(0.7);
    });

    it("should give 0.0 for no matches", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/Button.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: ["login", "auth"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      expect(score).toBe(0.0);
    });

    it("should handle empty tags", () => {
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

      const score = calculateTagScore(changedFile, testFile);

      expect(score).toBe(0.0);
    });

    it("should normalize tags correctly", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/LoginButton.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: ["LOGIN", "  auth  ", "user-profile"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      // Should match "login" (normalized from "LOGIN")
      expect(score).toBe(1.0);
    });

    it("should handle hyphenated tags", () => {
      const changedFile: ChangedFile = {
        newPath: "src/components/UserProfile.tsx",
        status: "modified",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/profile.spec.ts"),
        tags: ["user-profile", "user_profile", "profile"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      // Should match "user" and "profile" tokens
      expect(score).toBeGreaterThan(0.0);
    });

    it("should handle renamed files", () => {
      const changedFile: ChangedFile = {
        oldPath: "src/components/OldLogin.tsx",
        newPath: "src/components/NewLogin.tsx",
        status: "renamed",
      };
      const testFile: DiscoveredTestFile = {
        file: resolve("/project", "cypress/e2e/login.spec.ts"),
        tags: ["login"],
        titles: [],
        tokens: [],
      };

      const score = calculateTagScore(changedFile, testFile);

      // Should match "login" from newPath (may be partial match)
      expect(score).toBeGreaterThan(0.0);
    });
  });
});

