# Get a Point — édition web locale (2026-10-29)

Une version web autonome s'ajoute à l'application Android native **sans modifier** cette dernière. Objectif : permettre de tester et d'utiliser immédiatement le jeu sur PC/mobile et préparer une PWA, sans Android Studio, backend, compte ou publicité.

## Démarrer

- Test immédiat : ouvrir `web/index.html`. La page fonctionne comme fichier local, même si certains navigateurs restreignent le stockage sur `file://`.
- Pour une utilisation fiable avec stockage local et service worker : depuis le dossier racine, lancer `python -m http.server 8000` et ouvrir `http://localhost:8000/web/` dans un navigateur.
- Sur navigateur compatible, le manifeste et le service worker permettent d'ajouter la page à l'écran d'accueil et de l'utiliser hors ligne après son premier chargement via localhost/HTTPS.
- Vérifier quotidiennement le bouton `+1 point`, le nombre de points, le streak, la grille, les objectifs et les commandes de sauvegarde.
- Tests automatisés sans installation : `node --test tests/*.test.cjs` (Node 18+).

## Contrat de jeu

`web/ledger.js` est un moteur JavaScript déterministe, sans dépendance ni accès réseau. Il accepte une date civile locale au format `YYYY-MM-DD`, vérifie sa validité, et autorise au maximum un point par date. Les jours consécutifs comptent pour la série ; un jour manqué casse la série mais conserve le total et le record. Un retour de l'horloge avant le dernier jour enregistré bloque les nouveaux points jusqu'à une date valide. Ce dispositif limite certaines erreurs, mais **n'est pas une sécurité contre la triche** : un utilisateur contrôle son navigateur et son horloge.

- `createLedger()` : crée une partie.
- `ledger.claim(day)` : obtient un point si la date est autorisée, renvoie un résultat avec `accepted` et `reason`.
- `ledger.snapshot(day)` : total, série courante, record, dernier jour et objectifs.
- `ledger.historyThrough(day, count)` : dates et cases cochées, la plus ancienne d'abord.
- `ledger.exportBackup()` : export JSON `{ "format_version": 1, "history": ["2026-10-29"] }`.
- `ledger.mergeBackup(json)` : fusion **non destructive** des dates du backup et des dates locales, contrôle de format avant de remplacer l'état.

Les objectifs automatiques sont 1, 7, 30, 100, 365, puis 1000 points. Tous les points sont basés sur les journées enregistrées, pas sur des achats.

## Données et confidentialité

La page stocke les dates des points dans `localStorage` sur cet appareil, pas sur un serveur. Le bouton Exporter télécharge `get-a-point-sauvegarde.json`. Le bouton Importer fusionne les dates du JSON validé, sans effacer les jours précédents. Le bouton Partager ne transmet que les statistiques choisies vers l'API native de partage du navigateur ou copie un résumé dans le presse-papiers.

**Limite importante** : aucune synchronisation automatique avec l'application Android historique. Les préférences Android `get_a_point` et la sauvegarde JSON web sont deux formats indépendants. Le nombre de points web n'est ni un classement public ni une preuve d'activité Android.

Les données sont locales et non chiffrées : protéger le fichier exporté, ne pas pousser de sauvegarde réelle dans Git. Une erreur de stockage du navigateur est signalée, mais un historique perdu avant export n'est pas récupérable. Utiliser un contexte de navigateur normal pour conserver les données.

## Architecture

- `web/index.html` : interface adaptable et accessible.
- `web/ledger.js` : logique pure et portable, sans DOM.
- `web/app.js` : DOM, localStorage, import/export et partage.
- `web/sw.js` : mise en cache de l'interface pour fonctionnement hors ligne.
- `web/manifest.webmanifest` et `web/icon.svg` : identité de l'application.
- `tests/web-ledger.test.cjs` et `.github/workflows/web-tests.yml` : suite de régression et CI.

## Passation Codex

1. Lire `AGENTS.md`, `README.md` et `docs/CHATGPT_PROJECT_HISTORY.md`, puis ce document. Branche initiale `feat/offline-web-edition-20261029`.
2. Exécuter `node --test tests/*.test.cjs` et vérifier les tests GitHub Actions.
3. Tester réellement la page sur Chrome/Firefox desktop et Chrome Android : premier claim, rafraîchissement, rechargement, changement de date, 35 jours, erreurs d'import, partage, navigation hors ligne et petites résolutions d'écran.
4. Ajouter un écran de statistiques annuelles et des objectifs personnalisables, avec tests unitaires, si l'expérience utilisateur est validée.
5. Envisager un pont **explicite et optionnel** entre les données Android SharedPreferences et le JSON web, avec code de migration testé et sauvegarde avant migration.
6. Pour un vrai leaderboard multi-utilisateur, concevoir identité, sécurité, anti-triche serveur, conformité RGPD et coût d'exploitation séparément ; ne pas prétendre qu'un classement local est mondial.
7. Améliorer la gestion des mises à jour du service worker et ajouter des icônes PNG haute résolution pour compatibilité PWA plus large.

Les premiers tests automatisés ont passé la CI sur GitHub Actions ; la validation manuelle sur navigateur/appareil reste à réaliser. Ne pas présenter un usage Android réel comme déjà testé.
