// src/types/fastify-augment.d.ts
import 'fastify';
import '@fastify/sensible';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
