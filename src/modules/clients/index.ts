import { FastifyPluginAsync } from 'fastify';
import routes from './routes.js';

export const clientsModule: FastifyPluginAsync = async (app) => {
  await app.register(routes, { prefix: '' });
};
