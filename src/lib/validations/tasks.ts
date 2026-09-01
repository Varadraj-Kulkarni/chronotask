import { z } from 'zod';
import { DATE_REGEX, TIME_REGEX, PriorityLevelEnum, RecurrenceFrequencyEnum } from './common';

export const RecurrenceConfigSchema = z.object({
  frequency: RecurrenceFrequencyEnum,
  interval: z.number().int().min(1).default(1),
  byWeekdays: z.array(z.number().int().min(1).max(7)).nullable().optional(),
  untilDate: z.string().regex(DATE_REGEX, { message: "untilDate must be in YYYY-MM-DD format" }).nullable().optional(),
});

export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, { message: 'Title cannot be blank or empty.' })
    .max(200, { message: 'Title cannot exceed 200 characters.' }),
  description: z.string().max(2000, { message: 'Description cannot exceed 2000 characters.' }).nullable().optional(),
  date: z
    .string({ required_error: 'Date is required' })
    .regex(DATE_REGEX, { message: "Date must conform to YYYY-MM-DD format." }),
  dueTime: z.string().regex(TIME_REGEX, { message: "dueTime must conform to HH:MM format." }).nullable().optional(),
  priority: PriorityLevelEnum.default('MEDIUM').optional(),
  categoryId: z.string().nullable().optional(),
  recurrenceConfig: RecurrenceConfigSchema.nullable().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title cannot be blank or empty.' }).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  date: z.string().regex(DATE_REGEX, { message: "Date must conform to YYYY-MM-DD format." }).optional(),
  dueTime: z.string().regex(TIME_REGEX, { message: "dueTime must conform to HH:MM format." }).nullable().optional(),
  priority: PriorityLevelEnum.optional(),
  categoryId: z.string().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
