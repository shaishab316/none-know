import { NextResponse } from 'next/server';
import { z } from 'zod';

type AsyncRouteHandler<T = unknown> = (
  req: Request,
  context: T,
) => Promise<NextResponse>;

export function catchAsync<T = unknown>(handler: AsyncRouteHandler<T>) {
  return async (req: Request, context: T): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation Failed',
            errors: z.treeifyError(error),
          },
          { status: 400 },
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { success: false, message: 'Invalid JSON payload' },
          { status: 400 },
        );
      }

      console.error('[Unhandled Route Error]:', error);
      return NextResponse.json(
        { success: false, message: 'Internal Server Error' },
        { status: 500 },
      );
    }
  };
}
