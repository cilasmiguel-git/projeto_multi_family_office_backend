import { addAllocationRecord } from '../../../src/modules/allocations/service.js';

describe('Allocations service - addAllocationRecord', () => {
  test('sempre cria um novo AllocationRecord', async () => {
    const prisma = {
      allocationRecord: {
        create: jest.fn().mockResolvedValue({ id: 'r2' }),
      },
    };
    const app: any = { prisma, httpErrors: {} };

    await addAllocationRecord(app, {
      allocationId: 'al1',
      date: new Date('2025-01-01'),
      value: 1234,
    });

    expect(prisma.allocationRecord.create).toHaveBeenCalled();
  });
});
