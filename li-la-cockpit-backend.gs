/**
 * Li·La — Back-end du Cockpit de pilotage (v2 — contenu complet)
 *
 * L'onglet "Suivi" contient MAINTENANT tout le contenu du plan :
 * les 26 modules avec titre, pôle, échéance, charge, nombre de tâches, statut.
 * Tu peux lire et modifier le statut directement dans Google Sheets,
 * et le cockpit lit/écrit dans ces mêmes lignes.
 *
 * MISE EN PLACE (une seule fois) :
 * 1. Extensions > Apps Script > colle ce fichier (remplace tout).
 * 2. Lance la fonction `setup` une fois (crée + pré-remplit les onglets).
 * 3. Déployer > Gérer les déploiements > modifier > Nouvelle version.
 * 4. L'URL /exec ne change pas. Colle-la dans le cockpit (bouton Brancher).
 */

var ONGLET = 'Suivi';
var ONGLET_LIENS = 'Liens';
var ONGLET_CONTENUS = 'Contenus';
var ENTETE_CONTENUS = ['id','date','canal','format','titre','texte','etape','valide_linda','valide_laurence','lien_photo','maj_le'];
var ONGLET_PILOTAGE = 'Pilotage opérationnel';
var ENTETE_PILOTAGE = ['pilotage_id','type','periode','titre','retour_brut','decision','statut','responsable','echeance','blocage','prochaine_action','source','cree_le','maj_le'];

