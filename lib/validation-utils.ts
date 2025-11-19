/**
 * Additional validation utilities
 */

/**
 * Validate Italian fiscal code (codice fiscale)
 * @param cf Fiscal code
 * @returns True if valid
 */
export function isValidCodiceFiscale(cf: string): boolean {
  const regex =
    /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return regex.test(cf);
}

/**
 * Validate Italian VAT number (partita IVA)
 * @param piva VAT number
 * @returns True if valid
 */
export function isValidPartitaIVA(piva: string): boolean {
  // Remove spaces and check length
  const cleaned = piva.replace(/\s/g, "");
  if (cleaned.length !== 11 || !/^\d+$/.test(cleaned)) {
    return false;
  }

  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Sanitize user input to prevent XSS
 * @param input User input
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate file extension
 * @param filename File name
 * @param allowedExtensions Array of allowed extensions
 * @returns True if valid
 */
export function hasValidExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}
