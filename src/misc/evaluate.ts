import type { z } from 'zod';

export const zodEvaluate = (expression: z.ZodTypeAny, value: unknown) => expression.safeParse(value).success;
