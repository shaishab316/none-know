import { router } from '../trpc';
import { messageRouter } from './message';

export const appRouter = router({
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