/* Source additive du pilotage. Aucune de ces lignes ne remplace une ligne existante. */
var PILOTAGE_SOURCE = [
  ["BLOC-001","bloquant","Avant le 18 août","Périmètre exact de Li.La Essentiel","","","a_faire","Linda + Laurence","2026-07-31","Fonctions incluses et exclues non encore formalisées","Valider une fiche de périmètre Essentiel unique","Cadrage commercialisation 18 août"],
  ["BLOC-002","bloquant","Avant le 18 août","Périmètre des offres complémentaires","","","a_faire","Linda + Laurence","2026-07-31","Frontières entre les offres à verrouiller","Valider la matrice des fonctions par offre","Cadrage commercialisation 18 août"],
  ["BLOC-003","bloquant","Avant le 18 août","Validation définitive des tarifs","","","a_faire","Linda + Laurence","2026-07-31","Arbitrage final des prix et options","Signer la grille tarifaire définitive","Retour Linda — tarifs"],
  ["BLOC-004","bloquant","Avant le 18 août","CGV prêtes","","","a_faire","Linda + Laurence","2026-08-07","Version juridiquement exploitable à finaliser","Valider la version prête à publier des CGV","Retour Linda — prérequis obligatoires"],
  ["BLOC-005","bloquant","Avant le 18 août","Contrat prêt","","","a_faire","Linda + Laurence","2026-08-07","Clauses et circuit de signature à confirmer","Valider le contrat et son mode de signature","Retour Linda — prérequis obligatoires"],
  ["BLOC-006","bloquant","Avant le 18 août","Politique de confidentialité et informations RGPD prêtes","","","a_faire","Linda + Laurence","2026-08-07","Informations de traitement et responsabilités à consolider","Valider les textes de confidentialité et le cadre RGPD","Retour Linda — prérequis obligatoires"],
  ["BLOC-007","bloquant","Avant le 18 août","Paiement et facturation testés","","","a_faire","Laurence","2026-08-12","Parcours réel de paiement et de facturation non validé de bout en bout","Réaliser un paiement test avec facture vérifiée","Retour Linda — prérequis obligatoires"],
  ["BLOC-008","bloquant","Avant le 18 août","Compte client et souscription testés","","","a_faire","Laurence","2026-08-12","Activation et droits après souscription à confirmer","Tester la création de compte jusqu'à l'accès à l'offre","Retour Linda — prérequis obligatoires"],
  ["BLOC-009","bloquant","Avant le 18 août","Onboarding testé","","","a_faire","Linda + Laurence","2026-08-12","Parcours d'installation complet non validé par un cas réel","Faire exécuter l'onboarding complet par une testeuse","Stabilisation avant commercialisation"],
  ["BLOC-010","bloquant","Avant le 18 août","Support défini","","","a_faire","Linda + Laurence","2026-08-07","Canal, délai de réponse et responsabilités à formaliser","Valider la procédure de support de premier niveau","Cadrage commercialisation 18 août"],
  ["BLOC-011","bloquant","Avant le 18 août","Fonctions vendues stables","","","a_faire","Laurence","2026-08-14","Le périmètre vendu doit passer tous les tests critiques","Exécuter la recette finale du périmètre vendu","Retour Linda — stabilisation produit"],
  ["BLOC-012","bloquant","Avant le 18 août","Absence de bug bloquant","","","a_faire","Laurence","2026-08-14","Tout incident empêchant achat, accès ou usage bloque le lancement","Clore ou contourner chaque bug classé bloquant","Retour Linda — stabilisation produit"],
  ["BLOC-013","bloquant","Avant le 18 août","Page de vente prête","","","a_faire","Linda","2026-08-07","Promesse, offres, tarifs et appels à l'action à aligner","Valider la page de vente avec les offres définitives","Cadrage commercialisation 18 août"],
  ["BLOC-014","bloquant","Avant le 18 août","Démonstration prête","","","a_faire","Linda + Laurence","2026-08-07","Scénario de démonstration et environnement stable à confirmer","Répéter une démonstration complète chronométrée","Cadrage commercialisation 18 août"],
  ["BLOC-015","bloquant","Avant le 18 août","Décision go / no-go le 15 août","","","a_faire","Linda + Laurence","2026-08-15","La commercialisation reste interdite si un bloquant critique est ouvert","Tenir la revue go / no-go et consigner la décision","Jalon de décision"],

  ["DEC-001","decision_retour","Décisions et retours","Plan de communication","Validé.","Conserver sans modification globale.","valide","Linda + Laurence","2026-07-16","Aucun blocage signalé","Contrôler l'exécution du calendrier validé","Retour Linda"],
  ["DEC-002","decision_retour","Décisions et retours","Jalons jusqu'au 18 août","Validés.","Conserver le calendrier et le déroulé.","valide","Linda + Laurence","2026-07-16","Aucun blocage signalé","Reporter les jalons validés dans le pilotage opérationnel","Retour Linda"],
  ["DEC-003","decision_retour","Décisions et retours","Stabilisation du produit","Doit être suffisante avant le 18 août.","Le périmètre vendu doit être testé et stable avant la commercialisation.","en_cours","Laurence","2026-08-14","Recette complète du périmètre vendu à terminer","Piloter la recette finale jusqu'à zéro bug bloquant","Retour Linda"],
  ["DEC-004","decision_retour","Décisions et retours","Tarifs","Doivent être prêts avant le 18 août.","Verrouiller les offres et tarifs avant la vente.","a_faire","Linda + Laurence","2026-07-31","Grille définitive non signée","Valider ensemble la grille offres et tarifs","Retour Linda"],
  ["DEC-005","decision_retour","Décisions et retours","CGV, contrats, comptes et paiement","Obligatoires avant commercialisation.","Éléments bloquants pour le go / no-go.","a_faire","Linda + Laurence","2026-08-12","Plusieurs prérequis juridiques et techniques restent à valider","Réunir les preuves de validation pour la revue go / no-go","Retour Linda"],
  ["DEC-006","decision_retour","Décisions et retours","Septembre","Organiser une visio commune récurrente.","Intégrer cette action au plan après lancement.","a_faire","Linda + Laurence","2026-09-01","Créneau et fréquence non définis","Fixer le créneau récurrent Linda + Laurence","Retour Linda"],

  ["POST-202608-001","action_post_lancement","18 au 31 août","Premières installations","","","a_faire","Laurence","2026-08-31","Dépend du go commercial du 15 août","Planifier les premières installations clientes","Feuille de route post-lancement"],
  ["POST-202608-002","action_post_lancement","18 au 31 août","Accompagnement rapproché","","","a_faire","Linda + Laurence","2026-08-31","Disponibilités d'accompagnement à réserver","Définir le rythme de suivi des premières clientes","Feuille de route post-lancement"],
  ["POST-202608-003","action_post_lancement","18 au 31 août","Correction des incidents","","","a_faire","Laurence","2026-08-31","Les incidents critiques doivent être traités en priorité","Ouvrir un registre unique des incidents de lancement","Feuille de route post-lancement"],
  ["POST-202608-004","action_post_lancement","18 au 31 août","Mesure du temps d'installation","","","a_faire","Laurence","2026-08-31","Mesure homogène à mettre en place","Chronométrer chaque installation de bout en bout","Feuille de route post-lancement"],
  ["POST-202608-005","action_post_lancement","18 au 31 août","Suivi du support","","","a_faire","Linda + Laurence","2026-08-31","Demandes à centraliser","Consigner chaque demande et son temps de traitement","Feuille de route post-lancement"],
  ["POST-202608-006","action_post_lancement","18 au 31 août","Contrôle du coût IA","","","a_faire","Laurence","2026-08-31","Coût réel par usage encore inconnu","Mesurer la consommation IA des premiers comptes","Feuille de route post-lancement"],
  ["POST-202608-007","action_post_lancement","18 au 31 août","Collecte des premières objections","","","a_faire","Linda","2026-08-31","Retours commerciaux à structurer","Consigner chaque objection dans une liste partagée","Feuille de route post-lancement"],

  ["POST-202609-001","action_post_lancement","Septembre","Visio commune récurrente Linda + Laurence","","","a_faire","Linda + Laurence","2026-09-01","Créneau récurrent à arrêter","Créer l'invitation récurrente commune","Retour Linda"],
  ["POST-202609-002","action_post_lancement","Septembre","Démonstration Li.La","","","a_faire","Linda + Laurence","2026-09-30","Démonstration à adapter aux retours d'août","Mettre à jour le scénario de démonstration Li.La","Feuille de route post-lancement"],
  ["POST-202609-003","action_post_lancement","Septembre","Présentation distincte de Li.La by La Maison d'AVA","","","a_faire","Linda","2026-09-30","Positionnement distinct à clarifier","Préparer une présentation dédiée à La Maison d'AVA","Feuille de route post-lancement"],
  ["POST-202609-004","action_post_lancement","Septembre","FAQ","","","a_faire","Linda + Laurence","2026-09-30","Questions réelles à consolider","Transformer les questions d'août en FAQ","Feuille de route post-lancement"],
  ["POST-202609-005","action_post_lancement","Septembre","Réponses aux objections","","","a_faire","Linda","2026-09-30","Argumentaire à partir des objections réelles","Rédiger une réponse validée pour chaque objection récurrente","Feuille de route post-lancement"],
  ["POST-202609-006","action_post_lancement","Septembre","Premiers témoignages validés","","","a_faire","Linda","2026-09-30","Accord explicite des clientes nécessaire","Demander la validation écrite du premier témoignage","Feuille de route post-lancement"],
  ["POST-202609-007","action_post_lancement","Septembre","Optimisation du tunnel de vente","","","a_faire","Linda + Laurence","2026-09-30","Données de conversion à collecter","Identifier la principale rupture du tunnel","Feuille de route post-lancement"],
  ["POST-202609-008","action_post_lancement","Septembre","Amélioration de l'onboarding","","","a_faire","Laurence","2026-09-30","Points de friction à prioriser","Corriger le principal point de friction d'installation","Feuille de route post-lancement"],

  ["POST-202610-001","action_post_lancement","Octobre","Acquisition régulière","","","a_faire","Linda","2026-10-31","Canal reproductible à confirmer","Choisir le canal d'acquisition prioritaire","Feuille de route post-lancement"],
  ["POST-202610-002","action_post_lancement","Octobre","Cas client","","","a_faire","Linda + Laurence","2026-10-31","Résultats documentés nécessaires","Sélectionner le premier cas client publiable","Feuille de route post-lancement"],
  ["POST-202610-003","action_post_lancement","Octobre","Recommandation et partenariats","","","a_faire","Linda","2026-10-31","Proposition partenaire à formaliser","Définir une première offre de recommandation","Feuille de route post-lancement"],
  ["POST-202610-004","action_post_lancement","Octobre","Amélioration de l'assistant d'installation","","","a_faire","Laurence","2026-10-31","Retours d'onboarding à intégrer","Prioriser l'amélioration la plus fréquente","Feuille de route post-lancement"],
  ["POST-202610-005","action_post_lancement","Octobre","Analyse des conversions par offre","","","a_faire","Linda + Laurence","2026-10-31","Suivi par offre à fiabiliser","Construire le tableau des conversions par offre","Feuille de route post-lancement"],

  ["POST-202611-001","action_post_lancement","Novembre","Industrialisation de l'installation","","","a_faire","Laurence","2026-11-30","Temps d'installation encore variable","Formaliser le parcours d'installation standard","Feuille de route post-lancement"],
  ["POST-202611-002","action_post_lancement","Novembre","Standardisation du support","","","a_faire","Linda + Laurence","2026-11-30","Réponses et niveaux d'escalade à formaliser","Créer la procédure standard de support","Feuille de route post-lancement"],
  ["POST-202611-003","action_post_lancement","Novembre","Contrôle des droits Google","","","a_faire","Laurence","2026-11-30","Droits trop larges possibles","Auditer les autorisations Google réellement nécessaires","Feuille de route post-lancement"],
  ["POST-202611-004","action_post_lancement","Novembre","Suivi des quotas et coûts API","","","a_faire","Laurence","2026-11-30","Seuils d'alerte à définir","Mettre en place les seuils de suivi par offre","Feuille de route post-lancement"],
  ["POST-202611-005","action_post_lancement","Novembre","Procédures de sécurité et de reprise","","","a_faire","Laurence","2026-11-30","Procédure de reprise non documentée","Rédiger le scénario de reprise prioritaire","Feuille de route post-lancement"],

  ["POST-202612-001","action_post_lancement","Décembre","Marge réelle","","","a_faire","Linda + Laurence","2026-12-31","Coûts complets à consolider","Calculer la marge réelle par offre","Feuille de route post-lancement"],
  ["POST-202612-002","action_post_lancement","Décembre","Coût du support","","","a_faire","Linda + Laurence","2026-12-31","Temps de support à valoriser","Calculer le coût mensuel du support","Feuille de route post-lancement"],
  ["POST-202612-003","action_post_lancement","Décembre","Coût IA par offre","","","a_faire","Laurence","2026-12-31","Consommation à rattacher aux offres","Calculer le coût IA moyen de chaque offre","Feuille de route post-lancement"],
  ["POST-202612-004","action_post_lancement","Décembre","Taux de conversion","","","a_faire","Linda","2026-12-31","Sources commerciales à consolider","Calculer le taux de conversion du trimestre","Feuille de route post-lancement"],
  ["POST-202612-005","action_post_lancement","Décembre","Taux de résiliation","","","a_faire","Linda + Laurence","2026-12-31","Motifs de sortie à documenter","Analyser chaque résiliation et son motif","Feuille de route post-lancement"],
  ["POST-202612-006","action_post_lancement","Décembre","Modules réellement utilisés et décisions de maintien, modification ou suppression","","","a_faire","Linda + Laurence","2026-12-31","Usage réel à comparer au coût","Décider du sort de chaque module à partir des usages","Feuille de route post-lancement"],

  ["POST-2027Q1-001","action_post_lancement","Janvier à mars 2027","Duplication pour de nouveaux profils immobiliers","","","a_faire","Linda + Laurence","2027-03-31","Modèle commercial à valider avant duplication","Choisir le premier profil immobilier à tester","Feuille de route post-lancement"],
  ["POST-2027Q1-002","action_post_lancement","Janvier à mars 2027","Amélioration de la PWA","","","a_faire","Laurence","2027-03-31","Priorités issues des usages à établir","Sélectionner l'amélioration PWA la plus utile","Feuille de route post-lancement"],
  ["POST-2027Q1-003","action_post_lancement","Janvier à mars 2027","Onboarding plus autonome","","","a_faire","Laurence","2027-03-31","Dépend des mesures d'installation","Définir le prochain palier d'autonomie de l'onboarding","Feuille de route post-lancement"],
  ["POST-2027Q1-004","action_post_lancement","Janvier à mars 2027","Partenariats","","","a_faire","Linda","2027-03-31","Partenaires prioritaires à qualifier","Contacter le premier partenaire qualifié","Feuille de route post-lancement"],
  ["POST-2027Q1-005","action_post_lancement","Janvier à mars 2027","Nouveaux cas clients","","","a_faire","Linda + Laurence","2027-03-31","Accords clients nécessaires","Sélectionner un nouveau cas client documentable","Feuille de route post-lancement"],
  ["POST-2027Q1-006","action_post_lancement","Janvier à mars 2027","Pas de priorité App Store ou Google Play tant que le modèle commercial n'est pas validé","","","a_faire","Linda + Laurence","2027-03-31","Risque de détourner l'effort avant validation commerciale","Maintenir la priorité sur la validation du modèle commercial","Décision de priorisation" ]
];

