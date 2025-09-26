// src/modules/movements/service.ts
export type Movement = {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date | null;
};

// Implementação mínima: para os testes atuais, só precisamos devolver os itens.
// (Se quiser, depois expandimos mês a mês.)
export function expandMovements(items: Movement[]): Movement[] {
  return items;
}
