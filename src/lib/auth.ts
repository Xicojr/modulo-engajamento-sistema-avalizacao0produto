import bcrypt from 'bcryptjs';

export interface HashResult {
  salt: string;
  hash: string;
}

/**
 * Generates a bcrypt salt and hashes the plain text password.
 */
export async function hashPassword(password: string): Promise<HashResult> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
}

/**
 * Compares a plain text password with a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
