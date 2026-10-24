# AGENTS.md — Get a Point

## Avant de travailler
1. Lire `README.md` et les documents techniques pertinents, puis **`docs/CHATGPT_PROJECT_HISTORY.md`** pour les demandes, décisions et lacunes du contexte.
2. MVP expérimental Android natif Java/Gradle, isolé du projet Fishinggame depuis la branche historique `chatgpt/get-a-point-20260902`.
3. Maintenir l'autonomie du dépôt par rapport à Fishinggame, éviter de réimporter des secrets de signature ou une dépendance accidentelle au jeu d'origine. Ne pas prétendre que le MVP est publié sur le Play Store.

## Exécution et vérification
- Ouvrir avec Android Studio, synchroniser Gradle et lancer l'application sur appareil/émulateur ; ne pas affirmer qu'un build a eu lieu sans exécution.
- Utiliser de petites modifications contrôlables. Ne pas écraser ni supprimer des fichiers ou anciennes versions sans demande explicite.
- Distinguer hypothèses, code présent, essais effectivement exécutés et éléments encore à valider.

## Passation à Codex et archivage permanent
- **Document de référence de la conversation :** `docs/CHATGPT_PROJECT_HISTORY.md` ; il peut être incomplet et le dit explicitement.
- Après chaque intervention, mettre à jour ce document si une décision, une contrainte, une étape ou un nouveau contexte pertinent change. Référencer les nouveaux messages de l'utilisateur et de l'assistant lorsque leur texte exact est accessible.
- Format : date ISO et fuseau si connus, rôle `Utilisateur` ou `Assistant`, mention `verbatim` seulement pour un texte exact. Sinon `résumé reconstruit, non verbatim`. Ne pas inventer d'heure ni de citation.
- Si l'historique intégral n'est pas disponible, le signaler et demander un export réel plutôt que fabriquer une transcription. Préserver les exports existants sans les réécrire.
- Exclure secrets, identifiants, données personnelles et contenus non destinés à la publication. Le niveau de visibilité de ce dépôt s'applique aussi aux documents ajoutés.
