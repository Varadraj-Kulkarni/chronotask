import { z } from 'zod';
import { COLOR_REGEX } from './common';

export const CreateCategorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, { message: 'Name cannot be blank or empty.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' }),
  color: z
    .string()
    .regex(COLOR_REGEX, { message: 'Color must be a valid 6-digit hex string (e.g. #2563EB).' })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
