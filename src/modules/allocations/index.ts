import { FastifyPluginAsync } from 'fastify';
import routes from './routes.js';
export const allocationsModule: FastifyPluginAsync = async (app) => { await app.register(routes); };
