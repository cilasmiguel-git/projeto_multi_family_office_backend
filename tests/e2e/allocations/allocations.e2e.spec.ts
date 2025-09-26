import { buildAppWith } from '../../helpers/build-app.js';
import { allocationsModule } from '../../../src/modules/allocations/index.js';

describe('Allocations E2E', () => {
  test('GET /allocations/:id/history retorna timeline', async () => {
    const prisma = {
      allocationRecord: {
        findMany: jest.fn().mockResolvedValue([{ date: new Date(), value: 1000 }]),
      },
    };
    const app = await buildAppWith(prisma, allocationsModule, '/allocations');
    const res = await app.inject({ method: 'GET', url: '/allocations/al1/history' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
    await app.close();
  });
});
