# Li·La — Suite de pilotage interne

Outils internes de Linda & Laurence pour piloter le BUILD de Li·La.
À NE PAS confondre avec le produit vendu aux agents (app-li-la.netlify.app).

## Fichiers

| Fichier | Rôle | Déployé où |
|---|---|---|
| index.html | Cockpit de pilotage — 26 modules, avancement | Netlify (racine) |
| lila-accueil-mobile.html | Hub mobile — démo, landing, cockpit, liens | Netlify |
| lila-contenus.html | Kit de contenus — les posts | Netlify |
| lila-plan-communication.html | Calendrier daté des posts | Netlify |
| lila-business-plan.html | Business plan | Netlify |
| lila-plan-route-developpement.html | Plan de route dev | Netlify |
| lila-veille-prospection.html | Veille & prospection | Netlify |
| lila-charges.html | Charges & économie | Netlify |
| lila-logo.png / lila-logo-transparent.png | Logos (le Hub les référence) | Netlify (racine) |
| lila-picto.png | Pictogramme 3 pastilles | Netlify (racine) |
| li-la-cockpit-backend.gs | Back-end Apps Script | ⚠️ PAS Netlify — voir ci-dessous |

## Back-end (Google Apps Script + Sheet)

Sheet : li-la-cockpit-backend
URL /exec : https://script.google.com/macros/s/AKfycbyGPJFjP_c-B2JZ38R9yzm5kRAsoXcd_-aMyNhhyh2JgHsVv1dNu7WUAE6wrJq_IQTdDQ/exec

3 onglets : Suivi (26 modules + statuts) · Liens (hub mobile) · Contenus (les posts).

### Redéployer le .gs après modification
1. Sheet > Extensions > Apps Script > coller li-la-cockpit-backend.gs (remplacer tout)
2. Fonction `setup` > Exécuter (crée/actualise les onglets)
3. Déployer > Gérer les déploiements > crayon (modifier) > Nouvelle version > Déployer
4. L'URL /exec ne change pas.

⚠️ setup() réécrit l'onglet Suivi (clear + 26 modules). À lancer avant de cocher des statuts réels.

## Brancher (une fois)
Cockpit déployé > champ « Brancher » en haut > coller l'URL /exec.
Kit et mobile utilisent automatiquement la même URL.

## Redéployer le site
Déposer tout à la racine du repo GitHub relié à Netlify > commit > push.
Le .gs peut rester sur le repo (archive de la dernière version, non servi par Netlify).
