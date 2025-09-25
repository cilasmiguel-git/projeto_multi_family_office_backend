import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { upsertInsuranceBody } from './schemas.js';

export function insurancesController(app: FastifyInstance) {
  return {
    listByVersion: async (req: any) => {
      const { versionId } = z.object({ versionId: z.string().uuid() }).parse(req.params);
      return app.prisma.insurancePolicy.findMany({
        where: { simulationVersionId: versionId },
        orderBy: { createdAt: 'asc' },
      });
    },
    create: async (req: any, reply: any) => {
      const body = upsertInsuranceBody.parse(req.body);
      const created = await app.prisma.insurancePolicy.create({ data: body });
      return reply.code(201).send(created);
    },
    update: async (req: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = upsertInsuranceBody.partial().parse(req.body);
      return app.prisma.insurancePolicy.update({ where: { id }, data: body });
    },
    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await app.prisma.insurancePolicy.delete({ where: { id } });
      return reply.code(204).send();
    },
  };
}
