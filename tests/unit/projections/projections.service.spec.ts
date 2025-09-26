// tests/unit/projections.service.spec.ts
import { generateProjection } from '../../../src/modules/projections/service.js';

// Helper pra date UTC (evita timezone maluquice)
function d(y: number, m: number, day = 1) {
  return new Date(Date.UTC(y, m - 1, day));
}

describe('Projection service (generateProjection)', () => {
  test('cresce com renda líquida positiva e reduz quando inclui prêmios de seguro', async () => {
    // Simulação começa em 2025-01-01 com taxa real 4%
    const simulation = {
      id: 'sim-1',
      baseRateReal: 0.04,
      versions: [
        {
          id: 'v1',
          version: 1,
          startDate: d(2025, 1),
          lifeStatus: 'ALIVE',
        },
      ],
    };

    // Alocação financeira com registro inicial de 10.000 em 2025-01
    const allocations = [{ id: 'al1', type: 'FINANCIAL' as const }];
    const firstRecord = { date: d(2025, 1), value: 10000 };

    // Movimentos: +12.000/ano (1000/mês) de renda, -2400/ano de despesa
    const movements = [
      {
        type: 'INCOME',
        amount: 1000, // por mês
        frequency: 'MONTHLY',
        startDate: d(2025, 1),
        endDate: null,
      },
      {
        type: 'EXPENSE',
        amount: 200, // por mês
        frequency: 'MONTHLY',
        startDate: d(2025, 1),
        endDate: null,
      },
    ];

    // Seguro: prêmio 100/mês = 1200/ano
    const insurances = [
      {
        startDate: d(2025, 1),
        durationMonths: 120,
        monthlyPremium: 100,
      },
    ];

    // Prisma “fake” devolvendo exatamente o que a função espera consultar
    const fakePrisma = {
      simulation: {
        findUnique: jest.fn().mockResolvedValue(simulation),
      },
      allocation: {
        findMany: jest.fn().mockResolvedValue(allocations),
      },
      allocationRecord: {
        // “último registro <= startDate”
        findFirst: jest.fn().mockResolvedValue(firstRecord),
      },
      movement: {
        findMany: jest.fn().mockResolvedValue(movements),
      },
      insurancePolicy: {
        findMany: jest.fn().mockResolvedValue(insurances),
      },
    };

    const app: any = {
      prisma: fakePrisma,
      httpErrors: { notFound: (m: string) => new Error(m) },
    };

    const res = await generateProjection(app, {
      simulationId: 'sim-1',
      lifeStatus: 'ALIVE' as const,
      baseRateReal: 0.04,
    });

    // Deve começar em 2025 e ter vários pontos até 2060
    expect(res.fromYear).toBe(2025);
    expect(res.points.length).toBeGreaterThanOrEqual(5);

    const p2025 = res.points.find((p) => p.year === 2025)!;
    const p2026 = res.points.find((p) => p.year === 2026)!;

    // Com os números escolhidos:
    // renda anual = 12k; despesas = 2.4k; prêmio = 1.2k
    // net = 12k - (2.4k + 1.2k) = 8.4k
    // financial_2025 = (10000 + 8400) * 1.04 = 19136
    expect(p2025.financialAssets).toBeCloseTo(19136, 0);

    // Pelo menos cresce no ano seguinte
    expect(p2026.financialAssets).toBeGreaterThan(p2025.financialAssets);

    // Linha "sem seguros" precisa ser maior do que a com seguros
    expect(p2025.totalWithoutInsurances).toBeGreaterThan(
      p2025.totalAssets
    );
  });

  test('status DEAD: zera entradas e divide despesas por 2', async () => {
    const simulation = {
      id: 'sim-1',
      baseRateReal: 0.04,
      versions: [{ id: 'v1', version: 1, startDate: d(2025, 1), lifeStatus: 'DEAD' }],
    };

    const allocations = [{ id: 'al1', type: 'FINANCIAL' as const }];
    const firstRecord = { date: d(2025, 1), value: 10000 };
    const movements = [
      // Entradas que deveriam ser ignoradas no DEAD
      { type: 'INCOME', amount: 1000, frequency: 'MONTHLY', startDate: d(2025, 1), endDate: null },
      // Despesa mensal 200 => DEAD divide por 2 (vira 100/mês)
      { type: 'EXPENSE', amount: 200, frequency: 'MONTHLY', startDate: d(2025, 1), endDate: null },
    ];
    const insurances = [{ startDate: d(2025, 1), durationMonths: 120, monthlyPremium: 100 }];

    const fakePrisma = {
      simulation: { findUnique: jest.fn().mockResolvedValue(simulation) },
      allocation: { findMany: jest.fn().mockResolvedValue(allocations) },
      allocationRecord: { findFirst: jest.fn().mockResolvedValue(firstRecord) },
      movement: { findMany: jest.fn().mockResolvedValue(movements) },
      insurancePolicy: { findMany: jest.fn().mockResolvedValue(insurances) },
    };

    const app: any = {
      prisma: fakePrisma,
      httpErrors: { notFound: (m: string) => new Error(m) },
    };

    const res = await generateProjection(app, {
      simulationId: 'sim-1',
      lifeStatus: 'DEAD',
      baseRateReal: 0.04,
    });

    const p2025 = res.points.find((p) => p.year === 2025)!;
    // DEAD: income=0; despesa/2 => 100/mês => 1200/ano; prêmio 1200/ano
    // net = 0 - (1200 + 1200) = -2400
    // fin = (10000 - 2400) * 1.04 = 7904
    expect(p2025.financialAssets).toBeCloseTo(7904, 0);
  });
});
