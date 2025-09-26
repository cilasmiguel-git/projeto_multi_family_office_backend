import { buildAppWith } from '../../helpers/build-app.js';
import { clientsModule } from '../../../src/modules/clients/index.js';

describe('Clients E2E', () => {
  test('GET /clients retorna lista paginada', async () => {
    const prisma = {
      client: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c1', name: 'Alice', document: '111', createdAt: new Date(), updatedAt: new Date() },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const app = await buildAppWith(prisma, clientsModule, '/clients');
const res = await app.inject({ method: 'GET', url: '/clients/?limit=20' });
expect(res.statusCode).toBe(200);
const body = res.json();
    const items = Array.isArray(body) ? body : body.items;
expect(Array.isArray(items)).toBe(true);
expect(items[0].id).toBe('c1');
    await app.close();
  });

  test('POST /clients cria cliente', async () => {
    const prisma = {
      client: {
        create: jest.fn().mockResolvedValue({ id: 'c1', name: 'Alice', document: '111' }),
      },
    };
    const app = await buildAppWith(prisma, clientsModule, '/clients');
    const res = await app.inject({
      method: 'POST',
      url: '/clients/',
      payload: { name: 'Alice', document: '111' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe('c1');
    await app.close();
  });
});
