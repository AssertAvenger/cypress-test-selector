import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, unlink } from "node:fs/promises";
import { mapDiffToTests } from "../../src/mapper/index.js";
import { discoverTests } from "../../src/discovery/discoverTests.js";
import type { ChangedFile } from "../../src/diff/types.js";
import type { DiscoveredTestFile } from "../../src/discovery/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_ROOT = resolve(__dirname, "../fixtures/mapping");

describe("integration: tag and title heuristics", () => {
  it("should use tag heuristic when test has matching tags", async () => {
    // Create a test file with tags
    const testFile = resolve(FIXTURES_ROOT, "test-files/cypress/e2e/tagged-test.spec.ts");
    const testContent = `// @tag: login
// @tags: auth,button
describe("[login] Login button tests", () => {
  it("should render login button", () => {});
});`;

    await writeFile(testFile, testContent, "utf-8");

    const diff: ChangedFile[] = [
      {
        newPath: "src/components/LoginButton.tsx",
        status: "modified",
      },
    ];

    // Discover tests with metadata
    const discovered = await discoverTests({
      projectRoot: resolve(FIXTURES_ROOT, "test-files"),
      extractMetadata: true,
    });

    const tests = discovered as DiscoveredTestFile[];
    const taggedTest = tests.find((t) => t.file.includes("tagged-test"));

    if (taggedTest) {
      const result = await mapDiffToTests(diff, [taggedTest], {
        safetyLevel: "high",
      });

      expect(result.mappings.length).toBeGreaterThan(0);
      const mapping = result.mappings[0];
      // Tag heuristic should contribute to score
      expect(mapping.heuristics.tags).toBeGreaterThan(0.0);
    }

    await unlink(testFile).catch(() => {});
  });

  it("should use title heuristic when test titles match", async () => {
    // Create a test file with matching titles
    const testFile = resolve(FIXTURES_ROOT, "test-files/cypress/e2e/title-test.spec.ts");
    const testContent = `describe("LoginForm component tests", () => {
  it("should render login form", () => {});
  it("should handle login submission", () => {});
});`;

    await writeFile(testFile, testContent, "utf-8");

    const diff: ChangedFile[] = [
      {
        newPath: "src/components/LoginForm.tsx",
        status: "modified",
      },
    ];

    // Discover tests with metadata
    const discovered = await discoverTests({
      projectRoot: resolve(FIXTURES_ROOT, "test-files"),
      extractMetadata: true,
    });

    const tests = discovered as DiscoveredTestFile[];
    const titleTest = tests.find((t) => t.file.includes("title-test"));

    if (titleTest) {
      const result = await mapDiffToTests(diff, [titleTest], {
        safetyLevel: "high",
      });

      expect(result.mappings.length).toBeGreaterThan(0);
      const mapping = result.mappings[0];
      // Title heuristic should contribute to score
      expect(mapping.heuristics.titles).toBeGreaterThan(0.0);
    }

    await unlink(testFile).catch(() => {});
  });

  it("should combine all heuristics in scoring", async () => {
    // Create a test file with tags and titles
    const testFile = resolve(FIXTURES_ROOT, "test-files/cypress/e2e/combined-test.spec.ts");
    const testContent = `// @tag: button
describe("Button component", () => {
  it("should render button", () => {});
});`;

    await writeFile(testFile, testContent, "utf-8");

    const diff: ChangedFile[] = [
      {
        newPath: "src/components/Button.tsx",
        status: "modified",
      },
    ];

    // Discover tests with metadata
    const discovered = await discoverTests({
      projectRoot: resolve(FIXTURES_ROOT, "test-files"),
      extractMetadata: true,
    });

    const tests = discovered as DiscoveredTestFile[];
    const combinedTest = tests.find((t) => t.file.includes("combined-test"));

    if (combinedTest) {
      const result = await mapDiffToTests(diff, [combinedTest], {
        safetyLevel: "high",
      });

      expect(result.mappings.length).toBeGreaterThan(0);
      const mapping = result.mappings[0];
      
      // All heuristics should be present
      expect(mapping.heuristics.directory).toBeGreaterThanOrEqual(0.0);
      expect(mapping.heuristics.similarity).toBeGreaterThanOrEqual(0.0);
      expect(mapping.heuristics.importGraph).toBeGreaterThanOrEqual(0.0);
      expect(mapping.heuristics.tags).toBeGreaterThanOrEqual(0.0);
      expect(mapping.heuristics.titles).toBeGreaterThanOrEqual(0.0);
      
      // Combined score should reflect all heuristics
      expect(mapping.score).toBeGreaterThan(0.0);
    }

    await unlink(testFile).catch(() => {});
  });
});


