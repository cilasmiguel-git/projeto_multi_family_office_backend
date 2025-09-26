// src/modules/allocations/service.ts
import type { FastifyInstance } from 'fastify';

export type AddAllocationRecordInput = {
  allocationId: string;
  date: Date;
  value: number;
};

// Regra pedida: NUNCA sobrescrever; sempre criar novo registro
export async function addAllocationRecord(app: FastifyInstance, input: AddAllocationRecordInput) {
  return app.prisma.allocationRecord.create({
    data: {
      allocationId: input.allocationId,
      date: input.date,
      value: input.value,
    },
  });
}

export async function getAllocationHistory(app: FastifyInstance, allocationId: string) {
  return app.prisma.allocationRecord.findMany({
    where: { allocationId },
    orderBy: { date: 'asc' },
  });
}
