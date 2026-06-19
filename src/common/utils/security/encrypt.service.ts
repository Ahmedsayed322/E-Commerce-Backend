import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export async function encrypt(text: string) {
  const password = process.env.ENCRYPT_PASSWORD as string;
  const iv = randomBytes(16);
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

  const cipher = createCipheriv('aes-256-ctr', key, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function decrypt(data: string) {
  const password = process.env.ENCRYPT_PASSWORD as string;
  const [ivHex, encryptedHex] = data.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

  const decipher = createDecipheriv('aes-256-ctr', key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString();
}
