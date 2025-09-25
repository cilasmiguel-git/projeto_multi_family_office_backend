import { FastifyPluginAsync } from 'fastify';
import routes from './routes.js';

export const simulationsModule: FastifyPluginAsync = async (app, opts) => {
  await app.register(routes, { prefix: '' });
};
