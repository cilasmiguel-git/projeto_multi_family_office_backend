// tests/e2e/projections/projections.e2e.spec.ts
import Fastify from "fastify";
import { projectionsModule } from "../../../src/modules/projections/index.js";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

function d(y: number, m: number, day = 1) {
  return new Date(Date.UTC(y, m - 1, day));
}

describe("POST /projections (E2E)", () => {
  test("retorna projeção com pontos e status 200", async () => {
    const SIM_ID = "513885e5-c717-45dd-a11f-728e5dffb4af"; // ✅ UUID

    const simulation = {
      id: SIM_ID,
      baseRateReal: 0.04,
      versions: [
        { id: "v1", version: 1, startDate: d(2025, 1), lifeStatus: "ALIVE" },
      ],
    };

    const fakePrisma = {
      simulation: { findUnique: jest.fn().mockResolvedValue(simulation) },
      allocation: { findMany: jest.fn().mockResolvedValue([{ id: "al1", type: "FINANCIAL" }]) },
      allocationRecord: { findFirst: jest.fn().mockResolvedValue({ date: d(2025, 1), value: 10000 }) },
      movement: { findMany: jest.fn().mockResolvedValue([]) },
      insurancePolicy: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const app = Fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.decorate("prisma", fakePrisma as any);
    (app as any).httpErrors = app.httpErrors;

    await app.register(projectionsModule, { prefix: "/projections" });
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/projections/",
      payload: {
        simulationId: SIM_ID,         // ✅ bate com o schema
        lifeStatus: "ALIVE",
        baseRateReal: 0.04,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.fromYear).toBe(2025);
    expect(Array.isArray(body.points)).toBe(true);
    expect(body.points.length).toBeGreaterThan(0);

    await app.close();
  });
});
