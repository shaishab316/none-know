import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { catchAsync } from '@/lib/catch-async';
import Message from '@/models/Message';

export const GET = catchAsync(
  async (
    _req: Request,
    { params }: { params: Promise<{ id: string; key: string }> },
  ) => {
    const { id, key } = await params;

    await connectDB();

    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 },
      );
    }

    if (
      (message.ttl && new Date() > new Date(message.ttl)) ||
      message.currentViewCount >= message.maxView
    ) {
      await Message.findByIdAndDelete(id);
      return NextResponse.json(
        { success: false, message: 'Message expired or view limit reached' },
        { status: 410 },
      );
    }

    let decryptedMessage: string;
    try {
      const cipherBuffer = Buffer.from(message.cipher, 'base64');
      const decryptedBuffer = decrypt(cipherBuffer, key);
      decryptedMessage = decryptedBuffer.toString('utf8');
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid decryption key' },
        { status: 400 },
      );
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $inc: { currentViewCount: 1 } },
      { new: true },
    );

    if (
      updatedMessage &&
      updatedMessage.currentViewCount >= updatedMessage.maxView
    ) {
      await Message.findByIdAndDelete(id);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: decryptedMessage,
          viewsRemaining: Math.max(
            0,
            message.maxView - (updatedMessage?.currentViewCount ?? 1),
          ),
          ttl: message.ttl,
        },
      },
      { status: 200 },
    );
  },
);
