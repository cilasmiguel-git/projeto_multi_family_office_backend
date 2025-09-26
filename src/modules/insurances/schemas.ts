// schemas.ts
import { z } from 'zod';
import { InsuranceType } from '../../core/schemas/common.js';
export const upsertInsuranceBody = z.object({
  name: z.string().min(1),
  type: InsuranceType.optional().default('LIFE'),
  startDate: z.coerce.date(),
  durationMonths: z.coerce.number().int().nonnegative(),
  monthlyPremium: z.coerce.number().nonnegative(),
  insuredAmount: z.coerce.number().nonnegative(),
  simulationVersionId: z.string().uuid().optional(),
});
