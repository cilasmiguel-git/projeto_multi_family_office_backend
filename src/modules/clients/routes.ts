import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { clientsController } from './controller.js';
import { createClientBody, updateClientBody, listClientsQuery } from './schemas.js';

const routes: FastifyPluginAsync = async (app) => {
  const c = clientsController(app);

  app.get('/',    { schema: { tags: ['clients'], querystring: listClientsQuery } }, c.list);
  app.post('/',   { schema: { tags: ['clients'], body: createClientBody } }, c.create);
  app.get('/:id', { schema: { tags: ['clients'], params: z.object({ id: z.string().uuid() }) } }, c.get);
  app.patch('/:id', { schema: { tags: ['clients'], params: z.object({ id: z.string().uuid() }), body: updateClientBody } }, c.update);
  app.delete('/:id', { schema: { tags: ['clients'], params: z.object({ id: z.string().uuid() }) } }, c.remove);
};

export default routes;