/* Les 26 modules du plan — source de vérité pré-remplie dans le Sheet.
   Colonnes : module_id, code, pole, titre, sous_titre, responsable,
   echeance, semaine, phase, charge_jours, nb_taches, statut */
var MODULES = [
  ["c1","C1","Développement technique","Socle données","Google Sheets (< 100 adhérents) → Supabase ensuite","Laurence","2026-07-05","30 juin → 5 juil.","Build",3,6,"avenir"],
  ["c2","C2","Développement technique","Proxy IA + quotas","Apps Script : clé serveur, routage, décompte, plafond","Laurence","2026-07-12","6 → 12 juil.","Build",3,9,"avenir"],
  ["c3","C3","Développement technique","Identification & Freemium","Accès par mail, interface verrouillée, vitrines factices","Laurence","2026-07-12","6 → 12 juil.","Build",2,6,"avenir"],
  ["c4","C4","Développement technique","Lila Office","Boîte mail + CRM (offre 19€)","Laurence","2026-07-19","13 → 19 juil.","Build",4,5,"avenir"],
  ["c5","C5","Développement technique","Lila Carnet","Notes + mémo vocal (offre 19€ / base)","Laurence","2026-07-19","13 → 19 juil.","Build",3,7,"avenir"],
  ["c6","C6","Développement technique","Li·La Com'","Création de contenu réseaux sociaux — niveau 39€ à confirmer avec la grille tarifaire","Laurence","2026-07-26","20 → 26 juil.","Build",3,4,"avenir"],
  ["c7","C7","Développement technique","Li·La Com'+","Image avancée, prompts archi/BTP","Laurence","2026-07-31","27 → 31 juil.","Build",2,5,"avenir"],
  ["c8","C8","Développement technique","Hub Li·La by La Maison d'AVA","Veille, mémo vocal, questions IA et formations réservés aux membres — accès indépendant de Li.La Essentiel","Laurence","2026-07-26","20 → 26 juil.","Build",1,4,"avenir"],
  ["c9","C9","Développement technique","Paiement","Stripe Li.La Essentiel 19€ — accès indépendant de l'adhésion AVA, prêt avant le 18 août","Laurence","2026-08-09","3 → 9 août","Pré-lancement",2,6,"avenir"],
  ["c10","C10","Développement technique","PWA / Landing / Domaine / RGPD","Coque, page web, déploiement, conformité","Laurence","2026-07-31","27 → 31 juil.","Build",2,8,"avenir"],
  ["b1","B1","Business plan & cadre","Offres & tarifs","Adhésion AVA et Essentiel 19€ indépendants ; niveaux 39€ et 59€ à valider","Linda + Laurence","2026-07-19","13 → 19 juil.","Build",0.5,5,"avenir"],
  ["b2","B2","Business plan & cadre","Coûts & répartition 50/50","Charges communes + clé de répartition","Linda + Laurence","2026-07-26","20 → 26 juil.","Build",0.5,4,"avenir"],
  ["b3","B3","Business plan & cadre","Encaissement (Stripe)","Compte dédié, une entité encaisse et reverse","Linda + Laurence","2026-08-09","3 → 9 août","Pré-lancement",1,4,"avenir"],
  ["b4","B4","Business plan & cadre","Cadre juridique","Accord 50/50 écrit, pas d'entité dédiée","Linda + Laurence","2026-07-26","20 → 26 juil.","Build",1,3,"avenir"],
  ["b5","B5","Business plan & cadre","Plan de tests internes","Linda + Laurence — tout doit tourner au 18 août","Linda + Laurence","2026-08-09","3 → 9 août","Pré-lancement",1,5,"avenir"],
  ["p1","P1","Prospection & veille","Cibler & qualifier les prospects","Définir qui on vise et construire la liste","Linda + Laurence","2026-07-19","13 → 19 juil.","Build",1,6,"avenir"],
  ["p2","P2","Prospection & veille","Sourcing & collecte","Scraping de données publiques B2B, encadré RGPD","Linda + Laurence","2026-07-26","20 → 26 juil.","Build",1.5,6,"avenir"],
  ["p3","P3","Prospection & veille","Veille concurrentielle","Berthoud, Limova et autres","Linda + Laurence","2026-08-30","18 → 30 août","Lancement",0.5,5,"avenir"],
  ["p4","P4","Prospection & veille","Veille marché & outils","IA immo, ALUR, outils","Linda + Laurence","2026-08-30","18 → 30 août","Lancement",0.5,4,"avenir"],
  ["p5","P5","Prospection & veille","Démos prospects (façon Limova)","Démos live pilotées — le prospect regarde","Linda + Laurence","2026-07-31","27 → 31 juil.","Build",1,6,"avenir"],
  ["p6","P6","Prospection & veille","Préparation de l'after-work","La soirée de lancement du 17 sept.","Linda + Laurence","2026-09-13","31 août → 13 sept.","Lancement",1.5,8,"avenir"],
  ["k1","COM1","Plan de communication","Identité & landing","Juillet — marque, message clé, page web","Linda + Laurence","2026-07-19","13 → 19 juil.","Build",2,6,"avenir"],
  ["k2","COM2","Plan de communication","Pré-lancement (mi-août)","Ouverture des pré-inscriptions","Linda + Laurence","2026-08-09","3 → 9 août","Pré-lancement",1,6,"avenir"],
  ["k3","COM3","Plan de communication","Preuve sociale","Début août — faire parler les testeurs","Linda + Laurence","2026-08-16","10 → 16 août","Pré-lancement",1,4,"avenir"],
  ["k4","COM4","Plan de communication","Lancement commercial (18 août)","Ouverture des abonnements","Linda + Laurence","2026-08-30","18 → 30 août","Lancement",1,6,"avenir"],
  ["k5","COM5","Plan de communication","Événement (17 sept.)","Soirée officielle de présentation","Linda + Laurence","2026-09-17","14 → 17 sept.","Lancement",1.5,6,"avenir"]
];

