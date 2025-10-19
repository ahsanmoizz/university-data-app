// src/utils/permutationUtil.js

/**
 * Generate all possible k-sized permutations from a given array.
 * @param {Array} arr - source array
 * @param {number} k - permutation length
 * @returns {Array[]} array of permutations
 */
export function getPermutations(arr, k) {
  if (!Array.isArray(arr)) return [];
  const results = [];

  function permute(prefix, remaining) {
    if (prefix.length === k) {
      results.push([...prefix]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      const newPrefix = [...prefix, remaining[i]];
      const newRemaining = remaining.filter((_, idx) => idx !== i);
      permute(newPrefix, newRemaining);
    }
  }

  permute([], arr);
  return results;
}
