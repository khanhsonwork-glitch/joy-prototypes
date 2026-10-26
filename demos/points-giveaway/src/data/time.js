// Shop time. Dates are kept as "shop wall clock" in UTC fields, so the screen shows the same time on any laptop.
export const TZ = 'ET';
export const TZ_LONG = '(GMT-05:00) Eastern Time';

export const at = (y, mo, d, h = 0, mi = 0) => new Date(Date.UTC(y, mo - 1, d, h, mi));
// One "today" for the whole demo, admin and storefront alike: Thu, Dec 3, 2026, 10:30 AM (the BFCM reminder went out at 9:00).
export const NOW = at(2026, 12, 3, 10, 30);
/** End of today: what the admin counts (the storefront's look at a later day doesn't reach the admin). */
export const END_OF_TODAY = at(2026, 12, 4);
export const addHours = (date, h) => new Date(date.getTime() + h * 3600 * 1000);
export const addDays = (date, d) => addHours(date, d * 24);

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function clock(date) {
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
/** "Dec 4" */
export const day = (date) => `${MON[date.getUTCMonth()]} ${date.getUTCDate()}`;
/** "Fri, Dec 4" */
export const weekday = (date) => `${DAY[date.getUTCDay()]}, ${day(date)}${date.getUTCFullYear() === NOW.getUTCFullYear() ? '' : `, ${date.getUTCFullYear()}`}`;
/** "Fri, Dec 4, 9:00 AM" */
export const dateTime = (date) => `${weekday(date)}, ${clock(date)}`;
/** "Fri, Dec 4, 9:00 AM ET" */
export const dateTimeTz = (date) => `${dateTime(date)} ${TZ}`;
/** "Dec 4, 2026" */
export const longDay = (date) => `${day(date)}, ${date.getUTCFullYear()}`;
/** yyyy-mm-dd for <input type=date> */
export const isoDay = (date) => date.toISOString().slice(0, 10);

export function durationLabel(hours) {
  if (hours % 24 === 0) {
    const d = hours / 24;
    return `${d} day${d === 1 ? '' : 's'}`;
  }
  return `${hours} hours`;
}
