import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { router, publicProcedure } from '@/server/trpc';
import { CreateMessageSchema } from '@/shared/dto/message.dto';
import { connectDB } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';
import Message from '@/models/Message';

export const messageRouter = router({
  create: publicProcedure
    .input(CreateMessageSchema)
    .mutation(async ({ input }) => {
      const decryptionKey = randomBytes(32).toString('hex');
      const cipherBuffer = encrypt(input.message, decryptionKey);
      const cipherBase64 = cipherBuffer.toString('base64');

      await connectDB();

      const message = await Message.create({
        cipher: cipherBase64,
        maxView: input.maxView,
        ttl: input.ttl ? new Date(input.ttl) : undefined,
      });

      return {
        _id: message._id.toString(),
        key: decryptionKey,
        maxView: message.maxView,
        ttl: message.ttl,
      };
    }),

  getAndBurn: publicProcedure
    .input(
      z.object({
        id: z.string(),
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id, key } = input;

      await connectDB();
      const message = await Message.findById(id);

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found',
        });
      }

      if (
        (message.ttl && new Date() > new Date(message.ttl)) ||
        (message.maxView && message.currentViewCount >= message.maxView)
      ) {
        await Message.findByIdAndDelete(id);
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Message expired or view limit reached',
        });
      }

      let decryptedMessage: string;
      try {
        const cipherBuffer = Buffer.from(message.cipher, 'base64');
        const decryptedBuffer = decrypt(cipherBuffer, key);
        decryptedMessage = decryptedBuffer.toString('utf8');
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid decryption key',
        });
      }

      const updatedMessage = await Message.findByIdAndUpdate(
        id,
        { $inc: { currentViewCount: 1 } },
        { returnDocument: 'after' },
      );

      if (
        updatedMessage?.maxView &&
        updatedMessage.currentViewCount >= updatedMessage.maxView
      ) {
        await Message.findByIdAndDelete(id);
      }

      return {
        message: decryptedMessage,
        viewsRemaining: message.maxView
          ? Math.max(
              0,
              message.maxView - (updatedMessage?.currentViewCount ?? 1),
            )
          : null,
        ttl: message.ttl,
      };
    }),
});
