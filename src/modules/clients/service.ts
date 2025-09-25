import { FastifyInstance } from "fastify";

export async function createClient(
  app: FastifyInstance,
  data: { name: string; document?: string | null }
) {
  try {
    return await app.prisma.client.create({
      data: { name: data.name, document: data.document ?? null },
    });
  } catch (e: any) {
    if (e.code === "P2002")
      throw app.httpErrors.conflict("document already in use");
    throw e;
  }
}

export async function getClient(app: FastifyInstance, id: string) {
  return app.prisma.client.findUnique({ where: { id } });
}

export async function listClients(
  app: FastifyInstance,
  q: { q?: string; limit: number; cursor?: string }
) {
  return app.prisma.client.findMany({
    where: q.q ? { name: { contains: q.q, mode: "insensitive" } } : undefined,
    take: q.limit,
    ...(q.cursor ? { skip: 1, cursor: { id: q.cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });
}

export async function updateClient(
  app: FastifyInstance,
  id: string,
  data: { name?: string; document?: string | null }
) {
  try {
    return await app.prisma.client.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.document !== undefined ? { document: data.document } : {}),
      },
    });
  } catch (e: any) {
    if (e.code === "P2002")
      throw app.httpErrors.conflict("document already in use");
    throw e;
  }
}

export async function deleteClient(app: FastifyInstance, id: string) {
  const sims = await app.prisma.simulation.count({ where: { clientId: id } });
  if (sims > 0)
    throw app.httpErrors.conflict("client has simulations; cannot delete");
  await app.prisma.client.delete({ where: { id } });
}
