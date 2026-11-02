'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../web/friends.js');
const { createLedger } = require('../web/ledger.js');

const mine = 'a'.repeat(32), alice = 'b'.repeat(32), bob = 'c'.repeat(32);
function board() {
  return F.createBoard({ format: 'get-a-point-friends', version: 1,
    owner: { id: mine, name: 'Moi' }, friends: [] });
}
const score = (id, name, points, streak, best, latest, asOf) => ({
  format: F.CARD_FORMAT, version: 1, id, name, points,
  streak, best_streak: best, latest, as_of: asOf
});
const me = () => createLedger({ format_version: 1, history: ['2026-10-30', '2026-10-31'] })
  .snapshot('2026-11-01');

test('owner exports only a compact scorecard, never the daily history', () => {
  const b = board();
  b.setName('  Jason  ');
  const result = JSON.parse(b.exportCard(me(), '2026-11-01'));
  assert.equal(result.name, 'Jason');
  assert.equal(result.points, 2);
  assert.equal(result.streak, 2);
  assert.equal(result.latest, '2026-10-31');
  assert.equal(result.history, undefined);
  assert.ok(!JSON.stringify(result).includes('2026-10-30'));
});

test('friend import and update preserve identity, ranking and best streak', () => {
  const b = board();
  assert.equal(b.importCard(score(alice, 'Alice', 10, 3, 5, '2026-11-01', '2026-11-01')), 'added');
  assert.equal(b.importCard(score(bob, 'Bob', 12, 12, 12, '2026-11-01', '2026-11-01')), 'added');
  assert.deepEqual(b.ranking('2026-11-01', me()).map(row => row.name), ['Bob','Alice','Moi']);
  assert.equal(b.importCard(score(alice, 'Alice 2', 13, 4, 6, '2026-11-02', '2026-11-02')), 'updated');
  assert.equal(b.count(), 2);
  assert.equal(b.ranking('2026-11-02', me())[0].name, 'Alice 2');
});

test('same card is idempotent, older snapshots and shrinking scores rejected', () => {
  const b = board();
  const c = score(alice, 'Alice', 8, 1, 4, '2026-11-01', '2026-11-01');
  assert.equal(b.importCard(c), 'added');
  assert.equal(b.importCard(JSON.stringify(c)), 'unchanged');
  assert.equal(b.importCard(score(alice, 'Alice', 6, 1, 4, '2026-11-01', '2026-11-02')), 'outdated');
  assert.equal(b.importCard(score(alice, 'Alice', 9, 2, 4, '2026-11-01', '2026-10-31')), 'outdated');
  assert.equal(b.ranking('2026-11-01', me())[0].points, 8);
});

test('scoreboard restores, delete works, and owner cannot be imported as friend', () => {
  const b = board();
  b.importCard(score(alice, 'Alice', 5, 2, 5, '2026-11-01', '2026-11-01'));
  assert.throws(() => b.importCard(score(mine, 'Me', 4, 1, 3, '2026-11-01', '2026-11-01')), /propre/);
  const copy = F.createBoard(b.exportBoard());
  assert.equal(copy.count(), 1);
  assert.equal(copy.remove(alice), true);
  assert.equal(copy.remove(alice), false);
  assert.equal(b.count(), 1);
});

test('streak displayed is only current or yesterday; points remain', () => {
  const b = board();
  b.importCard(score(alice, 'Alice', 10, 4, 7, '2026-11-01', '2026-11-01'));
  assert.equal(b.ranking('2026-11-02', me())[0].streak, 4);
  assert.equal(b.ranking('2026-11-03', me())[0].streak, 0);
  assert.equal(b.ranking('2026-11-03', me())[0].points, 10);
});

test('invalid cards fail without modifying friends', () => {
  const b = board();
  const good = score(alice, 'Alice', 2, 1, 2, '2026-11-01', '2026-11-01');
  for (const broken of [
    { ...good, id: 'bad' }, { ...good, name: '<x>\n' }, { ...good, points: -1 },
    { ...good, streak: 3 }, { ...good, best_streak: 0 },
    { ...good, latest: '2026-11-02' }, { ...good, as_of: '2026-02-30' },
    { ...good, latest: null }, { ...good, format: 'get-a-point-friends' }
  ]) assert.throws(() => b.importCard(broken));
  assert.equal(b.count(), 0);
  assert.throws(() => b.importCard('{bad json'));
  assert.throws(() => b.setName(' '.repeat(30)));
});

test('40 friends maximum and invalid board formats rejected atomically', () => {
  const b = board();
  for (let i = 1; i <= F.MAX_FRIENDS; i++) {
    const friendId = i.toString(16).padStart(32, '0');
    assert.equal(b.importCard(score(friendId, 'J' + i, 0, 0, 0, null, '2026-11-01')), 'added');
  }
  assert.throws(() => b.importCard(score('e'.repeat(32), 'Extra', 0, 0, 0, null, '2026-11-01')), /40 amis/);
  assert.equal(b.count(), 40);
  const state = JSON.parse(b.exportBoard());
  state.friends.push(state.friends[0]);
  assert.throws(() => F.createBoard(state));
  const duplicates = JSON.parse(b.exportBoard());
  duplicates.friends[1] = duplicates.friends[0];
  assert.throws(() => F.createBoard(duplicates));
});

test('name and owner snapshots are isolated from external mutation', () => {
  const b = board();
  const owner = b.owner();
  owner.name = 'changed';
  assert.equal(b.owner().name, 'Moi');
  assert.throws(() => b.setName('N'.repeat(25)));
  assert.equal(b.owner().name, 'Moi');
});
