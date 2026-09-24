import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc';
import { CreateMessageSchema } from '@/shared/dto/message.dto';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';

/**
 * Zero-knowledge message router.
 *
 * Clients encrypt in the browser and hand over cipher text only. The server
 * never sees the plaintext or the decryption key, so it can store and burn
 * messages without ever being able to read them.
 */
export const messageRouter = router({
  create: publicProcedure
    .input(CreateMessageSchema)
    .mutation(async ({ input }) => {
      await connectDB();

      const message = await Message.create({
        cipher: input.cipher,
        maxView: input.maxView,
        ttl: input.ttl ? new Date(input.ttl) : undefined,
      });

      return {
        _id: message._id.toString(),
        maxView: message.maxView,
        ttl: message.ttl,
      };
    }),

  getAndBurn: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;

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
        cipher: message.cipher,
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
