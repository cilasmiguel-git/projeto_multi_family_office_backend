// src/modules/insurances/controller.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { upsertInsuranceBody } from './schemas.js';
import type { Prisma } from '@prisma/client';

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

      const { simulationVersionId, ...rest } = body;

      // Se vier o FK direto, usa o UncheckedCreateInput
      let data: Prisma.InsurancePolicyUncheckedCreateInput | Prisma.InsurancePolicyCreateInput;

      if (simulationVersionId) {
        data = {
          ...rest,
          simulationVersionId,
        } satisfies Prisma.InsurancePolicyUncheckedCreateInput;
      } else {
        // Se seu schema exigir relação obrigatória, troque por:
        // data = { ...rest, simulationVersion: { connect: { id: '<algum-id>' } } };
        // Para não travar agora, fazemos um cast:
        data = rest as Prisma.InsurancePolicyCreateInput;
      }

      const created = await app.prisma.insurancePolicy.create({ data: data as any });
      return reply.code(201).send(created);
    },

    update: async (req: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = upsertInsuranceBody.partial().parse(req.body);
      return app.prisma.insurancePolicy.update({ where: { id }, data: body as any });
    },

    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await app.prisma.insurancePolicy.delete({ where: { id } });
      return reply.code(204).send();
    },
  };
}
