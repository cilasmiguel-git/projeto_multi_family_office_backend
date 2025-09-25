import { FastifyInstance } from "fastify";
import { LifeStatus } from "@prisma/client";

type ProjectionPoint = {
  year: number;
  financialAssets: number;
  realEstateAssets: number;
  totalAssets: number;
  totalWithoutInsurances: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function addMonths(date: Date, months: number) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function insurancePremiumsForYear(
  year: number,
  ins: Array<{ startDate: Date; durationMonths: number; monthlyPremium: any }>
) {
  let total = 0;
  for (const s of ins) {
    const startY = s.startDate.getUTCFullYear();
    const endY = addMonths(s.startDate, s.durationMonths).getUTCFullYear();
    const active =
      (year > startY && year < endY) ||
      (year === startY && startY !== endY) ||
      (year === endY && startY !== endY) ||
      (startY === endY && year === startY);
    if (active) total += 12 * Number(s.monthlyPremium);
  }
  return total;
}

function annualNetCashflow(
  year: number,
  movements: Array<{
    type: "INCOME" | "EXPENSE";
    amount: any;
    frequency: "ONE_TIME" | "MONTHLY" | "ANNUAL";
    startDate: Date;
    endDate: Date | null;
  }>,
  lifeStatus: LifeStatus
) {
  let income = 0,
    expense = 0;

  for (const m of movements) {
    const amt = Number(m.amount);
    const active =
      m.startDate.getUTCFullYear() <= year &&
      (m.endDate === null || m.endDate.getUTCFullYear() >= year);
    if (!active) continue;

    let mult =
      m.frequency === "MONTHLY"
        ? 12
        : m.frequency === "ANNUAL"
        ? 1
        : m.startDate.getUTCFullYear() === year
        ? 1
        : 0;
    if (m.type === "INCOME") income += amt * mult;
    else expense += amt * mult;
  }

  if (lifeStatus === "DEAD") {
    income = 0;
    expense = expense / 2;
  } else if (lifeStatus === "INVALID") {
    income = 0;
  }

  return { incomeYear: income, expenseYear: expense };
}

export async function generateProjection(
  app: FastifyInstance,
  params: {
    simulationId: string;
    lifeStatus: LifeStatus;
    baseRateReal?: number;
  }
) {
  const sim = await app.prisma.simulation.findUnique({
    where: { id: params.simulationId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!sim || sim.versions.length === 0)
    throw app.httpErrors.notFound("Simulação não encontrada.");

  const version = sim.versions[0];
  const startDate = version.startDate;
  const startYear = startDate.getUTCFullYear();
  const toYear = 2060;
  const rate =
    typeof params.baseRateReal === "number"
      ? params.baseRateReal
      : sim.baseRateReal ?? 0.04;

  const allocations = await app.prisma.allocation.findMany({
    where: { simulationVersionId: version.id },
    select: { id: true, type: true },
  });

  let initialFinancial = 0,
    initialRealEstate = 0;
  for (const al of allocations) {
    const rec = await app.prisma.allocationRecord.findFirst({
      where: { allocationId: al.id, date: { lte: startDate } },
      orderBy: { date: "desc" },
    });
    if (rec) {
      const val = Number(rec.value);
      if (al.type === "FINANCIAL") initialFinancial += val;
      else initialRealEstate += val;
    }
  }

  const movements = await app.prisma.movement.findMany({
    where: { simulationVersionId: version.id },
  });
  const insurances = await app.prisma.insurancePolicy.findMany({
    where: { simulationVersionId: version.id },
  });

  const points: ProjectionPoint[] = [];
  let fin = initialFinancial,
    rea = initialRealEstate;

  for (let year = startYear; year <= toYear; year++) {
    const { incomeYear, expenseYear } = annualNetCashflow(
      year,
      movements,
      params.lifeStatus
    );
    const premiumsYear = insurancePremiumsForYear(year, insurances);
    const net = incomeYear - (expenseYear + premiumsYear);
    const netWithoutIns = net + premiumsYear;

    fin = (fin + net) * (1 + rate);
    rea = rea * (1 + rate);

    const total = fin + rea;
    const finWithoutIns = fin - net + netWithoutIns; // aproximação para linha alternativa
    const totalWithoutIns = finWithoutIns + rea;

    points.push({
      year,
      financialAssets: round2(fin),
      realEstateAssets: round2(rea),
      totalAssets: round2(total),
      totalWithoutInsurances: round2(totalWithoutIns),
    });
  }

  return { fromYear: startYear, toYear, generatedAt: new Date(), points };
}
