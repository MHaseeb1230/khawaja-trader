import crypto from "crypto";

export function makeSalt() {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

export function passwordsMatch(password: string, salt: string, hash: string) {
  const next = hashPassword(password, salt);
  const left = Buffer.from(next);
  const right = Buffer.from(hash);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
