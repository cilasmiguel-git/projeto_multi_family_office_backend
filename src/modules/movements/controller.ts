import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { upsertMovementBody } from './schemas.js';

export function movementsController(app: FastifyInstance) {
  return {
    listByVersion: async (req: any) => {
      const { versionId } = z.object({ versionId: z.string().uuid() }).parse(req.params);
      return app.prisma.movement.findMany({
        where: { simulationVersionId: versionId },
        orderBy: { createdAt: 'asc' },
      });
    },
    list: async () => {
      return app.prisma.movement.findMany({ orderBy: { createdAt: 'asc' } });
    },
    create: async (req: any, reply: any) => {
      const body = upsertMovementBody.parse(req.body);
      const created = await app.prisma.movement.create({ data: body });
      return reply.code(201).send(created);
    },
    update: async (req: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = upsertMovementBody.partial().parse(req.body);
      return app.prisma.movement.update({ where: { id }, data: body });
    },
    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await app.prisma.movement.delete({ where: { id } });
      return reply.code(204).send();
    },
  };
}
