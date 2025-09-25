// index.ts
import { FastifyPluginAsync } from 'fastify';
import routes from './routes.js';
export const movementsModule: FastifyPluginAsync = async (app) => { await app.register(routes); };
