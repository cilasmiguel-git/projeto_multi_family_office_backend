// schemas.ts
import { z } from 'zod';
import { InsuranceType } from '../../core/schemas/common.js';
export const upsertInsuranceBody = z.object({
  simulationVersionId: z.string().uuid(),
  type: InsuranceType,
  name: z.string().min(1),
  startDate: z.coerce.date(),
  durationMonths: z.number().int().positive(),
  monthlyPremium: z.coerce.number(),
  insuredAmount: z.coerce.number()
});
