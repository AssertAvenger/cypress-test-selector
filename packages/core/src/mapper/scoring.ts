/**
 * Combine multiple heuristic scores using multiplicative scoring
 * Formula: combined = 1 - (1 - h1) * (1 - h2) * (1 - h3)
 * This ensures that if any heuristic has a high score, the combined score is high
 *
 * @param scores - Array of heuristic scores (0.0 to 1.0)
 * @param weights - Optional weights for each score (default: all 1.0)
 * @returns Combined score (0.0 to 1.0)
 */
export function combineScores(
  scores: number[],
  weights: number[] = []
): number {
  if (scores.length === 0) {
    return 0.0;
  }

  // Apply weights if provided
  const weightedScores =
    weights.length === scores.length
      ? scores.map((score, i) => score * (weights[i] || 1.0))
      : scores;

  // Clamp scores to [0, 1]
  const clampedScores = weightedScores.map((score) =>
    Math.max(0.0, Math.min(1.0, score))
  );

  // Multiplicative combination: 1 - product of (1 - score)
  // This means if any score is 1.0, result is 1.0
  // If all scores are low, result is low
  const product = clampedScores.reduce(
    (acc, score) => acc * (1 - score),
    1.0
  );

  return 1 - product;
}

/**
 * Normalize a score to 0.0-1.0 range
 * @param score - Score to normalize
 * @returns Normalized score
 */
export function normalizeScore(score: number): number {
  return Math.max(0.0, Math.min(1.0, score));
}

