# Rapport des modifications Codex — À valider

## Copie de travail

Les modifications ont été réalisées uniquement dans :

`C:\Users\lborr\OneDrive\Bureau\GITHUB\li.la\cockpit-lancement-li.la-main-codex`

Le dossier original `cockpit-lancement-li.la-main` est resté intact.

## Trois fichiers modifiés

1. `lila-cockpit.html`
2. `lila-plan-operationnel.html`
3. `li-la-cockpit-backend.gs`

## Diff résumé par fichier

### `lila-cockpit.html`

- 238 insertions et 34 lignes remplacées ou retirées de la navigation précédente.
- Navigation principale ramenée aux cinq vues validées : Vue d'ensemble, Avant le 18 août, Après le 18 août, Décisions et retours, Documents.
- Synthèse prioritaire des blocages, prochaines actions, responsables, échéances, progression et go / no-go.
- 58 lignes détaillées conservées et regroupées par périodes ouvrables.
- Mise à jour partagée volontairement limitée au champ `statut`.
- Ancien planning, modules détaillés, repères et ancienne vue d'ensemble conservés et accessibles depuis Documents.

### `lila-plan-operationnel.html`

- 60 insertions et 10 lignes ciblées remplacées.
- Six retours validés de Linda intégrés.
- Prérequis indispensables replacés avant la commercialisation.
- Échéances des 31 juillet, 7 août, 12 août et 14 août intégrées.
- Go / no-go Linda + Laurence ajouté au 15 août.
- Feuille de route complète ajoutée du 18 août à mars 2027.
- Visio commune récurrente ajoutée en septembre.
- Les 11 missions et les 70 actions originales restent présentes ; le document contient désormais 117 actions.

### `li-la-cockpit-backend.gs`

- 241 insertions et aucune suppression.
- Nouvel onglet isolé `Pilotage opérationnel`.
- Source additive de 58 lignes : 15 bloquants, 6 décisions et retours, 37 actions post-lancement.
- Lecture du pilotage et mise à jour partagée du seul champ `statut`.
- Migration non destructive avec prévisualisation par défaut, contrôle des en-têtes, refus des conflits et détection des doublons.
- Aucun appel automatique à `setup()` par la migration.

## Fichiers non modifiés

- `lila-plan-communication.html` est strictement inchangé. Son empreinte SHA-256 reste `05CA97D60C962B271DEB232FF6FB9D223C60D46152718BB4C1C1D82F4D3E5B19`.
- Tous les autres fichiers du projet sont inchangés.
- Le logo, les pictogrammes, les couleurs et la charte générale sont inchangés.
- Le dossier original est inchangé.

## Tests réalisés

- Correspondance exacte des 58 identifiants entre le cockpit et le backend.
- Répartition vérifiée : 15 bloquants, 6 décisions et retours, 37 actions post-lancement.
- Répartition post-lancement vérifiée : 7 actions du 18 au 31 août, 8 en septembre, 5 en octobre, 5 en novembre, 6 en décembre et 6 de janvier à mars 2027.
- Présence vérifiée des cinq vues principales dans les onglets et dans la navigation latérale.
- Correspondance vérifiée entre les boutons de navigation et les fonctions d'affichage.
- Ouverture des périodes détaillées et gestionnaires de statut contrôlées statiquement.
- Tous les liens HTML locaux de la vue Documents pointent vers des fichiers présents dans le projet.
- Structure HTML statique contrôlée.
- Aucun problème d'espace ou de format détecté dans les diffs.
- Les 11 missions et les 70 actions initiales du plan opérationnel sont toujours présentes.
- La nouvelle migration ne contient aucune opération `clear`, `clearContent`, `deleteRow`, `deleteRows` ou `deleteSheet`.
- Les fonctions destructives existantes ont été comparées à l'original et sont inchangées.
- Aucune fonction Apps Script n'a été exécutée.

Le contrôle visuel automatisé n'a pas été lancé, car il aurait nécessité Node, explicitement interdit. Les tests de navigation ont été effectués statiquement sur les vues, liens et gestionnaires.

## Fonctions Apps Script à ne pas exécuter

Ne pas exécuter les fonctions existantes suivantes dans le cadre de cette migration :

- `setup()` : efface et réécrit l'onglet `Suivi`.
- `writeContenus_(list)` : efface puis réécrit les lignes de l'onglet `Contenus`.
- `upsertContenu_(c)` : peut réécrire une ligne de contenu existante.

Ne pas exécuter non plus directement les fonctions internes suffixées par `_` sans revue préalable.

## Procédure exacte de migration

### 1. Prévisualiser sans écrire

1. Intégrer le fichier `li-la-cockpit-backend.gs` dans une version de travail Apps Script, sans lancer `setup()`.
2. Sélectionner la fonction publique `previsualiserMigrationPilotageOperationnel`.
3. Exécuter cette fonction.
4. Vérifier dans la valeur retournée et dans le journal :
   - `mode: PREVISUALISATION` ;
   - `lignesSource: 58` ;
   - `ajoutsPrevus` ;
   - `doublonsIgnores` ;
   - `conflits` ;
   - `erreurs`.
5. Ne pas appliquer si `conflits` ou `erreurs` contient un élément.

La fonction `migrerPilotageOperationnel()` appelée sans argument réalise également une prévisualisation et n'écrit rien.

### 2. Appliquer explicitement après validation

1. Confirmer que la prévisualisation ne signale aucun conflit ni aucune erreur.
2. Sélectionner la fonction publique `appliquerMigrationPilotageOperationnel`.
3. Exécuter cette fonction une seule fois.
4. Contrôler le rapport retourné : `mode: APPLICATION`, nombre `ajoutes`, doublons ignorés et liste `idsAjoutes`.
5. Vérifier l'onglet `Pilotage opérationnel` : l'en-tête doit être présent et seules les lignes absentes doivent avoir été ajoutées.
6. Relancer ensuite la prévisualisation : `ajoutsPrevus` doit être égal à zéro si toutes les lignes existent déjà à l'identique.

La migration n'efface aucune donnée, ne supprime aucune ligne et ne réécrit aucune ligne existante.

## Déploiement

Aucun déploiement, commit, push ou intégration en production n'a été effectué.

