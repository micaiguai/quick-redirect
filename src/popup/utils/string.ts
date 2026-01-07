export function isTextEmpty(text: string | undefined | number | null) {
  return text === undefined || text === null || text === ''
}
