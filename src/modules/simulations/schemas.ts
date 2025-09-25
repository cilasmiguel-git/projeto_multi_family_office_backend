import { z } from 'zod';
import { LifeStatus } from '../../core/schemas/common.js';

export const listSimulationsQuery = z.object({
  clientId: z.string().uuid()
});

export const createSimulationBody = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1),
  baseRateReal: z.number().default(0.04)
});

export const updateSimulationBody = z.object({
  name: z.string().min(1).optional(),
  baseRateReal: z.number().optional()
});

export const createVersionBody = z.object({
  fromVersionId: z.string().uuid().optional()
});

export const projectionBody = z.object({
  simulationId: z.string().uuid(),
  lifeStatus: LifeStatus.default('ALIVE'),
  baseRateReal: z.number().optional()
});
