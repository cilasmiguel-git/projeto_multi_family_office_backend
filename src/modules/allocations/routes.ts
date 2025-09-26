import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { allocationsController } from './controller.js';
import { upsertAllocationBody, appendRecordBody } from './schemas.js';

const idParam = z.object({ id: z.string() }); 
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

  // ✅ lista registros (original)
  app.get('/:id/records', {
    schema: { tags: ['allocations'], params: idParam }
  }, c.listRecords);

  // ✅ alias que os testes usam
  app.get('/:id/history', {
    schema: { tags: ['allocations'], params: idParam }
  }, c.listRecords);

  // ✅ cria registro via body (allocationId no body)
  app.post('/records', {
    schema: { tags: ['allocations'], body: appendRecordBody }
  }, c.appendRecord);

  // (opcional) cria registro com id no path
  app.post('/:id/records', {
    schema: {
      tags: ['allocations'],
      params: idParam,
      body: appendRecordBody.omit({ allocationId: true }), // date, value
    }
  }, async (req, reply) => {
    const { id } = idParam.parse(req.params);
    const { date, value } = req.body as { date: Date; value: number };
    const rec = await app.prisma.allocationRecord.create({
      data: { allocationId: id, date, value },
    });
    return reply.code(201).send(rec);
  });
};

export default routes;
