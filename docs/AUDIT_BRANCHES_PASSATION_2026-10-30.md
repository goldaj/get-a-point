# Audit GitHub et passation du 30 octobre 2026

## État des références
Branche active `main`. PR #1 et #2 déjà fusionnées.
- `chatgpt/review-20261024` : behind, ahead 0, behind 19. Historique intégré ; nettoyer la référence seulement après vérification des usages.
- `feat/offline-web-edition-20261029` : behind, ahead 0, behind 3. Historique intégré ; nettoyer la référence seulement après vérification des usages.

## Challenge fonctionnel
Vérifier le registre journalier et sa timezone, la prévention des doubles réclamations, le streak au passage à l'heure d'hiver, les export/import et la cohérence Android versus édition web hors ligne. La PWA et ses sauvegardes locales ne constituent pas un leaderboard partagé. Garder les secrets de signature hors du Git.

## Reprise
1. Lire `README.md`, `AGENTS.md`, `docs/WEB_EDITION.md` et `docs/CHATGPT_PROJECT_HISTORY.md`.
2. Exécuter tests web déterministes sur dates/horloges, tester PWA dans navigateur réel et build Android sur SDK compatible ; aucun de ces tests n'a été exécuté ici.
3. Ne pas ajouter de pubs, micropaiements ou migrations destructrices sans validation.

Audit documentaire de GitHub uniquement, aucune fusion ou modification de code. Les décisions de suppression requièrent vérification à jour des PR et branches.
