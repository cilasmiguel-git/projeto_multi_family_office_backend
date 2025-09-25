import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { allocationsController } from './controller.js';
import { upsertAllocationBody, appendRecordBody } from './schemas.js';

const idParam = z.object({ id: z.string().uuid() });
const versionParam = z.object({ versionId: z.string().uuid() });
const updateAllocationBody = upsertAllocationBody.pick({ type: true, name: true }).partial();

const routes: FastifyPluginAsync = async (app) => {
  const c = allocationsController(app);

  app.get('/version/:versionId', {
    schema: { tags: ['allocations'], params: versionParam }
  }, c.listByVersion);

  app.post('/', {
    schema: { tags: ['allocations'], body: upsertAllocationBody }
  }, c.create);

  app.patch('/:id', {
    schema: { tags: ['allocations'], params: idParam, body: updateAllocationBody }
  }, c.update);

  app.delete('/:id', {
    schema: { tags: ['allocations'], params: idParam }
  }, c.remove);

  app.get('/:id/records', {
    schema: { tags: ['allocations'], params: idParam }
  }, c.listRecords);

  app.post('/records', {
    schema: { tags: ['allocations'], body: appendRecordBody }
  }, c.appendRecord);
};

export default routes;