var ENTETE = ['module_id','code','pole','titre','sous_titre','responsable',
              'echeance','semaine','phase','charge_jours','nb_taches','statut'];

/** À lancer UNE fois : crée les onglets et pré-remplit les 26 modules. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- onglet Suivi : en-tête + 26 modules ---
  var sh = ss.getSheetByName(ONGLET) || ss.insertSheet(ONGLET);
  sh.clear();
  sh.getRange(1, 1, 1, ENTETE.length).setValues([ENTETE]).setFontWeight('bold');
  sh.getRange(2, 1, MODULES.length, ENTETE.length).setValues(MODULES);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, ENTETE.length);

  // --- onglet Contenus (tes posts) ---
  var shC = ss.getSheetByName(ONGLET_CONTENUS) || ss.insertSheet(ONGLET_CONTENUS);
  if (shC.getLastRow() === 0) {
    shC.getRange(1, 1, 1, ENTETE_CONTENUS.length).setValues([ENTETE_CONTENUS]).setFontWeight('bold');
    shC.setFrozenRows(1);
  }

  // --- onglet Liens ---
  var shL = ss.getSheetByName(ONGLET_LIENS) || ss.insertSheet(ONGLET_LIENS);
  if (shL.getLastRow() === 0) {
    shL.appendRow(['titre', 'url', 'ajoute_le']);
    shL.getRange('A1:C1').setFontWeight('bold');
    shL.setFrozenRows(1);
  }
}

/** Lecture. action=load -> statuts {module_id:statut}; action=modules -> lignes completes; action=liens -> liens */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'load';
  if (action === 'load')    return json_({ ok: true, statuts: readStatuts_() });
  if (action === 'modules') return json_({ ok: true, modules: readModules_() });
  if (action === 'liens')   return json_({ ok: true, liens: readLiens_() });
  if (action === 'contenus') return json_({ ok: true, contenus: readContenus_() });
  if (action === 'pilotage') return json_({ ok: true, pilotage: readPilotage_() });
  return json_({ ok: false, error: 'action inconnue' });
}

