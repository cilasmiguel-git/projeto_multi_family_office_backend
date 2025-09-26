// src/modules/insurances/service.ts
export type InsurancePolicy = {
  startDate: Date;
  durationMonths: number;
  monthlyPremium: number;
};

export function computePremiumForYear(policy: InsurancePolicy, year: number): number {
  const start = new Date(policy.startDate);
  const end = new Date(start);
  // fim exclusivo
  end.setMonth(end.getMonth() + policy.durationMonths);

  let months = 0;
  for (let m = 0; m < 12; m++) {
    const d = new Date(Date.UTC(year, m, 1));
    if (d >= start && d < end) months++;
  }
  return months * policy.monthlyPremium;
}
