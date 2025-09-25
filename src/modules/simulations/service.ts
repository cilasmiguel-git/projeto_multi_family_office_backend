import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

export async function ensureSimulationNameUnique(
  app: FastifyInstance,
  clientId: string,
  name: string
) {
  const found = await app.prisma.simulation.findFirst({
    where: { clientId, name },
  });
  if (found)
    throw app.httpErrors.conflict(
      "Já existe uma simulação com esse nome para este cliente."
    );
}

export async function createSimulation(
  app: FastifyInstance,
  clientId: string,
  name: string,
  baseRateReal = 0.04
) {
  await ensureSimulationNameUnique(app, clientId, name);
  return app.prisma.simulation.create({
    data: {
      clientId,
      name,
      baseRateReal,
      versions: {
        create: { version: 1, startDate: new Date(), lifeStatus: "ALIVE" },
      },
    },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
}

export async function listLatestSimulations(
  app: FastifyInstance,
  clientId: string
) {
  const versions = await app.prisma.simulationVersion.findMany({
    where: { simulation: { clientId } },
    orderBy: [{ simulationId: "asc" }, { version: "desc" }],
    include: { simulation: true },
  });

  const seen = new Set<string>();
  const latest = [];
  for (const v of versions) {
    if (!seen.has(v.simulationId)) {
      latest.push(v);
      seen.add(v.simulationId);
    }
  }
  return latest.map((v) => ({
    simulationId: v.simulationId,
    simulationName: v.simulation.name,
    baseRateReal: v.simulation.baseRateReal,
    versionId: v.id,
    version: v.version,
    startDate: v.startDate,
    lifeStatus: v.lifeStatus,
    isCurrentSnapshot: v.isCurrentSnapshot,
    isLegacy: v.isLegacy,
  }));
}

export async function updateSimulation(
  app: FastifyInstance,
  id: string,
  data: { name?: string; baseRateReal?: number }
) {
  const toUpdate: Prisma.SimulationUpdateInput = {};
  if (data.name) toUpdate.name = data.name;
  if (typeof data.baseRateReal === "number")
    toUpdate.baseRateReal = data.baseRateReal;
  return app.prisma.simulation.update({ where: { id }, data: toUpdate });
}

export async function deleteSimulation(app: FastifyInstance, id: string) {
  const countSnapshot = await app.prisma.simulationVersion.count({
    where: { simulationId: id, isCurrentSnapshot: true },
  });
  if (countSnapshot > 0)
    throw app.httpErrors.conflict(
      'Não é possível deletar: possui "Situação Atual".'
    );
  await app.prisma.simulation.delete({ where: { id } });
}

export async function createNewVersion(
  app: FastifyInstance,
  simulationId: string,
  fromVersionId?: string
) {
  const baseVersion = fromVersionId
    ? await app.prisma.simulationVersion.findUnique({
        where: { id: fromVersionId },
        include: {
          allocations: { include: { records: true } },
          movements: true,
          insurances: true,
        },
      })
    : await app.prisma.simulationVersion.findFirst({
        where: { simulationId },
        orderBy: { version: "desc" },
        include: {
          allocations: { include: { records: true } },
          movements: true,
          insurances: true,
        },
      });

  if (!baseVersion)
    throw app.httpErrors.notFound("Versão base não encontrada.");
  const nextVersion = baseVersion.version + 1;

  return app.prisma.$transaction(async (tx) => {
    const newVersion = await tx.simulationVersion.create({
      data: {
        simulationId,
        version: nextVersion,
        startDate: baseVersion.startDate,
        lifeStatus: baseVersion.lifeStatus,
        copiedFromVersionId: baseVersion.id,
      },
    });

    for (const al of baseVersion.allocations) {
      const newAl = await tx.allocation.create({
        data: {
          simulationVersionId: newVersion.id,
          type: al.type,
          name: al.name,
        },
      });
      if (al.records.length) {
        await tx.allocationRecord.createMany({
          data: al.records.map((r) => ({
            allocationId: newAl.id,
            date: r.date,
            value: r.value,
          })),
        });
      }
    }

    if (baseVersion.movements.length) {
      await tx.movement.createMany({
        data: baseVersion.movements.map((m) => ({
          simulationVersionId: newVersion.id,
          type: m.type,
          amount: m.amount,
          frequency: m.frequency,
          startDate: m.startDate,
          endDate: m.endDate ?? null,
        })),
      });
    }

    if (baseVersion.insurances.length) {
      await tx.insurancePolicy.createMany({
        data: baseVersion.insurances.map((s) => ({
          simulationVersionId: newVersion.id,
          type: s.type,
          name: s.name,
          startDate: s.startDate,
          durationMonths: s.durationMonths,
          monthlyPremium: s.monthlyPremium,
          insuredAmount: s.insuredAmount,
        })),
      });
    }

    await tx.simulationVersion.updateMany({
      where: { simulationId, id: { not: newVersion.id } },
      data: { isLegacy: true },
    });

    return newVersion;
  });
}

export async function listVersions(app: FastifyInstance, simulationId: string) {
  return app.prisma.simulationVersion.findMany({
    where: { simulationId },
    orderBy: { version: "desc" },
  });
}