/** Ecriture. {id,statut} -> maj statut du module ; {type:'lien',titre,url} -> ajoute un lien */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.type === 'pilotage_statut') {
      if (!body.id || !body.statut) return json_({ ok: false, error: 'id ou statut manquant' });
      var maj = setPilotageStatut_(body.id, body.statut);
      return json_({ ok: maj, error: maj ? '' : 'ligne pilotage introuvable' });
    }
    if (body.type === 'lien') {
      if (!body.titre || !body.url) return json_({ ok: false, error: 'titre ou url manquant' });
      appendLien_(body.titre, body.url);
      return json_({ ok: true });
    }
    if (body.type === 'contenus_bulk') {
      writeContenus_(body.contenus || []);
      return json_({ ok: true });
    }
    if (body.type === 'contenu') {
      if (!body.contenu || !body.contenu.id) return json_({ ok: false, error: 'contenu.id manquant' });
      upsertContenu_(body.contenu);
      return json_({ ok: true });
    }
    if (!body.id || !body.statut) return json_({ ok: false, error: 'id ou statut manquant' });
    setStatut_(body.id, body.statut);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------------- internes : Suivi ---------------- */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(ONGLET) || (function () { setup(); return ss.getSheetByName(ONGLET); })();
}

function readStatuts_() {
  var sh = sheet_(), last = sh.getLastRow(), out = {};
  if (last < 2) return out;
  var vals = sh.getRange(2, 1, last - 1, ENTETE.length).getValues();
  var iId = ENTETE.indexOf('module_id'), iSt = ENTETE.indexOf('statut');
  vals.forEach(function (r) { if (r[iId]) out[r[iId]] = r[iSt] || 'avenir'; });
  return out;
}

