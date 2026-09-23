import { z } from 'zod';

export const CreateMessageSchema = z.object({
  message: z.string().min(1),
  maxView: z.number().min(1).max(100).optional(),
  ttl: z.iso.datetime().optional(),
});
