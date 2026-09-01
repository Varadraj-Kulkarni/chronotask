import { z } from 'zod';

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEX = /^\d{2}:\d{2}$/;
export const COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const PriorityLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type PriorityLevel = z.infer<typeof PriorityLevelEnum>;

export const PeriodEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
export type Period = z.infer<typeof PeriodEnum>;

export const RecurrenceFrequencyEnum = z.enum(['DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY']);
export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequencyEnum>;

export const EditScopeEnum = z.enum(['single', 'future', 'all']);
export type EditScope = z.infer<typeof EditScopeEnum>;
