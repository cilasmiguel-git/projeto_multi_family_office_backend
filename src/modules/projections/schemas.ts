import { z } from 'zod';
import { LifeStatus } from '../../core/schemas/common.js';

export const projectionBody = z.object({
  simulationId: z.string().uuid(),
  lifeStatus: LifeStatus.default('ALIVE'),
  baseRateReal: z.number().optional()
});
