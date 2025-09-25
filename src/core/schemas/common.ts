import { z } from 'zod';

export const LifeStatus = z.enum(['ALIVE', 'DEAD', 'INVALID']);
export const MovementType = z.enum(['INCOME', 'EXPENSE']);
export const Frequency = z.enum(['ONE_TIME', 'MONTHLY', 'ANNUAL']);
export const AllocationType = z.enum(['FINANCIAL', 'REAL_ESTATE']);
export const InsuranceType = z.enum(['LIFE', 'DISABILITY']);
