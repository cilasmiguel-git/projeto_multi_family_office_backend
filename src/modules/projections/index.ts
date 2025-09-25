import { FastifyPluginAsync } from "fastify";
import routes from "./routes.js";

export const projectionsModule: FastifyPluginAsync = async (app, opts) => {
  await app.register(routes, { prefix: "" });
};
