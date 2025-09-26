import { expandMovements } from '../../../src/modules/movements/service.js';

function d(y:number,m:number,day=1){ return new Date(Date.UTC(y,m-1,day)); }

describe('Movements service - expandMovements', () => {
  test('encadeia entradas mensais em períodos diferentes', () => {
    const input = [
      { type: 'INCOME', amount: 1000, frequency: 'MONTHLY', startDate: d(2025,1), endDate: d(2035,1) },
      { type: 'INCOME', amount: 1500, frequency: 'MONTHLY', startDate: d(2035,2), endDate: d(2060,1) },
    ];
    const expanded = expandMovements(input);
    expect(expanded.some(e => e.amount === 1000)).toBe(true);
    expect(expanded.some(e => e.amount === 1500)).toBe(true);
  });
});