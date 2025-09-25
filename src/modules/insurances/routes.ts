import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { insurancesController } from "./controller.js";
import { upsertInsuranceBody } from "./schemas.js";

const idParam = z.object({ id: z.string().uuid() });
const versionParam = z.object({ versionId: z.string().uuid() });
const updateInsuranceBody = upsertInsuranceBody.partial();

const routes: FastifyPluginAsync = async (app) => {
  const c = insurancesController(app);

  app.get(
    "/version/:versionId",
    { schema: { tags: ["insurances"], params: versionParam } },
    c.listByVersion
  );
  app.post(
    "/",
    { schema: { tags: ["insurances"], body: upsertInsuranceBody } },
    c.create
  );
  app.patch(
    "/:id",
    {
      schema: {
        tags: ["insurances"],
        params: idParam,
        body: updateInsuranceBody,
      },
    },
    c.update
  );
  app.delete(
    "/:id",
    { schema: { tags: ["insurances"], params: idParam } },
    c.remove
  );
};

export default routes;
