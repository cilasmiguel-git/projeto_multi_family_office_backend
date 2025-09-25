import { FastifyInstance } from "fastify";
import {
  createSimulationBody,
  listSimulationsQuery,
  updateSimulationBody,
  createVersionBody,
} from "./schemas.js";
import {
  createSimulation,
  listLatestSimulations,
  updateSimulation,
  deleteSimulation,
  createNewVersion,
  listVersions,
} from "./service.js";
import { z } from "zod";

export function simulationsController(app: FastifyInstance) {
  return {
    list: async (req: any, reply: any) => {
      const q = listSimulationsQuery.parse(req.query);
      const data = await listLatestSimulations(app, q.clientId);
      return reply.send(data);
    },
    create: async (req: any, reply: any) => {
      const body = createSimulationBody.parse(req.body);
      const sim = await createSimulation(
        app,
        body.clientId,
        body.name,
        body.baseRateReal
      );
      return reply.code(201).send(sim);
    },
    update: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = updateSimulationBody.parse(req.body);
      const updated = await updateSimulation(app, id, body);
      return reply.send(updated);
    },
    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await deleteSimulation(app, id);
      return reply.code(204).send();
    },
    createVersion: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const { fromVersionId } = createVersionBody.parse(req.body);
      const v = await createNewVersion(app, id, fromVersionId);
      return reply.code(201).send(v);
    },
    listVersions: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const vs = await listVersions(app, id);
      return reply.send(vs);
    },
  };
}
