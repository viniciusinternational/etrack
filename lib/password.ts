import { randomBytes, createHash } from "crypto";

/**
 * Generate a secure random password
 * @param length - Length of the password (default: 12)
 * @returns A random password string
 */
export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const bytes = randomBytes(length);
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Hash a password using SHA-256
 * Note: In production, use bcrypt or argon2 for better security
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

