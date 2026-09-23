import z from 'zod';

export const CreateMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  maxView: z.number().int().min(1).default(1),
  ttl: z.iso.datetime('Invalid ISO date string'),
});
