// Génère alerte_j2.json (workflow n8n importable). Lancer : node construire_alerte_j2.mjs
// Le code des nœuds « Code » est écrit ici en clair pour rester lisible et relu.
// Attention : dans ces gabarits, ne jamais écrire de "\n" (il deviendrait un vrai saut de ligne) :
// utiliser String.fromCharCode(10).
import { writeFileSync } from 'node:fs';

const SUPABASE = 'https://bvxmnrvqehemqsjiasdr.supabase.co';
const CRED_SUPABASE = { supabaseApi: { id: 'te9bIHUOLzve2fhc', name: 'Supabase Ghost (équipe)' } };
const LIMITE = 100; // tâches lues au plus par passage

const codeAuto = `// Mode automatique : ne lit que les tâches créées depuis la dernière vérification.
// Au tout premier passage après l'activation, on part de maintenant (pas d'avalanche d'anciennes alertes).
const memoire = $getWorkflowStaticData('global');
if (!memoire.depuis) memoire.depuis = new Date().toISOString();
return [{ json: { mode: 'auto', depuis: memoire.depuis, ordre: 'cree_le.asc', limite: ${LIMITE} } }];`;

const codeTest = `// Mode test (démo) : renvoie l'alerte de la dernière tâche détectée, sans toucher à la mémoire.
return [{ json: { mode: 'test', depuis: '1970-01-01T00:00:00Z', ordre: 'cree_le.desc', limite: 1 } }];`;

const codeAlertes = `// ===== RÉGLAGES (à adapter) =====
const DESTINATAIRE = 'ADRESSE_DE_DEMO@exemple.fr'; // boîte qui reçoit l'alerte pendant la démo
const EXPEDITEUR = 'Ghost <ADRESSE_GMAIL@gmail.com>'; // doit être l'adresse Gmail de la connexion SMTP
const LIEN_RAPPORT = ''; // adresse du tableau de bord ou du rapport (Binta), laisser vide si pas encore en ligne
// =================================

const mode = $('Mode automatique').isExecuted ? 'auto' : 'test';
const memoire = $getWorkflowStaticData('global');
const dejaEnvoyees = memoire.envoyees || {};
const taches = $input.all().map(i => i.json).filter(t => t && t.id);
const plusRecente = taches.map(t => t.cree_le).sort().at(-1) || null;

const COMMENT = {
  agent_h: "l'agent de H Company peut la refaire à ta place dans le navigateur (ces sites n'ont pas d'API)",
  n8n: "un workflow n8n peut la faire à ta place (l'outil a une API)",
  les_deux: "un workflow n8n et l'agent de H Company peuvent la faire à ta place",
  outil_existant: "ton logiciel sait déjà le faire : il suffit d'activer la fonction",
};
const connu = n => n !== null && n !== undefined && n !== '';
const nombre = n => String(n).replace('.', ',');
const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Une seule alerte par type de tâche (même nom) et par audit, même si la détection la réécrit sous un autre identifiant.
const vues = new Set();
const aEnvoyer = taches.filter(t => {
  if (!COMMENT[t.methode]) return false; // « rien » : pas d'alerte
  const cle = t.audit_id + '|' + t.nom;
  if (vues.has(cle)) return false;
  vues.add(cle);
  return mode === 'test' || !dejaEnvoyees[cle];
});

// Rien à envoyer : on peut avancer la mémoire sans risque (aucune alerte ne peut se perdre).
if (mode === 'auto' && aEnvoyer.length === 0) {
  if (plusRecente) memoire.depuis = plusRecente;
  return [];
}

return aEnvoyer.map(t => {
  const sujet = \`Ghost : tu fais « \${t.nom} » à la main, on peut l'automatiser\`;
  const repetition = connu(t.occurrences) ? \` \${nombre(t.occurrences)} fois\` : '';
  const gain = connu(t.gain_estime_h_semaine) ? \` Gain estimé : \${nombre(t.gain_estime_h_semaine)} h par semaine.\` : '';
  const lignes = [
    'Bonjour,',
    '',
    \`Pendant l'audit, Ghost a repéré une tâche répétée\${repetition} : « \${t.nom} ».\`,
    ...(connu(t.temps_perdu_semaine_min) ? [\`Elle te prend environ \${nombre(t.temps_perdu_semaine_min)} min par semaine.\`] : []),
    '',
    \`Bonne nouvelle : \${COMMENT[t.methode]}.\${gain}\`,
    '',
    "Rien ne change sans ton accord : tu pourras voir l'agent faire la tâche et valider avant toute mise en place.",
    "Ce message ne parle que de la tâche : ni ton écran ni tes données n'y figurent.",
    ...(LIEN_RAPPORT ? ['', \`Voir le détail : \${LIEN_RAPPORT}\`] : []),
    '',
    'Ghost · See the work. Ghost the task.',
  ];
  const html = lignes.map(l => (l ? \`<p style="margin:0 0 4px">\${echapper(l)}</p>\` : '<br>')).join('');
  return { json: {
    mode, cle: t.audit_id + '|' + t.nom, tache_id: t.id, plus_recente: plusRecente, nb_alertes: aEnvoyer.length,
    a: DESTINATAIRE, de: EXPEDITEUR, sujet, texte: lignes.join(String.fromCharCode(10)), html,
  } };
});`;

