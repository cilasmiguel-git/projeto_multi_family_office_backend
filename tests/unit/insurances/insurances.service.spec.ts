import { computePremiumForYear } from '../../../src/modules/insurances/service.js';

describe('Insurances service - computePremiumForYear', () => {
  test('só soma prêmio dentro da vigência', () => {
    const policy = {
      startDate: new Date('2025-01-01'),
      durationMonths: 12,
      monthlyPremium: 100,
    };
    const y2025 = computePremiumForYear(policy, 2025);
    const y2026 = computePremiumForYear(policy, 2026);
    expect(y2025).toBe(1200);
    expect(y2026).toBe(0);
  });
});