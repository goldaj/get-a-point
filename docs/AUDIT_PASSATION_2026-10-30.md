# Audit contradictoire GitHub — goldaj/get-a-point (2026-10-30)

Lecture des branches, PR, arborescence et README ; aucune exécution locale ni test de paiement.

## Branches
Référence `main` : `7bacb02d8b41531529bb0ee18ec557fc5f7306d3`.
- `chatgpt/review-20261024` : behind ; 0 commit(s) exclusif(s), 17 commit(s) de retard. Candidate au nettoyage après vérification des refs/PR.
- `feat/offline-web-edition-20261029` : behind ; 0 commit(s) exclusif(s), 1 commit(s) de retard. Candidate au nettoyage après vérification des refs/PR.

## PR
- [#2](https://github.com/goldaj/get-a-point/pull/2) — closed, fusionnée : feat: playable offline web edition with daily points, streaks and backups
- [#1](https://github.com/goldaj/get-a-point/pull/1) — closed, fusionnée : [ChatGPT] Réclamer un nouveau point après minuit sans relancer l'app

## Inventaire
`.github`, `.gitignore`, `AGENTS.md`, `README.md`, `app`, `build.gradle`, `docs`, `gradle.properties`, `settings.gradle`, `tests`, `web`.

README : # Get a Point

**Prototype Android natif | Java · Gradle · Android SDK**

Get a Point est une application Android expérimentale conçue comme un petit MVP autonome. Le code source a été extrait de sa propre branche de développement dans [FishingGame](https://github.com/goldaj/fishinggame), puis isolé ici afin de permettre une évolution indépendante du jeu de pêche.

## Ce que contient le dépôt

- Une activité Android Java (`MainActivity`) et le manifeste de l'application.
- Une configuration Gradle Android distincte.
- Un prototype fonctionnel qui n'est pas présenté comme un produit publié sur le Play Store.

## Démarrage

1. Ouvrir le dossier avec **Android Studio** (SDK Android installé).
2. Synchroniser les fichiers Gradle.
3. Sélectionner un émulateur ou un terminal Android puis lancer `app`.

## Origine et état

Sources issues de la branche `chatgpt/get-a-point-20260902` du dépôt `goldaj/fishinggame`. Il s'agit d'un **MVP / projet en cours**, séparé du produit principal pour faciliter les contributions et la maintenance.

## Compétences illustrées

Développement Android/Java, création de MVP, structuration de dépôt, séparation de produits et gestion de branc

## Questions de sécurité et d'équilibrage
1. Vérifier la logique « 1 point/jour » en cas de changement de fuseau, heure système et de jour de passage DST ; aucune sécurité serveur ne doit être présumée si mode offline.
2. Vérifier streak, leaderboard, désynchronisation et conservation de sauvegarde après rechargement ou réinstallation.
3. Ne pas brancher paiement, publicité ou score global sans règle anti-triche et politiques de confidentialité, consentement et limites.
4. Mesurer l'expérience de progression pour détecter un jeu trivial ou frustrant, sans revendiquer un équilibrage prouvé.
5. Confirmer tests/CI avant publication ; deux branches antérieures sont absorbées dans `main` et ne justifient pas de PR doublon.
