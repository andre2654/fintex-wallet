/**
 * Calculate the percentage of part relative to whole.
 * @param {number} part - The part value
 * @param {number} whole - The whole value
 * @returns {number} The percentage rounded to 2 decimal places
 */
export function percentOf(part, whole) {
  return Math.round((part / whole) * 100 * 100) / 100;
}
