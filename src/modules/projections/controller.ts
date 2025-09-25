import { FastifyInstance } from 'fastify';
import { projectionBody } from './schemas.js';
import { generateProjection } from './service.js';

export function projectionsController(app: FastifyInstance) {
  return {
    project: async (req: any, reply: any) => {
      const body = projectionBody.parse(req.body);
      const result = await generateProjection(app, body);
      return reply.send(result);
    }
  };
}
