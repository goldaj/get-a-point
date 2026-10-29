'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLedger, localDay, previousDay, MILESTONES } = require('../web/ledger.js');

const on = (...history) => createLedger({ format_version: 1, history });

test('first claim gives exactly one point', () => {
  const ledger = on();
  const first = ledger.claim('2026-10-29');
  assert.equal(first.accepted, true);
  assert.equal(first.points, 1);
  assert.equal(first.streak, 1);
  assert.equal(first.bestStreak, 1);
  assert.equal(ledger.claim('2026-10-29').accepted, false);
  assert.equal(ledger.snapshot('2026-10-29').points, 1);
});

test('a consecutive sequence counts and survives the unclaimed morning', () => {
  const ledger = on('2026-10-26', '2026-10-27', '2026-10-28');
  assert.equal(ledger.snapshot('2026-10-29').streak, 3);
  const result = ledger.claim('2026-10-29');
  assert.equal(result.streak, 4);
  assert.equal(result.bestStreak, 4);
});

test('a missed day resets current streak, keeps record and total', () => {
  const ledger = on('2026-10-20', '2026-10-21', '2026-10-22');
  assert.equal(ledger.snapshot('2026-10-26').streak, 0);
  assert.equal(ledger.claim('2026-10-26').streak, 1);
  assert.equal(ledger.snapshot('2026-10-26').bestStreak, 3);
  assert.equal(ledger.snapshot('2026-10-26').points, 4);
});

test('date arithmetic works across leap day, month/year boundaries', () => {
  assert.equal(previousDay('2024-03-01'), '2024-02-29');
  assert.equal(previousDay('2025-03-01'), '2025-02-28');
  assert.equal(previousDay('2026-01-01'), '2025-12-31');
  assert.equal(on('2024-02-28', '2024-02-29').claim('2024-03-01').streak, 3);
});

test('invalid calendar dates cannot be claimed or imported', () => {
  for (const date of ['2026-02-29', '2026-13-01', '2026-00-11', '../bad', 'today']) {
    assert.throws(() => on().claim(date), RangeError);
  }
  assert.throws(() => createLedger({ format_version: 1, history: ['2026-02-29'] }), RangeError);
});

test('clock rollback is rejected after a newer claim', () => {
  const ledger = on('2026-10-28');
  assert.equal(ledger.claim('2026-10-27').reason, 'clock-backward');
  assert.equal(ledger.snapshot('2026-10-27').points, 1);
});

test('backup round-trip preserves exact history without secret data', () => {
  const first = on('2026-10-27', '2026-10-28');
  const file = first.exportBackup();
  assert.deepEqual(JSON.parse(file), {
    format_version: 1, history: ['2026-10-27', '2026-10-28']
  });
  const restored = createLedger(file);
  assert.deepEqual(restored.snapshot('2026-10-29'), first.snapshot('2026-10-29'));
});

test('merging backup is idempotent and preserves old points', () => {
  const ledger = on('2026-10-26', '2026-10-28');
  ledger.mergeBackup({ format_version: 1, history: ['2026-10-27', '2026-10-28'] });
  ledger.mergeBackup({ format_version: 1, history: ['2026-10-27', '2026-10-28'] });
  assert.equal(ledger.snapshot('2026-10-29').points, 3);
  assert.equal(ledger.snapshot('2026-10-29').streak, 3);
});

test('invalid backup does not change existing score', () => {
  const ledger = on('2026-10-27');
  assert.throws(() => ledger.mergeBackup('{"evil":true}'), TypeError);
  assert.throws(() => ledger.mergeBackup('{not JSON'), SyntaxError);
  assert.equal(ledger.snapshot('2026-10-27').points, 1);
});

test('milestones unlock at the right counts', () => {
  const ledger = on('2026-10-27');
  assert.deepEqual(ledger.snapshot('2026-10-27').achievements, [1]);
  assert.equal(ledger.snapshot('2026-10-27').nextMilestone, 7);
  assert.deepEqual(MILESTONES, [1, 7, 30, 100, 365, 1000]);
});

test('history displays 35 chronologically ordered days', () => {
  const ledger = on('2026-10-29', '2026-10-27');
  const days = ledger.historyThrough('2026-10-29', 35);
  assert.equal(days.length, 35);
  assert.equal(days.at(-1).day, '2026-10-29');
  assert.equal(days.at(-1).claimed, true);
  assert.equal(days.at(-2).claimed, false);
  assert.equal(days.at(-3).claimed, true);
  assert.ok(days[0].day < days.at(-1).day);
});

test('local civil date respects Date components', () => {
  const value = new Date(2026, 9, 29, 23, 30);
  assert.equal(localDay(value), '2026-10-29');
  assert.throws(() => localDay(new Date('invalid')), RangeError);
});

test('malformed date and schema are rejected', () => {
  assert.throws(() => createLedger({ format_version: 0, history: [] }), TypeError);
  assert.throws(() => createLedger({ format_version: 1, history: 'bad' }), TypeError);
  assert.throws(() => createLedger({ format_version: 1, history: [null] }), RangeError);
});
