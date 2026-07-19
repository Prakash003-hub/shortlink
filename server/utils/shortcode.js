// Unambiguous alphabet: no 0/O, 1/I/l to keep codes easy to read and type.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function randomCode(length) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Generates a short code (5-6 chars) that doesn't collide with existingCodes.
 * @param {Set<string>|string[]} existingCodes
 */
export function generateShortCode(existingCodes) {
  const used = existingCodes instanceof Set ? existingCodes : new Set(existingCodes);
  let attempts = 0;
  while (attempts < 50) {
    const length = attempts < 25 ? 5 : 6; // fall back to 6 chars if 5 keeps colliding
    const code = randomCode(length);
    if (!used.has(code)) return code;
    attempts++;
  }
  // Extremely unlikely fallback
  return randomCode(8);
}

export function isValidCustomCode(code) {
  return /^[A-Za-z0-9]{4,12}$/.test(code || "");
}
