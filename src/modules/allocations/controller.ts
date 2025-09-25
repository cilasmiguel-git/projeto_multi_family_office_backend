import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { upsertAllocationBody, appendRecordBody } from './schemas.js';

export function allocationsController(app: FastifyInstance) {
  return {
    listByVersion: async (req: any) => {
      const { versionId } = z.object({ versionId: z.string().uuid() }).parse(req.params);
      return app.prisma.allocation.findMany({
        where: { simulationVersionId: versionId },
        orderBy: { createdAt: 'asc' },
      });
    },

    create: async (req: any, reply: any) => {
      const body = upsertAllocationBody.parse(req.body);
      const created = await app.prisma.allocation.create({ data: body });
      return reply.code(201).send(created);
    },

    update: async (req: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = upsertAllocationBody.pick({ type: true, name: true }).partial().parse(req.body);
      return app.prisma.allocation.update({ where: { id }, data: body });
    },

    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await app.prisma.allocation.delete({ where: { id } });
      return reply.code(204).send();
    },

    listRecords: async (req: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      return app.prisma.allocationRecord.findMany({
        where: { allocationId: id },
        orderBy: { date: 'asc' },
      });
    },

    appendRecord: async (req: any, reply: any) => {
      const body = appendRecordBody.parse(req.body);
      const rec = await app.prisma.allocationRecord.create({ data: body });
      return reply.code(201).send(rec);
    },
  };
}
