import * as CryptoJS from 'crypto-js';

// dynamicInfo = first 10 chars of a generated UUID v4 (matches the original login helper).
export function generateDynamicInfo(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).slice(0, 10);
}

// Pad or truncate the key to exactly 32 bytes (AES-256), padding with '0' — byte-identical
// to the original login.component padOrTruncateKey.
function padOrTruncateKey(key: string): string {
  const maxLength = 32;
  if (key.length > maxLength) {
    return key.slice(0, maxLength);
  }
  return key.padEnd(maxLength, '0');
}

export function encryptPassword(password: string, dynamicInfo: string): string {
  const commonKey = 'ahjsdfhjbqer56243';
  const finalKey = padOrTruncateKey(commonKey + dynamicInfo);
  return CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(finalKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}
