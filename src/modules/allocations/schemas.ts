import { z } from 'zod';
import { AllocationType } from '../../core/schemas/common.js';

export const upsertAllocationBody = z.object({
  simulationVersionId: z.string().uuid(),
  type: AllocationType,
  name: z.string().min(1)
});

export const appendRecordBody = z.object({
  allocationId: z.string().uuid(),
  date: z.coerce.date(),
  value: z.coerce.number()
});