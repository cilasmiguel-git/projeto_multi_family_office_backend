// tests/helpers/build-app.ts
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { FastifyPluginAsync } from 'fastify';

export async function buildAppWith(prismaMock: any, mod: FastifyPluginAsync, prefix: string) {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate('prisma', prismaMock as any);
  (app as any).httpErrors = app.httpErrors;

  await app.register(mod, { prefix });
  await app.ready();
  return app;
}
