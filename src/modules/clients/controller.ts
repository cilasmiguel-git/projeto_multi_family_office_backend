import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createClientBody,
  updateClientBody,
  listClientsQuery,
} from "./schemas.js";
import {
  createClient,
  getClient,
  listClients,
  updateClient,
  deleteClient,
} from "./service.js";

export function clientsController(app: FastifyInstance) {
  return {
    create: async (req: any, reply: any) => {
      const body = createClientBody.parse(req.body);
      const client = await createClient(app, body);
      return reply.code(201).send(client);
    },
    get: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const client = await getClient(app, id);
      if (!client) throw app.httpErrors.notFound();
      return reply.send(client);
    },
    list: async (req: any, reply: any) => {
      const q = listClientsQuery.parse(req.query);
      const clients = await listClients(app, q);
      return reply.send(clients);
    },
    update: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = updateClientBody.parse(req.body);
      const updated = await updateClient(app, id, body);
      return reply.send(updated);
    },
    remove: async (req: any, reply: any) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await deleteClient(app, id);
      return reply.code(204).send();
    },
  };
}
