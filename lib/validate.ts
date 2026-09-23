import { z } from 'zod';

export async function validateBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  const body = await req.json();
  return schema.parse(body);
}
