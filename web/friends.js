/* Offline friend scorecards for Get a Point. No server and no anti-cheat guarantees. */
(function (root, factory) {
  'use strict';
  const ledger = root && root.GetAPoint
    ? root.GetAPoint
    : (typeof module === 'object' && module.exports ? require('./ledger.js') : null);
  const api = factory(ledger);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GetAPointFriends = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ledger) {
  'use strict';
  if (!ledger) throw new Error('Load ledger.js before friends.js');

  const MAX_FRIENDS = 40;
  const MAX_POINTS = 73050;
  const CARD_FORMAT = 'get-a-point-score-card';
  const BOARD_FORMAT = 'get-a-point-friends';
  const ID = /^[a-f0-9]{32}$/i;

  function name(value) {
    if (typeof value !== 'string') throw new TypeError('Pseudo invalide');
    const result = value.trim();
    if (!result || result.length > 24 || /[\u0000-\u001f\u007f]/.test(result)) {
      throw new TypeError('Pseudo : 1 à 24 caractères sans caractères de contrôle');
    }
    return result;
  }

  function id(value) {
    if (typeof value !== 'string' || !ID.test(value)) throw new TypeError('Identifiant invalide');
    return value.toLowerCase();
  }

  function integer(value, min, max) {
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      throw new TypeError('Statistique invalide');
    }
    return value;
  }

  function parse(raw) {
    if (typeof raw === 'string') return JSON.parse(raw);
    return raw;
  }

  function card(raw) {
    const input = parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        input.format !== CARD_FORMAT || input.version !== 1) {
      throw new TypeError('Ce fichier n’est pas une fiche de score Get a Point');
    }
    const playerId = id(input.id);
    const playerName = name(input.name);
    const points = integer(input.points, 0, MAX_POINTS);
    const streak = integer(input.streak, 0, points);
    const bestStreak = integer(input.best_streak, streak, points);
    const asOf = ledger.assertDay(input.as_of);
    const latest = input.latest === null ? null : ledger.assertDay(input.latest);
    if ((points === 0) !== (latest === null) || latest !== null && latest > asOf ||
        streak > 0 && latest !== asOf && latest !== ledger.previousDay(asOf)) {
      throw new TypeError('Dates et scores incohérents');
    }
    return Object.freeze({
      format: CARD_FORMAT, version: 1, id: playerId, name: playerName,
      points, streak, best_streak: bestStreak, as_of: asOf, latest
    });
  }

  function generateId() {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      // No authentication relies on this ID: it only helps match future imports.
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function defaultState() {
    return { format: BOARD_FORMAT, version: 1, owner: { id: generateId(), name: 'Moi' }, friends: [] };
  }

  function createBoard(initial) {
    const raw = initial === undefined ? defaultState() : parse(initial);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
        raw.format !== BOARD_FORMAT || raw.version !== 1 || !raw.owner ||
        typeof raw.owner !== 'object' || !Array.isArray(raw.friends) ||
        raw.friends.length > MAX_FRIENDS) throw new TypeError('Classement local invalide');
    const owner = { id: id(raw.owner.id), name: name(raw.owner.name) };
    const friends = raw.friends.map(card);
    const ids = friends.map(friend => friend.id);
    if (ids.includes(owner.id) || new Set(ids).size !== ids.length) {
      throw new TypeError('Identifiants de joueurs dupliqués');
    }

    function setName(value) {
      owner.name = name(value);
      return owner.name;
    }

    function exportCard(snapshot, today) {
      ledger.assertDay(today);
      if (!snapshot || typeof snapshot !== 'object') throw new TypeError('Score invalide');
      return JSON.stringify(card({
        format: CARD_FORMAT, version: 1, id: owner.id, name: owner.name,
        points: snapshot.points, streak: snapshot.streak, best_streak: snapshot.bestStreak,
        latest: snapshot.latest, as_of: today
      }), null, 2) + '\n';
    }

    function importCard(rawCard) {
      const incoming = card(rawCard);
      if (incoming.id === owner.id) throw new Error('Tu ne peux pas importer ton propre score');
      const index = friends.findIndex(friend => friend.id === incoming.id);
      if (index === -1) {
        if (friends.length >= MAX_FRIENDS) throw new RangeError('40 amis maximum');
        friends.push(incoming);
        return 'added';
      }
      const previous = friends[index];
      if (incoming.points < previous.points || incoming.as_of < previous.as_of) return 'outdated';
      if (JSON.stringify(previous) === JSON.stringify(incoming)) return 'unchanged';
      friends[index] = incoming;
      return 'updated';
    }

    function remove(friendId) {
      const index = friends.findIndex(friend => friend.id === id(friendId));
      if (index === -1) return false;
      friends.splice(index, 1);
      return true;
    }

    function effectiveStreak(entry, today) {
      return entry.latest === today || entry.latest === ledger.previousDay(today) ? entry.streak : 0;
    }

    function ranking(today, snapshot) {
      ledger.assertDay(today);
      const mine = card({
        format: CARD_FORMAT, version: 1, id: owner.id, name: owner.name,
        points: snapshot.points, streak: snapshot.streak, best_streak: snapshot.bestStreak,
        as_of: snapshot.latest && snapshot.latest > today ? snapshot.latest : today,
        latest: snapshot.latest
      });
      const rows = [mine, ...friends].map(entry => ({
        id: entry.id, name: entry.name, points: entry.points,
        streak: effectiveStreak(entry, today), bestStreak: entry.best_streak,
        asOf: entry.as_of, mine: entry.id === owner.id
      }));
      rows.sort((a, b) => b.points - a.points || b.streak - a.streak ||
        a.name.localeCompare(b.name, 'fr') || a.id.localeCompare(b.id));
      return rows;
    }

    function exportBoard() {
      return JSON.stringify({
        format: BOARD_FORMAT, version: 1,
        owner: { ...owner }, friends: friends.map(friend => ({ ...friend }))
      }, null, 2) + '\n';
    }

    return Object.freeze({
      setName, exportCard, importCard, remove, ranking, exportBoard,
      owner: () => ({ ...owner }), count: () => friends.length
    });
  }

  return Object.freeze({ createBoard, card, name, MAX_FRIENDS, CARD_FORMAT });
});