const codeMemoriser = `// Après l'envoi : on ne note comme « traitées » que les alertes réellement envoyées.
// Si un envoi a échoué, la mémoire n'avance pas : la tâche sera retentée au passage suivant,
// et les alertes déjà parties ne repartiront pas (elles sont dans « envoyees »).
const alertes = $('Préparer les alertes').all();
const reussies = $input.all().map(i => alertes[i.pairedItem?.item ?? 0].json);
if (!reussies.length || reussies[0].mode !== 'auto') return reussies.map(a => ({ json: { envoyee: a.tache_id } }));
const memoire = $getWorkflowStaticData('global');
memoire.envoyees = memoire.envoyees || {};
for (const a of reussies) memoire.envoyees[a.cle] = new Date().toISOString();
if (reussies.length === reussies[0].nb_alertes && reussies[0].plus_recente) memoire.depuis = reussies[0].plus_recente;
return reussies.map(a => ({ json: { envoyee: a.tache_id, depuis: memoire.depuis } }));`;

const workflow = {
  name: 'alerte_j2',
  nodes: [
    { id: 'n1', name: 'Toutes les minutes', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2, position: [0, 0],
      parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 1 }] } } },
    { id: 'n2', name: 'Tester (dernière tâche)', type: 'n8n-nodes-base.webhook', typeVersion: 2, position: [0, 220], webhookId: 'alerte-j2-test',
      parameters: { httpMethod: 'POST', path: 'alerte-j2-test', responseMode: 'lastNode', options: {} } },
    { id: 'n3', name: 'Mode automatique', type: 'n8n-nodes-base.code', typeVersion: 2, position: [240, 0], parameters: { jsCode: codeAuto } },
    { id: 'n4', name: 'Mode test', type: 'n8n-nodes-base.code', typeVersion: 2, position: [240, 220], parameters: { jsCode: codeTest } },
    { id: 'n5', name: 'Lire les tâches détectées', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [500, 110],
      credentials: CRED_SUPABASE,
      parameters: {
        url: `${SUPABASE}/rest/v1/taches_detectees`,
        authentication: 'predefinedCredentialType', nodeCredentialType: 'supabaseApi',
        sendQuery: true,
        queryParameters: { parameters: [
          { name: 'select', value: 'id,audit_id,nom,occurrences,temps_perdu_semaine_min,methode,gain_estime_h_semaine,cree_le' },
          { name: 'cree_le', value: '=gt.{{ $json.depuis }}' },
          { name: 'order', value: '={{ $json.ordre }},id.asc' },
          { name: 'limit', value: '={{ $json.limite }}' },
        ] },
        options: {},
      } },
    { id: 'n6', name: 'Préparer les alertes', type: 'n8n-nodes-base.code', typeVersion: 2, position: [760, 110], parameters: { jsCode: codeAlertes } },
    { id: 'n7', name: "Envoyer l'e-mail", type: 'n8n-nodes-base.emailSend', typeVersion: 2.1, position: [1000, 110],
      onError: 'continueErrorOutput',
      parameters: { fromEmail: '={{ $json.de }}', toEmail: '={{ $json.a }}', subject: '={{ $json.sujet }}', emailFormat: 'both',
        text: '={{ $json.texte }}', html: '={{ $json.html }}', options: { appendAttribution: false } } },
    { id: 'n8', name: 'Mémoriser les envois', type: 'n8n-nodes-base.code', typeVersion: 2, position: [1240, 40], parameters: { jsCode: codeMemoriser } },
    { id: 'n9', name: 'Échec : retenté au prochain passage', type: 'n8n-nodes-base.noOp', typeVersion: 1, position: [1240, 220], parameters: {} },
  ],
  connections: {
    'Toutes les minutes': { main: [[{ node: 'Mode automatique', type: 'main', index: 0 }]] },
    'Tester (dernière tâche)': { main: [[{ node: 'Mode test', type: 'main', index: 0 }]] },
    'Mode automatique': { main: [[{ node: 'Lire les tâches détectées', type: 'main', index: 0 }]] },
    'Mode test': { main: [[{ node: 'Lire les tâches détectées', type: 'main', index: 0 }]] },
    'Lire les tâches détectées': { main: [[{ node: 'Préparer les alertes', type: 'main', index: 0 }]] },
    'Préparer les alertes': { main: [[{ node: "Envoyer l'e-mail", type: 'main', index: 0 }]] },
    "Envoyer l'e-mail": { main: [
      [{ node: 'Mémoriser les envois', type: 'main', index: 0 }],
      [{ node: 'Échec : retenté au prochain passage', type: 'main', index: 0 }],
    ] },
  },
  settings: { executionOrder: 'v1', timezone: 'Europe/Paris' },
};
writeFileSync(new URL('./alerte_j2.json', import.meta.url), JSON.stringify(workflow, null, 2) + '\n');
console.log('alerte_j2.json écrit');
