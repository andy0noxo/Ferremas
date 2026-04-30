const moment = require('moment');
const {
  formatDate,
  formatRelativeDate,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addTime,
  subtractTime,
  isBetween,
  daysDifference,
  isValidDate,
  toUnixTimestamp,
  fromUnixTimestamp
} = require('./dateHelpers');

describe('Date Helpers', () => {
  const baseDate = new Date(Date.UTC(2020, 0, 15, 13, 45, 30)); // 2020-01-15T13:45:30Z

  test('formatDate debe formatear según formato por defecto', () => {
    const out = formatDate(baseDate);
    const expected = moment(baseDate).format('DD/MM/YYYY HH:mm');
    expect(out).toBe(expected);
  });

  test('formatRelativeDate debe devolver formato relativo en español', () => {
    const twoDaysAgo = moment().subtract(2, 'days').toDate();
    const out = formatRelativeDate(twoDaysAgo);
    expect(typeof out).toBe('string');
    expect(out).toMatch(/hace|antes/);
  });

  test('startOfDay y endOfDay deben devolver los límites del día', () => {
    const s = startOfDay(baseDate);
    const e = endOfDay(baseDate);

    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(e.getHours()).toBe(23);
    // endOfDay puede tener ms 999
    expect(e.getMinutes()).toBe(59);
  });

  test('startOfMonth y endOfMonth deben devolver límites del mes', () => {
    const s = startOfMonth(baseDate);
    const e = endOfMonth(baseDate);

    expect(s.getDate()).toBe(1);
    expect(s.getHours()).toBe(0);
    expect(e.getDate()).toBe(moment(baseDate).endOf('month').date());
  });

  test('addTime y subtractTime deben ajustar la fecha correctamente', () => {
    const plus3 = addTime(baseDate, 3, 'days');
    const minus2 = subtractTime(baseDate, 2, 'days');

    expect(moment(plus3).diff(moment(baseDate), 'days')).toBe(3);
    expect(moment(baseDate).diff(moment(minus2), 'days')).toBe(2);
  });

  test('isBetween debe verificar inclusión en rango (inclusivo)', () => {
    const start = moment(baseDate).subtract(1, 'day').toDate();
    const end = moment(baseDate).add(1, 'day').toDate();
    expect(isBetween(baseDate, start, end)).toBe(true);
    // límites inclusivos
    expect(isBetween(start, start, end)).toBe(true);
    expect(isBetween(end, start, end)).toBe(true);
  });

  test('daysDifference debe calcular diferencia en días', () => {
    const d1 = moment('2020-01-10').toDate();
    const d2 = moment('2020-01-15').toDate();
    expect(daysDifference(d2, d1)).toBe(5);
  });

  test('isValidDate debe validar formatos válidos', () => {
    expect(isValidDate(baseDate)).toBe(true);
    expect(isValidDate('not-a-date')).toBe(false);
  });

  test('toUnixTimestamp y fromUnixTimestamp deben ser inversos', () => {
    const ts = toUnixTimestamp(baseDate);
    const d = fromUnixTimestamp(ts);
    expect(Math.abs(d.getTime() - moment.unix(ts).toDate().getTime())).toBeLessThan(1000);
  });
});
