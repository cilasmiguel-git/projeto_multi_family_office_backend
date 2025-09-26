import { buildAppWith } from '../../helpers/build-app.js';
import { insurancesModule } from '../../../src/modules/insurances/index.js';

describe('Insurances E2E', () => {
  test('POST /insurances cria apólice', async () => {
    const prisma = {
      insurancePolicy: {
        create: jest.fn().mockResolvedValue({ id: 'p1', name: 'Vida' }),
      },
    };
    const app = await buildAppWith(prisma, insurancesModule, '/insurances');
    const res = await app.inject({
      method: 'POST',
      url: '/insurances/',
      payload: { name: 'Vida', startDate: '2025-01-01', durationMonths: 12, monthlyPremium: 100, insuredAmount: 100000 },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe('p1');
    await app.close();
  });
});