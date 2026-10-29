/* Get a Point web: pure business rules shared by browser and Node tests. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GetAPoint = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const MAX_DAYS = 73050;
  const MILESTONES = Object.freeze([1, 7, 30, 100, 365, 1000]);

  function assertDay(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      throw new RangeError('Invalid date key');
    }
    const [year, month, day] = key.split('-').map(Number);
    const time = Date.UTC(year, month - 1, day, 12);
    const date = new Date(time);
    if (year < 100 || year > 9999 || date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
      throw new RangeError('Invalid calendar day');
    }
    return key;
  }

  function previousDay(key) {
    assertDay(key);
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }

  function localDay(date = new Date()) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
    const pad = number => String(number).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function normalize(raw) {
    const input = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        input.format_version !== VERSION || !Array.isArray(input.history) ||
        input.history.length > MAX_DAYS) {
      throw new TypeError('Invalid Get a Point backup format');
    }
    for (const key of input.history) assertDay(key);
    return [...new Set(input.history)].sort();
  }

  function calculate(history, today) {
    assertDay(today);
    const days = new Set(history);
    const latest = history.at(-1) || null;
    let best = 0;
    let run = 0;
    let previous = null;
    for (const key of history) {
      run = previous !== null && previousDay(key) === previous ? run + 1 : 1;
      best = Math.max(best, run);
      previous = key;
    }
    const tail = latest === today || latest === previousDay(today);
    let current = 0;
    if (tail) {
      let date = latest;
      while (days.has(date)) {
        current++;
        date = previousDay(date);
      }
    }
    const next = MILESTONES.find(value => value > history.length) || null;
    return Object.freeze({
      points: history.length, streak: current, bestStreak: best,
      claimedToday: days.has(today), latest, nextMilestone: next,
      achievements: Object.freeze(MILESTONES.filter(value => history.length >= value))
    });
  }

  function createLedger(initial = { format_version: VERSION, history: [] }) {
    let history = normalize(initial);

    function snapshot(today = localDay()) {
      return calculate(history, today);
    }
    function claim(today = localDay()) {
      assertDay(today);
      if (history.includes(today)) return Object.freeze({ accepted: false, reason: 'already-claimed', ...snapshot(today) });
      if (history.length && history.at(-1) > today) {
        return Object.freeze({ accepted: false, reason: 'clock-backward', ...snapshot(today) });
      }
      history = [...history, today];
      return Object.freeze({ accepted: true, reason: 'claimed', ...snapshot(today) });
    }
    function mergeBackup(raw) {
      const incoming = normalize(raw);
      history = [...new Set([...history, ...incoming])].sort();
      if (history.length > MAX_DAYS) throw new RangeError('Too many dates');
      return history.length;
    }
    function exportBackup() {
      return JSON.stringify({ format_version: VERSION, history: [...history] }, null, 2) + '\n';
    }
    function historyThrough(today = localDay(), count = 30) {
      assertDay(today);
      if (!Number.isInteger(count) || count < 1 || count > 366) throw new RangeError('Invalid history length');
      const claimed = new Set(history);
      const result = [];
      let day = today;
      for (let index = 0; index < count; index++) {
        result.push({ day, claimed: claimed.has(day) });
        day = previousDay(day);
      }
      return result.reverse();
    }
    return Object.freeze({ snapshot, claim, mergeBackup, exportBackup, historyThrough });
  }

  return Object.freeze({ VERSION, MILESTONES, assertDay, previousDay, localDay, createLedger });
});
