import { buildAppWith } from '../../helpers/build-app.js';
import { movementsModule } from '../../../src/modules/movements/index.js';

describe('Movements E2E', () => {
  test('GET /movements retorna lista', async () => {
    const prisma = { movement: { findMany: jest.fn().mockResolvedValue([{ id: 'm1' }]) } };
    const app = await buildAppWith(prisma, movementsModule, '/movements');
    const res = await app.inject({ method: 'GET', url: '/movements/' });
    expect(res.statusCode).toBe(200);
    expect(res.json()[0].id).toBe('m1');
    await app.close();
  });
});