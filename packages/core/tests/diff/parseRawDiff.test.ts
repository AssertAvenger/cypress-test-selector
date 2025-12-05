import { describe, it, expect } from "vitest";
import { parseRawDiff } from "../../src/diff/parseRawDiff.js";

describe("parseRawDiff", () => {
  describe("--name-only format", () => {
    it("should parse simple file list", () => {
      const diff = "src/components/Button.tsx\nsrc/utils/helpers.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        statusCode: "M",
        newPath: "src/components/Button.tsx",
      });
      expect(result[1]).toEqual({
        statusCode: "M",
        newPath: "src/utils/helpers.ts",
      });
    });

    it("should handle empty input", () => {
      const result = parseRawDiff("");
      expect(result).toHaveLength(0);
    });

    it("should ignore comments and empty lines", () => {
      const diff = "# comment\n\nsrc/file.ts\n  \n";
      const result = parseRawDiff(diff);
      expect(result).toHaveLength(1);
      expect(result[0].newPath).toBe("src/file.ts");
    });
  });

  describe("--name-status format", () => {
    it("should parse added files", () => {
      const diff = "A\tsrc/components/NewComponent.tsx";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "A",
        newPath: "src/components/NewComponent.tsx",
      });
    });

    it("should parse modified files", () => {
      const diff = "M\tsrc/components/Button.tsx";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "M",
        newPath: "src/components/Button.tsx",
      });
    });

    it("should parse deleted files", () => {
      const diff = "D\tsrc/components/OldComponent.tsx";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "D",
        oldPath: "src/components/OldComponent.tsx",
        newPath: "src/components/OldComponent.tsx",
      });
    });

    it("should parse renamed files with similarity", () => {
      const diff = "R100\told/path.ts\tnew/path.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "R",
        oldPath: "old/path.ts",
        newPath: "new/path.ts",
        similarity: 100,
      });
    });

    it("should parse renamed files with partial similarity", () => {
      const diff = "R80\told/file.ts\tnew/file.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "R",
        oldPath: "old/file.ts",
        newPath: "new/file.ts",
        similarity: 80,
      });
    });

    it("should parse copied files", () => {
      const diff = "C100\tsrc/original.ts\tsrc/copy.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "C",
        oldPath: "src/original.ts",
        newPath: "src/copy.ts",
        similarity: 100,
      });
    });

    it("should parse multiple files", () => {
      const diff = "A\tsrc/new.ts\nM\tsrc/modified.ts\nD\tsrc/deleted.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(3);
      expect(result[0].statusCode).toBe("A");
      expect(result[1].statusCode).toBe("M");
      expect(result[2].statusCode).toBe("D");
    });

    it("should handle type changes", () => {
      const diff = "T\tsrc/file.ts";
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0].statusCode).toBe("M");
    });
  });

  describe("unified diff format", () => {
    it("should parse simple modified file", () => {
      const diff = `diff --git a/src/Button.tsx b/src/Button.tsx
index 1234567..abcdefg 100644
--- a/src/Button.tsx
+++ b/src/Button.tsx
@@ -1,3 +1,3 @@
-const old = "value";
+const new = "value";
 `;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "M",
        newPath: "src/Button.tsx",
      });
    });

    it("should parse added file", () => {
      const diff = `diff --git a/src/NewFile.tsx b/src/NewFile.tsx
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/NewFile.tsx
@@ -0,0 +1,5 @@
+export const NewFile = () => null;
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "A",
        newPath: "src/NewFile.tsx",
      });
    });

    it("should parse deleted file", () => {
      const diff = `diff --git a/src/OldFile.tsx b/src/OldFile.tsx
deleted file mode 100644
index 1234567..0000000
--- a/src/OldFile.tsx
+++ /dev/null
@@ -1,5 +0,0 @@
-export const OldFile = () => null;
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "D",
        oldPath: "src/OldFile.tsx",
        newPath: "src/OldFile.tsx",
      });
    });

    it("should parse renamed file", () => {
      const diff = `diff --git a/src/OldName.tsx b/src/NewName.tsx
similarity index 95%
rename from src/OldName.tsx
rename to src/NewName.tsx
index 1234567..abcdefg 100644
--- a/src/OldName.tsx
+++ b/src/NewName.tsx
@@ -1,3 +1,3 @@
-const old = "value";
+const new = "value";
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        statusCode: "R",
        oldPath: "src/OldName.tsx",
        newPath: "src/NewName.tsx",
      });
    });

    it("should parse multiple files in one diff", () => {
      const diff = `diff --git a/src/File1.ts b/src/File1.ts
index 123..456
--- a/src/File1.ts
+++ b/src/File1.ts
@@ -1 +1 @@
-changed
+changed

diff --git a/src/File2.ts b/src/File2.ts
new file mode 100644
--- /dev/null
+++ b/src/File2.ts
@@ -0,0 +1 @@
+new
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(2);
      expect(result[0].statusCode).toBe("M");
      expect(result[0].newPath).toBe("src/File1.ts");
      expect(result[1].statusCode).toBe("A");
      expect(result[1].newPath).toBe("src/File2.ts");
    });

    it("should handle files without a/ or b/ prefixes", () => {
      const diff = `diff --git src/File.ts src/File.ts
--- src/File.ts
+++ src/File.ts
@@ -1 +1 @@
-change
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0].statusCode).toBe("M");
      expect(result[0].newPath).toBe("src/File.ts");
    });

    it("should handle binary files", () => {
      const diff = `diff --git a/image.png b/image.png
index 123..456
Binary files a/image.png and b/image.png differ
`;

      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0].statusCode).toBe("M");
      expect(result[0].newPath).toBe("image.png");
    });
  });

  describe("edge cases", () => {
    it("should handle mixed formats gracefully", () => {
      // This shouldn't happen in practice, but test robustness
      const diff = "M\tfile1.ts\ndiff --git a/file2.ts b/file2.ts\n--- a/file2.ts";
      const result = parseRawDiff(diff);
      // Should parse what it can
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle files with spaces in names", () => {
      const diff = 'R100\told file.ts\tnew file.ts';
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0].oldPath).toBe("old file.ts");
      expect(result[0].newPath).toBe("new file.ts");
    });

    it("should handle very long paths", () => {
      const longPath = "a/".repeat(100) + "file.ts";
      const diff = `M\t${longPath}`;
      const result = parseRawDiff(diff);

      expect(result).toHaveLength(1);
      expect(result[0].newPath).toBe(longPath);
    });
  });
});