function readModules_() {
  var sh = sheet_(), last = sh.getLastRow(), out = [];
  if (last < 2) return out;
  var vals = sh.getRange(2, 1, last - 1, ENTETE.length).getValues();
  vals.forEach(function (r) {
    var o = {}; ENTETE.forEach(function (k, i) { o[k] = r[i]; }); out.push(o);
  });
  return out;
}

function setStatut_(id, statut) {
  var lock = LockService.getScriptLock(); lock.tryLock(5000);
  try {
    var sh = sheet_(), last = sh.getLastRow();
    if (last < 2) return;
    var iId = ENTETE.indexOf('module_id'), iSt = ENTETE.indexOf('statut');
    var ids = sh.getRange(2, iId + 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) { sh.getRange(i + 2, iSt + 1).setValue(statut); return; }
    }
  } finally { lock.releaseLock(); }
}

/* ---------------- internes : Liens ---------------- */

function sheetLiens_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(ONGLET_LIENS) || (function () { setup(); return ss.getSheetByName(ONGLET_LIENS); })();
}

function readLiens_() {
  var sh = sheetLiens_(), last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 2).getValues()
    .filter(function (r) { return r[0]; })
    .map(function (r) { return { titre: r[0], url: r[1] }; })
    .reverse();
}

function appendLien_(titre, url) {
  var lock = LockService.getScriptLock(); lock.tryLock(5000);
  try { sheetLiens_().appendRow([titre, url, new Date()]); }
  finally { lock.releaseLock(); }
}

