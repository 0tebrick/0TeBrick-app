export function generatePotentialSetNumbers(setNumber) {
  const cleanSet = String(setNumber).trim();
  return cleanSet.includes('-')
    ? [cleanSet]
    : Array.from({ length: 5 }, (_, i) => `${cleanSet}-${i + 1}`);
}
