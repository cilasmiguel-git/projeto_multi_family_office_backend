import { z } from 'zod';

export const createClientBody = z.object({
  name: z.string().min(1),
  document: z.string().min(3).optional().nullable().transform(v => v ?? null),
});

export const updateClientBody = z.object({
  name: z.string().min(1).optional(),
  document: z.string().min(3).nullable().optional().transform(v => v ?? null),
});

export const listClientsQuery = z.object({
  q: z.string().optional(),                         // busca por nome
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),            // paginação simples por id
});