function sheetContenus_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(ONGLET_CONTENUS) || (function () { setup(); return ss.getSheetByName(ONGLET_CONTENUS); })();
}

function readContenus_() {
  var sh = sheetContenus_(), last = sh.getLastRow(), out = [];
  if (last < 2) return out;
  var vals = sh.getRange(2, 1, last - 1, ENTETE_CONTENUS.length).getValues();
  vals.forEach(function (r) {
    if (!r[0]) return;
    var o = {}; ENTETE_CONTENUS.forEach(function (k, i) { o[k] = r[i]; }); out.push(o);
  });
  return out;
}

function rowFromContenu_(c) {
  return [c.id, c.date||'', c.canal||'', c.format||'', c.titre||'', c.texte||'',
          c.etape||'', c.valide_linda?'oui':'', c.valide_laurence?'oui':'',
          c.lien_photo||'', new Date()];
}

function writeContenus_(list) {
  var lock = LockService.getScriptLock(); lock.tryLock(8000);
  try {
    var sh = sheetContenus_();
    var last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, ENTETE_CONTENUS.length).clearContent();
    if (list.length) {
      var rows = list.map(rowFromContenu_);
      sh.getRange(2, 1, rows.length, ENTETE_CONTENUS.length).setValues(rows);
    }
  } finally { lock.releaseLock(); }
}

function upsertContenu_(c) {
  var lock = LockService.getScriptLock(); lock.tryLock(5000);
  try {
    var sh = sheetContenus_(), last = sh.getLastRow();
    var ids = last < 2 ? [] : sh.getRange(2, 1, last - 1, 1).getValues();
    var row = -1;
    for (var i = 0; i < ids.length; i++) { if (ids[i][0] === c.id) { row = i + 2; break; } }
    var vals = rowFromContenu_(c);
    if (row === -1) sh.appendRow(vals);
    else sh.getRange(row, 1, 1, ENTETE_CONTENUS.length).setValues([vals]);
  } finally { lock.releaseLock(); }
}

/* ---------------- Pilotage opérationnel : lecture et statut ---------------- */

function entetePilotageValide_(entete) {
  if (!entete || entete.length < ENTETE_PILOTAGE.length) return false;
  for (var i = 0; i < ENTETE_PILOTAGE.length; i++) {
    if (String(entete[i] || '').trim() !== ENTETE_PILOTAGE[i]) return false;
  }
  return true;
}

function readPilotage_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ONGLET_PILOTAGE);
  if (!sh || sh.getLastRow() < 2) return [];
  var entete = sh.getRange(1, 1, 1, ENTETE_PILOTAGE.length).getValues()[0];
  if (!entetePilotageValide_(entete)) return [];
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, ENTETE_PILOTAGE.length).getValues();
  return vals.filter(function (r) { return r[0]; }).map(function (r) {
    var o = {};
    ENTETE_PILOTAGE.forEach(function (k, i) { o[k] = r[i]; });
    return o;
  });
}

/** Mise à jour limitée au statut métier et à son horodatage technique maj_le. */
function setPilotageStatut_(id, statut) {
  var autorises = ['a_faire','en_cours','fait','bloque','valide'];
  if (autorises.indexOf(statut) === -1) return false;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(ONGLET_PILOTAGE);
    if (!sh || sh.getLastRow() < 2) return false;
    var entete = sh.getRange(1, 1, 1, ENTETE_PILOTAGE.length).getValues()[0];
    if (!entetePilotageValide_(entete)) return false;
    var iId = ENTETE_PILOTAGE.indexOf('pilotage_id');
    var iStatut = ENTETE_PILOTAGE.indexOf('statut');
    var iMajLe = ENTETE_PILOTAGE.indexOf('maj_le');
    var ids = sh.getRange(2, iId + 1, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        sh.getRange(i + 2, iStatut + 1).setValue(statut);
        sh.getRange(i + 2, iMajLe + 1).setValue(new Date());
        return true;
      }
    }
    return false;
  } finally { lock.releaseLock(); }
}

/* ---------------- Migration additive des 58 lignes ---------------- */

