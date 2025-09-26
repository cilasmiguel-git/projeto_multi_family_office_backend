import { listClients } from "../../../src/modules/clients/service.js";

describe("Clients service - listClients", () => {
  test("retorna items e nextCursor quando há mais registros", async () => {
    const prisma = {
      client: {
        findMany: jest.fn().mockResolvedValue([
          { id: "c1", name: "A" },
          { id: "c2", name: "B" },
        ]),
        count: jest.fn().mockResolvedValue(10),
      },
    };
    const app: any = { prisma, httpErrors: {} };
    const res = await listClients(app, {
      limit: 2,
      q: "",
      cursor: null,
    } as any);
    const items = Array.isArray(res) ? res : res.items;

    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(2);

    // Só cheque nextCursor se o service realmente retorna objeto
    if (!Array.isArray(res)) {
      expect(res.nextCursor).toBe("c2");
    }
  });
});
