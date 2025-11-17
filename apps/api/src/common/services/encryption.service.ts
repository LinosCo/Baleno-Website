import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(private configService: ConfigService) {
    // Get encryption key from environment or generate a default one (not secure for production)
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'baleno-encryption-key-change-in-production-!!';

    if (!this.configService.get<string>('ENCRYPTION_KEY')) {
      console.warn('⚠️  ENCRYPTION_KEY not set. Using default key (NOT SECURE FOR PRODUCTION)');
    }

    // Hash the key to ensure it's exactly 32 bytes
    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
  }

  /**
   * Encrypt a string value
   */
  encrypt(text: string): string {
    if (!text) return text;

    try {
      // Generate a random IV (Initialization Vector)
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV + encrypted data (separated by :)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string value
   */
  decrypt(text: string): string {
    if (!text) return '';

    try {
      // Split IV and encrypted data
      const parts = text.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      // Decrypt the text
      let decrypted: string = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash a value (one-way, for passwords)
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Compare a plain text with a hash
   */
  compareHash(text: string, hash: string): boolean {
    return this.hash(text) === hash;
  }

  /**
   * Generate a random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
