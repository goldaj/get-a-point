(function () {
  'use strict';
  const key = 'get-a-point-web-v1';
  const $ = id => document.getElementById(id);
  const message = $('message');
  let ledger;
  let canPersist = true;

  function notify(text) {
    message.textContent = text;
  }

  function persist() {
    try {
      localStorage.setItem(key, ledger.exportBackup());
    } catch (error) {
      canPersist = false;
      notify('Stockage indisponible : exporte une sauvegarde pour ne pas perdre tes points.');
    }
  }

  function load() {
    try {
      const saved = localStorage.getItem(key);
      return GetAPoint.createLedger(saved ? saved : undefined);
    } catch (error) {
      canPersist = false;
      notify('Sauvegarde locale illisible ou inaccessible. Aucun fichier existant n’a été effacé.');
      return GetAPoint.createLedger();
    }
  }

  function friendlyDay(day) {
    const parts = day.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function render() {
    const today = GetAPoint.localDay();
    const current = ledger.snapshot(today);
    $('points').textContent = current.points.toLocaleString('fr-FR');
    $('streak').textContent = current.streak.toLocaleString('fr-FR');
    $('best-streak').textContent = current.bestStreak.toLocaleString('fr-FR');
    $('claim').disabled = current.claimedToday || Boolean(current.latest && current.latest > today);
    $('claim').textContent = current.claimedToday ? 'Point déjà récupéré' :
      current.latest && current.latest > today ? 'Horloge à vérifier' : '+1 point';
    $('milestone').textContent = current.nextMilestone === null
      ? 'Tous les objectifs atteints'
      : 'Prochain objectif : ' + current.nextMilestone + ' points';
    const previousMilestone = [...GetAPoint.MILESTONES].reverse().find(v => v <= current.points) || 0;
    const progress = current.nextMilestone === null ? 100 :
      100 * (current.points - previousMilestone) / (current.nextMilestone - previousMilestone);
    $('progress').style.width = Math.max(0, Math.min(100, progress)) + '%';
    $('progress-track').setAttribute('aria-valuenow', String(Math.round(progress)));
    $('badges').replaceChildren();
    for (const milestone of GetAPoint.MILESTONES) {
      const item = document.createElement('li');
      const unlocked = current.achievements.includes(milestone);
      item.className = unlocked ? 'badge achieved' : 'badge locked';
      item.textContent = milestone + (milestone === 1 ? ' point' : ' points') + (unlocked ? ' ✓' : '');
      $('badges').appendChild(item);
    }
    $('days').replaceChildren();
    for (const record of ledger.historyThrough(today, 35)) {
      const item = document.createElement('li');
      item.className = 'day' + (record.claimed ? ' claimed' : '') + (record.day === today ? ' today' : '');
      item.textContent = friendlyDay(record.day);
      item.title = record.day + (record.claimed ? ' : point obtenu' : ' : pas de point');
      item.setAttribute('aria-label', item.title);
      $('days').appendChild(item);
    }
  }

  ledger = load();

  $('claim').addEventListener('click', () => {
    const result = ledger.claim();
    if (result.accepted) {
      persist();
      notify('Point obtenu ! ' + (result.streak > 1 ? 'Série de ' + result.streak + ' jours.' : 'À demain pour le prochain.'));
    } else {
      notify(result.reason === 'clock-backward'
        ? 'La date de cet appareil précède une date déjà enregistrée. Vérifie l’horloge.'
        : 'Un seul point par jour. Reviens demain.');
    }
    render();
  });

  $('export').addEventListener('click', () => {
    const blob = new Blob([ledger.exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'get-a-point-sauvegarde.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Sauvegarde téléchargée. Conserve-la en lieu sûr.');
  });

  $('import').addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2_000_000) {
      notify('Fichier trop volumineux (2 Mo maximum).');
      return;
    }
    try {
      const content = await file.text();
      const next = GetAPoint.createLedger(ledger.exportBackup());
      next.mergeBackup(content);
      ledger = next;
      persist();
      render();
      notify('Sauvegarde importée et fusionnée. Aucun ancien jour supprimé.');
    } catch (error) {
      notify('Sauvegarde invalide. Aucun point n’a été modifié.');
    }
  });

  $('share').addEventListener('click', async () => {
    const snapshot = ledger.snapshot();
    const text = 'Get a Point : ' + snapshot.points + ' points, ' + snapshot.streak +
      ' jours de série en cours, record ' + snapshot.bestStreak + ' jours.';
    try {
      if (navigator.share) await navigator.share({ text });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        notify('Résumé copié dans le presse-papiers.');
      } else notify(text);
    } catch (error) {
      if (error.name !== 'AbortError') notify('Impossible de partager depuis ce navigateur.');
    }
  });

  window.setInterval(() => render(), 60000);
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  if (!canPersist) notify('Mode temporaire : le stockage local est indisponible. Pense à exporter les points.');
})();
