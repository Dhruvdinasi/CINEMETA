/**
 * Signal Normalization & Mathematical Transformation Utilities
 * Ensures raw scores from distinct sub-models (content, genre, collaborative, Bayesian quality)
 * are mapped to a calibrated, comparable [0, 1] probability/affinity space before weighted aggregation.
 */

/**
 * Min-Max normalization over an array of numeric scores with epsilon protection
 */
export function minMaxNormalize(scores: number[], defaultVal: number = 0.5): number[] {
  if (scores.length === 0) return [];
  if (scores.length === 1) return [defaultVal];

  let min = Infinity;
  let max = -Infinity;

  for (const s of scores) {
    if (!isNaN(s)) {
      if (s < min) min = s;
      if (s > max) max = s;
    }
  }

  const range = max - min;
  if (range < 1e-6) {
    // Zero variance: all scores are essentially identical
    return scores.map(() => defaultVal);
  }

  return scores.map(s => {
    if (isNaN(s)) return defaultVal;
    return Math.max(0, Math.min(1, (s - min) / range));
  });
}

/**
 * Sigmoid transformation mapping arbitrary real numbers to (0, 1)
 */
export function sigmoid(x: number, k: number = 1.0, x0: number = 0.0): number {
  return 1 / (1 + Math.exp(-k * (x - x0)));
}

/**
 * Z-score normalization with fallback
 */
export function zScoreNormalize(scores: number[]): number[] {
  if (scores.length <= 1) return scores.map(() => 0.5);

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const std = Math.sqrt(variance);

  if (std < 1e-6) {
    return scores.map(() => 0.5);
  }

  return scores.map(s => sigmoid((s - mean) / std));
}

/**
 * Bayesian Average Rating with Popularity Dampening
 * WR = (v / (v + m)) * R + (m / (v + m)) * C
 * where:
 *   R = average rating of the movie
 *   v = number of votes for the movie
 *   m = minimum votes required to be listed (smoothing parameter, e.g. 500)
 *   C = the mean vote across the whole catalog (e.g. 7.5)
 */
export function computeBayesianScore(
  voteAverage: number,
  voteCount: number,
  catalogMeanRating: number = 7.5,
  minVotesThreshold: number = 400
): number {
  const v = Math.max(0, voteCount || 0);
  const R = Math.max(1, Math.min(10, voteAverage || 7.0));
  const m = minVotesThreshold;
  const C = catalogMeanRating;

  // Bayesian weighted rating on 1..10 scale
  const bayesianRating = (v / (v + m)) * R + (m / (v + m)) * C;

  // Normalize to 0..1 scale
  return Math.max(0, Math.min(1, (bayesianRating - 1) / 9));
}

/**
 * Dampened Popularity Score using Logarithmic Compression
 * Avoids mega-blockbusters from dominating purely through raw vote counts
 */
export function computeDampenedPopularity(
  voteCount: number,
  maxExpectedVotes: number = 40000
): number {
  const v = Math.max(0, voteCount || 0);
  const logV = Math.log10(1 + v);
  const logMax = Math.log10(1 + maxExpectedVotes);
  return Math.max(0, Math.min(1, logV / logMax));
}
