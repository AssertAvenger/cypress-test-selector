import { describe, it, expect } from "vitest";
import { DEFAULT_WEIGHTS } from "../../src/mapper/types.js";

describe("DEFAULT_WEIGHTS", () => {
  it("should export default weights object", () => {
    expect(DEFAULT_WEIGHTS).toBeDefined();
    expect(typeof DEFAULT_WEIGHTS).toBe("object");
  });

  it("should have all required weight properties", () => {
    expect(DEFAULT_WEIGHTS).toHaveProperty("directoryWeight");
    expect(DEFAULT_WEIGHTS).toHaveProperty("similarityWeight");
    expect(DEFAULT_WEIGHTS).toHaveProperty("importGraphWeight");
    expect(DEFAULT_WEIGHTS).toHaveProperty("tagWeight");
    expect(DEFAULT_WEIGHTS).toHaveProperty("titleWeight");
  });

  it("should have correct default values", () => {
    expect(DEFAULT_WEIGHTS.directoryWeight).toBe(1.0);
    expect(DEFAULT_WEIGHTS.similarityWeight).toBe(1.0);
    expect(DEFAULT_WEIGHTS.importGraphWeight).toBe(1.0);
    expect(DEFAULT_WEIGHTS.tagWeight).toBe(0.5);
    expect(DEFAULT_WEIGHTS.titleWeight).toBe(0.4);
  });

  it("should have all weights as numbers", () => {
    expect(typeof DEFAULT_WEIGHTS.directoryWeight).toBe("number");
    expect(typeof DEFAULT_WEIGHTS.similarityWeight).toBe("number");
    expect(typeof DEFAULT_WEIGHTS.importGraphWeight).toBe("number");
    expect(typeof DEFAULT_WEIGHTS.tagWeight).toBe("number");
    expect(typeof DEFAULT_WEIGHTS.titleWeight).toBe("number");
  });

  it("should be exported from mapper index", async () => {
    const { DEFAULT_WEIGHTS: exportedWeights } = await import(
      "../../src/mapper/index.js"
    );
    expect(exportedWeights).toBeDefined();
    expect(exportedWeights).toEqual(DEFAULT_WEIGHTS);
  });
});


