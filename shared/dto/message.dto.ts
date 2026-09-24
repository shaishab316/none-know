import { z } from 'zod';

/**
 * The client encrypts before calling this endpoint, so the server only ever
 * sees `cipher`. It never receives the plaintext or the decryption key.
 */
export const CreateMessageSchema = z.object({
  cipher: z.string().min(1).max(1_000_000),
  maxView: z.number().min(1).max(100).optional(),
  ttl: z.iso.datetime().optional(),
  captchaToken: z.string()
});