function valeurMetierPilotage_(valeur, indexColonne) {
  if (indexColonne === ENTETE_PILOTAGE.indexOf('echeance') && Object.prototype.toString.call(valeur) === '[object Date]' && !isNaN(valeur.getTime())) {
    return Utilities.formatDate(valeur, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(valeur == null ? '' : valeur);
}

/** Colonnes métier : index 0 à 11. cree_le et maj_le sont volontairement exclus. */
function signaturePilotage_(ligne, inclureIdentifiant) {
  var valeurs = [];
  var debut = inclureIdentifiant ? 0 : 1;
  for (var i = debut; i <= 11; i++) valeurs.push(valeurMetierPilotage_(ligne[i], i));
  return JSON.stringify(valeurs);
}

function lignesMigrationPilotage_() {
  var maintenant = new Date();
  return PILOTAGE_SOURCE.map(function (r) { return r.concat([maintenant, maintenant]); });
}

/**
 * Prévisualisation par défaut : migrerPilotageOperationnel() n'écrit rien.
 * Pour appliquer explicitement : migrerPilotageOperationnel(false) ou
 * appliquerMigrationPilotageOperationnel().
 */
function migrerPilotageOperationnel(previsualisation) {
  return migrerPilotageOperationnel_(previsualisation !== false);
}

function previsualiserMigrationPilotageOperationnel() {
  return migrerPilotageOperationnel_(true);
}

function appliquerMigrationPilotageOperationnel() {
  return migrerPilotageOperationnel_(false);
}

function migrerPilotageOperationnel_(previsualisation) {
  var rapport = {
    mode: previsualisation ? 'PREVISUALISATION' : 'APPLICATION',
    onglet: ONGLET_PILOTAGE,
    lignesSource: PILOTAGE_SOURCE.length,
    ajoutsPrevus: 0,
    ajoutes: 0,
    doublonsIgnores: [],
    conflits: [],
    erreurs: [],
    idsAjoutes: []
  };
  var lock = null;
  if (!previsualisation) {
    lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) {
      rapport.erreurs.push('Impossible d’obtenir le verrou d’écriture. Aucun ajout effectué.');
      return rapport;
    }
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(ONGLET_PILOTAGE);
    var idConnus = {};
    var signaturesConnues = {};

    if (sh && sh.getLastRow() > 0) {
      var entete = sh.getRange(1, 1, 1, ENTETE_PILOTAGE.length).getValues()[0];
      if (!entetePilotageValide_(entete)) {
        rapport.erreurs.push('En-tête existant incompatible : migration refusée sans aucune écriture.');
        return rapport;
      }
      if (sh.getLastRow() > 1) {
        var existantes = sh.getRange(2, 1, sh.getLastRow() - 1, ENTETE_PILOTAGE.length).getValues();
        existantes.forEach(function (r) {
          if (!r[0]) return;
          var idExistant = String(r[0]);
          idConnus[idExistant] = signaturePilotage_(r, true);
          signaturesConnues[signaturePilotage_(r, false)] = idExistant;
        });
      }
    }

    var aAjouter = [];
    lignesMigrationPilotage_().forEach(function (r) {
      var id = String(r[0]);
      var signatureAvecId = signaturePilotage_(r, true);
      var signatureSansId = signaturePilotage_(r, false);
      if (idConnus[id]) {
        if (idConnus[id] === signatureAvecId) rapport.doublonsIgnores.push(r[0]);
        else rapport.conflits.push({ id: r[0], raison: 'identifiant déjà utilisé avec un contenu différent' });
        return;
      }
      if (signaturesConnues[signatureSansId]) {
        rapport.doublonsIgnores.push({ id: r[0], identifiantExistant: signaturesConnues[signatureSansId], raison: 'contenu métier identique sous un autre identifiant' });
        return;
      }
      aAjouter.push(r);
      idConnus[id] = signatureAvecId;
      signaturesConnues[signatureSansId] = id;
    });
    rapport.ajoutsPrevus = aAjouter.length;

    if (previsualisation || rapport.conflits.length || rapport.erreurs.length) {
      Logger.log(JSON.stringify({ mode: rapport.mode, ajoutsPrevus: rapport.ajoutsPrevus, doublons: rapport.doublonsIgnores.length, conflits: rapport.conflits.length }));
      return rapport;
    }

    if (!sh) sh = ss.insertSheet(ONGLET_PILOTAGE);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, ENTETE_PILOTAGE.length).setValues([ENTETE_PILOTAGE]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    if (aAjouter.length) {
      sh.getRange(sh.getLastRow() + 1, 1, aAjouter.length, ENTETE_PILOTAGE.length).setValues(aAjouter);
      rapport.ajoutes = aAjouter.length;
      rapport.idsAjoutes = aAjouter.map(function (r) { return r[0]; });
    }
    Logger.log(JSON.stringify({ mode: rapport.mode, ajoutes: rapport.ajoutes, doublons: rapport.doublonsIgnores.length }));
    return rapport;
  } finally {
    if (lock) lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
