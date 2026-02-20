const MONTHS_SHORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const MONTHS_UPPER = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];
const DAYS_SHORT = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DAYS_FULL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

/** "20 feb. 2026" — short month via toLocaleDateString */
export function formatDateNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "Zondag 20 Jan, 2026" — full day name + abbreviated month */
export function formatDateLongNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${DAYS_FULL[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}, ${date.getFullYear()}`;
}

/** "20 februari 2026" — long month via toLocaleDateString */
export function formatDateFullMonthNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "Zo 20 Jan" — abbreviated day + date + abbreviated month (no year) */
export function formatDateCompactNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${DAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "20 Jan 2026" — date + abbreviated month + year */
export function formatDateShortNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "20 JAN 2026" — zero-padded day + uppercase month + year */
export function formatDateUpperNL(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  return `${day} ${MONTHS_UPPER[date.getMonth()]} ${date.getFullYear()}`;
}

/** Days from today until the given date */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format km with Dutch locale: 123.456 */
export function formatMileage(km: number): string {
  return km.toLocaleString('nl-NL');
}