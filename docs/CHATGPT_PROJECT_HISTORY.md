# Contexte ChatGPT pour Get a Point

**Initialisé le 2026-10-24. Couverture : partielle, sauf les sources originales référencées explicitement.** Codex doit lire ce fichier après `AGENTS.md` et avant toute reprise du projet. Une mémoire reconstruite n'est pas la totalité du chat.

## Projet confirmé par le dépôt
- Dépôt : `goldaj/get-a-point`.
- Objet : MVP expérimental Android natif Java/Gradle, isolé du projet Fishinggame depuis la branche historique `chatgpt/get-a-point-20260902`.
- Contraintes : Maintenir l'autonomie du dépôt par rapport à Fishinggame, éviter de réimporter des secrets de signature ou une dépendance accidentelle au jeu d'origine. Ne pas prétendre que le MVP est publié sur le Play Store.
- Validation : Ouvrir avec Android Studio, synchroniser Gradle et lancer l'application sur appareil/émulateur ; ne pas affirmer qu'un build a eu lieu sans exécution.

## Échanges attestés ou sources à lire

2026-09-02 — Échange d'origine cité par la branche Git `chatgpt/get-a-point-20260902` dans README (aucun verbatim/horodatage de message récupéré).

2026-10-18 — Assistant, résumé reconstruit, non verbatim : séparation des projets dans des dépôts autonomes, sans écraser l'historique d'origine.

2026-10-24 — Utilisateur (verbatim, heure non vérifiable) : « je te demande de lire mes repo git où tu es le dernier utilisateur, de rajouter un AGENTS.md pertinent s'il n'y en a pas. Mais en plus, tu rajoutera un document repérable par codex (peut être le référencer dans le AGENTS.md justement ?) où tu mets l'intégralité de nos échanges liés à ce projet. Mes questions, tes réponses (de sorte à les différencier) et les horodatages si tu les as. »

## Limites de couverture, fidélité et mise à jour
- Les passages marqués `verbatim` sont des extraits exacts disponibles dans le contexte ; les résumés ne doivent **jamais** être cités comme du dialogue mot pour mot. Aucune réponse complète de l'assistant n'a été inventée.
- Pour obtenir l'intégralité des questions, réponses et horodatages : intégrer un export authentique des conversations pertinentes ; conserver l'ordre et le rôle des messages, et expurger avant publication les éléments sensibles et hors projet.
- En intervention future, ajouter en bas les nouveaux dialogues sourcés et les décisions vérifiées, sans effacer les entrées précédentes. Ce journal et `AGENTS.md` sont versionnés dans Git.

## 2026-10-24 — Correction fonctionnelle sur branche ChatGPT

**Utilisateur (résumé reconstruit, non verbatim, heure non attestée)** : demande de privilégier les corrections et les fonctionnalités inachevées plutôt que la seule structure.

**Assistant (résumé reconstruit, non verbatim)** : un joueur qui gardait l'application ouverte après minuit ne pouvait plus réclamer le nouveau point du jour, car `claimedToday` était figé au lancement. Désormais, les interactions, le rendu et le bouton de réclamation actualisent le jour et la série. Branche `chatgpt/review-20261024`, aucune fusion directe. Le build Android est vérifié par CI; le passage de minuit reste à tester manuellement sur appareil.

## Intervention 2026-10-29 — web offline MVP

- Utilisateur (verbatim, heure exacte indisponible) : « Continue en boucle de chercher de nouveaux sujets ».
- Assistant (résumé reconstruit, non verbatim) : après développement d'un nouveau workflow pour `novel-writing-toolkit`, sélection de `get-a-point` pour apporter une édition web jouable immédiatement sans Android Studio.
- Livrables : `web/ledger.js` (règles jeu), `web/index.html` + `web/app.js` (interface, historique, sauvegarde), `web/sw.js`/manifest/icône (hors ligne), `tests/web-ledger.test.cjs`, GitHub Actions et `docs/WEB_EDITION.md`.
- Première exécution GitHub Actions : succès à https://github.com/goldaj/get-a-point/actions/runs/40846431043 ; vérifier les exécutions ultérieures et le HEAD avant fusion.
- Limitations non résolues : aucun test manuel de navigateur/téléphone ni build Android exécuté ; pas de synchronisation, classement ou validation anti-triche par un serveur. Les données de jeu Android existantes restent inchangées.
