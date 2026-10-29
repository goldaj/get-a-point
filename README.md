# Get a Point

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

Développement Android/Java, création de MVP, structuration de dépôt, séparation de produits et gestion de branches Git.

## Sécurité

Ne pas versionner de keystore, mots de passe de signature, identifiants, tokens ni fichiers `.env`.

## Nouvelle édition web (29 octobre 2026)

Une version **web indépendante** du MVP Android est désormais disponible dans `web/index.html` : un point par jour, séries, records, objectifs, historique 35 jours, export/import des données locales et partage de statistiques. Pour la prévisualiser, ouvrir `web/index.html` dans son navigateur. Pour activer le service worker hors ligne et fiabiliser le stockage : `python -m http.server 8000` puis `http://localhost:8000/web/`. Aucun compte, backend ni donnée personnelle transmise.

- Guide : [`docs/WEB_EDITION.md`](docs/WEB_EDITION.md).
- Tests : `node --test tests/*.test.cjs` ; CI GitHub Actions.
- Les scores ne sont pas synchronisés avec l'application Android existante. Pas de classement en ligne ni de protection anti-triche serveur.
