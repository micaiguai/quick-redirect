/**
 * Fuzzy match a string against a string
 * @param str The string to match
 * @param pattern The pattern to match against
 * @returns Whether the string matches the pattern
 */
export function fuzzyMatch(str: string, pattern: string): boolean {
  const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  return regex.test(str)
}
