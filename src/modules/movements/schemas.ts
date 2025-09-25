// schemas.ts
import { z } from 'zod';
import { MovementType, Frequency } from '../../core/schemas/common.js';
export const upsertMovementBody = z.object({
  simulationVersionId: z.string().uuid(),
  type: MovementType,
  amount: z.coerce.number(),
  frequency: Frequency,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional()
});
