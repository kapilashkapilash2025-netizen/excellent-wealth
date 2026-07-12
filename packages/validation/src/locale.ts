import { z } from 'zod';

function isValidIanaTimeZone(candidate: string): boolean {
  try {
    // Throws a RangeError for any string that isn't a recognised IANA zone.
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return true;
  } catch {
    return false;
  }
}

export const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine(isValidIanaTimeZone, { message: 'Enter a valid IANA time zone, e.g. "Asia/Colombo"' });

export const displayNameSchema = z.string().trim().min(1).max(120);

export type Timezone = z.infer<typeof timezoneSchema>;
