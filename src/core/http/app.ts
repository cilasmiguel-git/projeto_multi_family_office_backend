// src/core/http/app.ts
import Fastify from "fastify";
import prismaPlugin from "../plugins/prisma.js";
import swagger from "../plugins/swagger.js";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

// módulos...
import { simulationsModule } from "../../modules/simulations/index.js";
import { projectionsModule } from "../../modules/projections/index.js";
import { allocationsModule } from "../../modules/allocations/index.js";
import { movementsModule } from "../../modules/movements/index.js";
import { insurancesModule } from "../../modules/insurances/index.js";
import { clientsModule } from "../../modules/clients/index.js";
// src/core/http/app.ts
export async function buildApp() {
  const app = Fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 👇 1) Swagger PRIMEIRO
  await app.register(swagger);

  // plugins

  await app.register(prismaPlugin);

  const { default: sensible } = await import("@fastify/sensible");
  await app.register(sensible as unknown as FastifyPluginAsync);

  // rotas com schema.tags
  app.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Liveness probe",
        response: { 200: z.object({ ok: z.boolean() }) },
      },
    },
    async () => ({ ok: true })
  );

  await app.register(clientsModule, { prefix: "/clients" });
  await app.register(simulationsModule, { prefix: "/simulations" });
  await app.register(projectionsModule, { prefix: "/projections" });
  await app.register(allocationsModule, { prefix: "/allocations" });
  await app.register(movementsModule, { prefix: "/movements" });
  await app.register(insurancesModule, { prefix: "/insurances" });


  return app;
}
