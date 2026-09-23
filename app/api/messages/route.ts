import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { validateBody } from '@/lib/validate';
import { encrypt } from '@/lib/crypto';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import { CreateMessageSchema } from '@/shared/dto/message.dto';
import { catchAsync } from '@/lib/catch-async';

export const POST = catchAsync(async (req: Request) => {
  const data = await validateBody(req, CreateMessageSchema);

  const decryptionKey = randomBytes(32).toString('hex');

  const cipherBuffer = encrypt(data.message, decryptionKey);
  const cipherBase64 = cipherBuffer.toString('base64');

  const ttlDate = new Date(data.ttl);

  await connectDB();
  const message = await Message.create({
    cipher: cipherBase64,
    maxView: data.maxView,
    ttl: ttlDate,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        ...message.toJSON(),
        key: decryptionKey,
      },
    },
    { status: 201 },
  );
});
