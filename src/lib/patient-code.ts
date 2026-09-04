export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomCode(): number {
  return randomInt(1000, 9999);
}

const PREFIXES = ["MX", "PH", "KT", "DX", "PC"] as const;

export function randomPrefix(): string {
  return PREFIXES[randomInt(0, PREFIXES.length - 1)];
}

/**
 * Generates a human-readable, memorable patient code in the form "XX-1234".
 * The prefix is a short memorable token, the numeric part is random (not
 * sequential/predictable). Never contains patient identity information.
 */
export function generatePatientCode(): string {
  const prefix = randomPrefix();
  const number = randomCode();
  return `${prefix}-${number}`;
}

/**
 * Normalizes user input for patient code matching. For example "mx-6660"
 * becomes "MX-6660".
 */
export function normalizePatientCode(input: string): string {
  const trimmed = input.trim().toUpperCase();
  return trimmed;
}

export function isValidPatientCodeFormat(code: string): boolean {
  return /^[A-Z]{2}-\d{4}$/.test(code.trim().toUpperCase());
}
