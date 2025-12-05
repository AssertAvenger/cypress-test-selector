import { describe, it, expect } from "vitest";
import { normalizeDiff } from "../../src/diff/normalizeDiff.js";
import type { RawDiffEntry } from "../../src/diff/types.js";

describe("normalizeDiff", () => {
  it("should normalize added files", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "A", newPath: "src/new.ts" },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      newPath: "src/new.ts",
      status: "added",
    });
  });

  it("should normalize modified files", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "M", newPath: "src/modified.ts" },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      newPath: "src/modified.ts",
      status: "modified",
    });
  });

  it("should normalize deleted files", () => {
    const entries: RawDiffEntry[] = [
      {
        statusCode: "D",
        oldPath: "src/deleted.ts",
        newPath: "src/deleted.ts",
      },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      oldPath: "src/deleted.ts",
      newPath: "src/deleted.ts",
      status: "deleted",
    });
  });

  it("should normalize renamed files", () => {
    const entries: RawDiffEntry[] = [
      {
        statusCode: "R",
        oldPath: "src/old.ts",
        newPath: "src/new.ts",
        similarity: 95,
      },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      oldPath: "src/old.ts",
      newPath: "src/new.ts",
      status: "renamed",
    });
  });

  it("should normalize copied files as added", () => {
    const entries: RawDiffEntry[] = [
      {
        statusCode: "C",
        oldPath: "src/original.ts",
        newPath: "src/copy.ts",
        similarity: 100,
      },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      oldPath: "src/original.ts",
      newPath: "src/copy.ts",
      status: "added",
    });
  });

  it("should handle type changes as modified", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "T", newPath: "src/file.ts" },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("modified");
  });

  it("should deduplicate entries", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "M", newPath: "src/file.ts" },
      { statusCode: "M", newPath: "src/file.ts" },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
  });

  it("should handle multiple files", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "A", newPath: "src/new.ts" },
      { statusCode: "M", newPath: "src/modified.ts" },
      { statusCode: "D", oldPath: "src/deleted.ts", newPath: "src/deleted.ts" },
      {
        statusCode: "R",
        oldPath: "src/old.ts",
        newPath: "src/new.ts",
      },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(4);
    expect(result[0].status).toBe("added");
    expect(result[1].status).toBe("modified");
    expect(result[2].status).toBe("deleted");
    expect(result[3].status).toBe("renamed");
  });

  it("should skip entries without paths", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "M", newPath: "" },
      { statusCode: "A" },
      { statusCode: "M", newPath: "src/valid.ts" },
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0].newPath).toBe("src/valid.ts");
  });

  it("should handle unknown status codes as modified", () => {
    const entries: RawDiffEntry[] = [
      { statusCode: "X", newPath: "src/file.ts" } as RawDiffEntry,
    ];

    const result = normalizeDiff(entries);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("modified");
  });
});

