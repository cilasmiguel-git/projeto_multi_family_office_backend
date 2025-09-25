import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';

const prisma = new PrismaClient();

const prismaPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('prisma', prisma);

  app.addHook('onClose', async (instance) => {
    // fecha quando o servidor cai
    await instance.prisma.$disconnect();
  });
};

// 🔴 IMPORTANTE: wrap com fastify-plugin para desabilitar a encapsulação
export default fp(prismaPlugin, { name: 'prisma-plugin' });
