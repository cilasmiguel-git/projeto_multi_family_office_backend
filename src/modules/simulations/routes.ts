import { FastifyPluginAsync } from 'fastify';
import { simulationsController } from './controller.js';
import { listSimulationsQuery, createSimulationBody, updateSimulationBody, createVersionBody } from './schemas.js';
import { z } from 'zod';

const routes: FastifyPluginAsync = async (app) => {
  const c = simulationsController(app);

  app.get('/', {
    schema: { tags: ['simulations'], summary: 'List latest simulations', querystring: listSimulationsQuery }
  }, c.list);

  app.post('/', {
    schema: { tags: ['simulations'], summary: 'Create simulation', body: createSimulationBody }
  }, c.create);

  app.patch('/:id', {
    schema: { tags: ['simulations'], summary: 'Update simulation',
      params: z.object({ id: z.string().uuid() }), body: updateSimulationBody }
  }, c.update);

  app.delete('/:id', {
    schema: { tags: ['simulations'], summary: 'Delete simulation',
      params: z.object({ id: z.string().uuid() }) }
  }, c.remove);

  app.post('/:id/versions', {
    schema: { tags: ['simulations'], summary: 'Create new version',
      params: z.object({ id: z.string().uuid() }), body: createVersionBody }
  }, c.createVersion);

  app.get('/:id/versions', {
    schema: { tags: ['simulations'], summary: 'List versions',
      params: z.object({ id: z.string().uuid() }) }
  }, c.listVersions);
};

export default routes;
