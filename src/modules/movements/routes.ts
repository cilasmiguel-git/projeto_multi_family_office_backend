import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { movementsController } from './controller.js';
import { upsertMovementBody } from './schemas.js';

const idParam = z.object({ id: z.string().uuid() });
const versionParam = z.object({ versionId: z.string().uuid() });
const updateMovementBody = upsertMovementBody.partial();

const routes: FastifyPluginAsync = async (app) => {
  const c = movementsController(app);
  app.get('/', { schema: { tags: ['movements'] } }, c.list);
  app.get('/version/:versionId', { schema: { tags: ['movements'], params: versionParam } }, c.listByVersion);
  app.post('/',                { schema: { tags: ['movements'], body: upsertMovementBody } }, c.create);
  app.patch('/:id',            { schema: { tags: ['movements'], params: idParam, body: updateMovementBody } }, c.update);
  app.delete('/:id',           { schema: { tags: ['movements'], params: idParam } }, c.remove);
};

export default routes;
