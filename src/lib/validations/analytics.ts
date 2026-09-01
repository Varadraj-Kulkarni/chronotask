import { z } from 'zod';
import { DATE_REGEX, PeriodEnum } from './common';

export const AnalyticsQuerySchema = z.object({
  period: PeriodEnum,
  date: z.string().regex(DATE_REGEX, { message: "Query parameter 'date' must conform to YYYY-MM-DD format." }),
});

export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
