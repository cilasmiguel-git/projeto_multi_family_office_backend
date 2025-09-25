// src/core/plugins/swagger.ts
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import type { FastifyPluginAsync } from "fastify";

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  // compilers do zod (ok aqui também)
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(swagger, {
    openapi: {
      info: { title: "MFO Planner API", version: "1.0.0" },
      tags: [
        { name: "health" },
        { name: "clients" }, // 👈 novo
        { name: "simulations" },
        { name: "projections" },
        { name: "allocations" },
        { name: "movements" },
        { name: "insurances" },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });
};

// 👇 isto faz o plugin rodar no MESMO escopo do app (sem encapsular)
export default fp(swaggerPlugin, { name: "swagger-plugin" });
