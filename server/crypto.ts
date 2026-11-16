import { randomBytes, scrypt as derive, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  return 'scrypt$' + salt + '$' + hash.toString('hex');
}
export async function verifyPassword(password: string, encoded: string) {
  const [kind, salt, hex] = encoded.split('$');
  if (kind !== 'scrypt' || !salt || !hex || hex.length !== 128) return false;
  const expected = Buffer.from(hex, 'hex');
  // Hash armazenado corrompido (hex inválido) nega o acesso em vez de lançar RangeError e responder 500.
  if (expected.length !== 64) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, expected);
}
export const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');

