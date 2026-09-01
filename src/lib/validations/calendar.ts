import { z } from 'zod';

export const MonthQuerySchema = z.object({
  year: z.coerce
    .number({ invalid_type_error: 'Year must be a number' })
    .int()
    .min(2000, { message: 'Year must be between 2000 and 2100' })
    .max(2100, { message: 'Year must be between 2000 and 2100' }),
  month: z.coerce
    .number({ invalid_type_error: 'Month must be a number' })
    .int()
    .min(1, { message: 'Month must be between 1 and 12' })
    .max(12, { message: 'Month must be between 1 and 12' }),
});

export type MonthQueryInput = z.infer<typeof MonthQuerySchema>;
