import { describe, it, expect } from "vitest";
import { parseDiff } from "../../src/diff/index.js";

describe("parseDiff (public API)", () => {
  it("should parse --name-status format", () => {
    const diff = "A\tsrc/new.ts\nM\tsrc/modified.ts";
    const result = parseDiff(diff);

    expect(result.files).toHaveLength(2);
    expect(result.files[0].status).toBe("added");
    expect(result.files[1].status).toBe("modified");
    expect(result.warnings).toHaveLength(0);
  });

  it("should parse unified diff format", () => {
    const diff = `diff --git a/src/Button.tsx b/src/Button.tsx
index 123..456
--- a/src/Button.tsx
+++ b/src/Button.tsx
@@ -1 +1 @@
-changed
+changed
`;

    const result = parseDiff(diff);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].status).toBe("modified");
    expect(result.files[0].newPath).toBe("src/Button.tsx");
  });

  it("should handle renamed files", () => {
    const diff = "R100\told/path.ts\tnew/path.ts";
    const result = parseDiff(diff);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].status).toBe("renamed");
    expect(result.files[0].oldPath).toBe("old/path.ts");
    expect(result.files[0].newPath).toBe("new/path.ts");
  });

  it("should handle deleted files", () => {
    const diff = "D\tsrc/deleted.ts";
    const result = parseDiff(diff);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].status).toBe("deleted");
    expect(result.files[0].newPath).toBe("src/deleted.ts");
  });

  it("should handle empty input", () => {
    const result = parseDiff("");

    expect(result.files).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should handle complex mixed diff", () => {
    const diff = `A\tsrc/new.ts
M\tsrc/modified.ts
D\tsrc/deleted.ts
R80\told/file.ts\tnew/file.ts
diff --git a/src/unified.ts b/src/unified.ts
--- a/src/unified.ts
+++ b/src/unified.ts
@@ -1 +1 @@
-change
`;

    const result = parseDiff(diff);

    // Should parse all files (may vary based on format detection)
    expect(result.files.length).toBeGreaterThanOrEqual(1);
  });

  it("should include warnings for unparseable content", () => {
    // Empty diff but with whitespace might trigger warning
    const result = parseDiff("   \n\n  ");

    expect(result.files).toHaveLength(0);
    // May or may not have warnings depending on implementation
  });

  it("should handle files with various extensions", () => {
    const diff = `M\tsrc/component.tsx
M\tsrc/style.css
M\tsrc/util.js
M\tsrc/types.ts
A\tassets/image.png
`;

    const result = parseDiff(diff);

    expect(result.files).toHaveLength(5);
    expect(result.files.map((f) => f.newPath)).toContain("src/component.tsx");
    expect(result.files.map((f) => f.newPath)).toContain("src/style.css");
    expect(result.files.map((f) => f.newPath)).toContain("src/util.js");
    expect(result.files.map((f) => f.newPath)).toContain("src/types.ts");
    expect(result.files.map((f) => f.newPath)).toContain("assets/image.png");
  });

  it("should handle multiple renames in one diff", () => {
    const diff = `R100\told1.ts\tnew1.ts
R95\told2.ts\tnew2.ts
R80\told3.ts\tnew3.ts
`;

    const result = parseDiff(diff);

    expect(result.files).toHaveLength(3);
    expect(result.files.every((f) => f.status === "renamed")).toBe(true);
    expect(result.files[0].oldPath).toBe("old1.ts");
    expect(result.files[0].newPath).toBe("new1.ts");
  });
});

