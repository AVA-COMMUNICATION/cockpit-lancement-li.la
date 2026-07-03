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

/* Les 26 modules du plan — source de vérité pré-remplie dans le Sheet.
   Colonnes : module_id, code, pole, titre, sous_titre, responsable,
   echeance, semaine, phase, charge_jours, nb_taches, statut */
var MODULES = [
  ["c1","C1","Développement technique","Socle données","Google Sheets (< 100 adhérents) → Supabase ensuite","Laurence","2026-07-05","30 juin → 5 juil.","Build",3,6,"avenir"],
  ["c2","C2","Développement technique","Proxy IA + quotas","Apps Script : clé serveur, routage, décompte, plafond","Laurence","2026-07-12","6 → 12 juil.","Build",3,9,"avenir"],
  ["c3","C3","Développement technique","Identification & Freemium","Accès par mail, interface verrouillée, vitrines factices","Laurence","2026-07-12","6 → 12 juil.","Build",2,6,"avenir"],
  ["c4","C4","Développement technique","Lila Office","Boîte mail + CRM (offre 19€)","Laurence","2026-07-19","13 → 19 juil.","Build",4,5,"avenir"],
  ["c5","C5","Développement technique","Lila Carnet","Notes + mémo vocal (offre 19€ / base)","Laurence","2026-07-19","13 → 19 juil.","Build",3,7,"avenir"],
  ["c6","C6","Développement technique","Li·La Com'","Création de contenu réseaux sociaux (offre 39€)","Laurence","2026-07-26","20 → 26 juil.","Build",3,4,"avenir"],
  ["c7","C7","Développement technique","Li·La Com'+","Image avancée, prompts archi/BTP","Laurence","2026-07-31","27 → 31 juil.","Build",2,5,"avenir"],
  ["c8","C8","Développement technique","Offre Ava (base)","Gratuit — veille, mémo vocal, questions IA, formations","Laurence","2026-07-26","20 → 26 juil.","Build",1,4,"avenir"],
  ["c9","C9","Développement technique","Paiement","Stripe (19 / 39€), bascule anciens adhérents — prêt le 18 août","Laurence","2026-08-09","3 → 9 août","Pré-lancement",2,6,"avenir"],
  ["c10","C10","Développement technique","PWA / Landing / Domaine / RGPD","Coque, page web, déploiement, conformité","Laurence","2026-07-31","27 → 31 juil.","Build",2,8,"avenir"],
  ["b1","B1","Business plan & cadre","Offres & tarifs","Gratuit / 19€ / 39€ + Com'+","Linda + Laurence","2026-07-19","13 → 19 juil.","Build",0.5,5,"avenir"],
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
  return json_({ ok: false, error: 'action inconnue' });
}

/** Ecriture. {id,statut} -> maj statut du module ; {type:'lien',titre,url} -> ajoute un lien */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
