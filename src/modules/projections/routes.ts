import { FastifyPluginAsync } from 'fastify';
import { projectionsController } from './controller.js';
import { projectionBody } from './schemas.js';

const routes: FastifyPluginAsync = async (app) => {
  const c = projectionsController(app);
  app.post('/', {
    schema: { tags: ['projections'], summary: 'Generate projection', body: projectionBody }
  }, c.project);
};

export default routes;
