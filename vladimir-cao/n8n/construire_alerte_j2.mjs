// Génère alerte_j2.json (workflow n8n importable). Lancer : node construire_alerte_j2.mjs
// Le code des nœuds « Code » est écrit ici en clair pour rester lisible et relu.
// Attention : dans ces gabarits, ne jamais écrire de "\n" (il deviendrait un vrai saut de ligne) :
// utiliser String.fromCharCode(10).
import { readFileSync, writeFileSync } from 'node:fs';

const logoPng = readFileSync(new URL('./logo-ghost.png', import.meta.url)).toString('base64');

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

const LOGO_PNG = '${logoPng}';
const mode = $('Mode automatique').isExecuted ? 'auto' : 'test';
const memoire = $getWorkflowStaticData('global');
const dejaEnvoyees = memoire.envoyees || {};
const taches = $input.all().map(i => i.json).filter(t => t && t.id);
const plusRecente = taches.map(t => t.cree_le).sort().at(-1) || null;

const COMMENT = {
  agent_h: "L’agent de H Company peut reprendre cette tâche dans le navigateur.",
  n8n: "Un workflow n8n peut automatiser cette tâche via l’API de ton outil.",
  les_deux: "Un workflow n8n peut piloter la tâche et appeler l’agent de H Company pour les étapes dans le navigateur.",
  outil_existant: "Ton logiciel dispose déjà d’une fonction pour cette tâche."
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
  const titre = String(t.nom ?? 'Tâche détectée');
  const sujet = \`Ghost · Résultat de ton audit : \${titre}\`;
  const chiffres = [
    ...(connu(t.occurrences) ? [['Occurrences observées', nombre(t.occurrences)]] : []),
    ...(connu(t.temps_perdu_semaine_min) ? [['Temps consacré par semaine', \`\${nombre(t.temps_perdu_semaine_min)} min\`]] : []),
    ...(connu(t.gain_estime_h_semaine) ? [['Gain hebdomadaire estimé', \`\${nombre(t.gain_estime_h_semaine)} h\`]] : []),
  ];
  const lienRapport = /^https?:[/][/]\\S+$/i.test(LIEN_RAPPORT.trim()) ? LIEN_RAPPORT.trim() : '';
  const suite = 'Tu pourras voir la solution en action et donner ton accord avant sa mise en place.';
  const confidentialite = 'Ce mail résume la tâche observée. Les captures de ton écran restent sur ton poste.';
  const lignes = [
    'Bonjour,',
    '',
    'Ghost a repéré cette tâche récurrente pendant ton audit :',
    titre,
    ...chiffres.map(([libelle, valeur]) => \`\${libelle} : \${valeur}\`),
    '',
    \`Solution proposée : \${COMMENT[t.methode]}\`,
    suite,
    ...(lienRapport ? ['', \`Voir le rapport : \${lienRapport}\`] : []),
    '',
    'À bientôt,',
    'L’équipe Ghost',
    'Audit d’automatisation',
    '',
    confidentialite,
  ];
  const donnees = chiffres.map(([libelle, valeur]) => \`
        <tr>
          <td style="padding:9px 0;border-top:1px solid #dce8e0;color:#3b5549;font-size:14px;">\${echapper(libelle)}</td>
          <td align="right" style="padding:9px 0 9px 12px;border-top:1px solid #dce8e0;color:#123b2c;font-size:15px;font-weight:bold;white-space:nowrap;">\${echapper(valeur)}</td>
        </tr>\`).join('');
  const html = \`
<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>\${echapper(sujet)}</title></head>
<body style="margin:0;padding:0;background:#eef4ef;font-family:Arial,sans-serif;color:#13291f;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef4ef">
  <tr><td align="center" style="padding:24px 12px;">
    <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:600px;border:1px solid #dbe7df;border-radius:16px;">
      <tr><td bgcolor="#04382a" style="padding:24px;border-radius:15px 15px 0 0;color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="44" valign="middle"><img src="cid:logo_ghost" width="36" height="36" alt="" style="display:block;border:0;border-radius:9px;"></td>
            <td valign="middle" style="color:#ffffff;font-size:21px;line-height:26px;font-weight:bold;">Ghost</td>
          </tr>
        </table>
        <p style="margin:18px 0 0;color:#b8f3cf;font-size:14px;line-height:20px;">Résultat de ton audit</p>
      </td></tr>
      <tr><td style="padding:26px 24px 24px;color:#13291f;font-size:16px;line-height:25px;">
        <p style="margin:0 0 9px;">Bonjour,</p>
        <p style="margin:0 0 19px;color:#3b5549;">Ghost a repéré cette tâche récurrente pendant ton audit.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f7f3" style="border:1px solid #dbe7df;border-radius:12px;">
          <tr><td style="padding:17px 16px;">
            <h1 style="margin:0;font-family:Arial,sans-serif;font-size:23px;line-height:29px;word-break:break-word;color:#123b2c;">\${echapper(titre)}</h1>
            \${donnees ? \`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">\${donnees}</table>\` : ''}
          </td></tr>
        </table>
        <h2 style="margin:23px 0 6px;font-size:17px;line-height:23px;color:#123b2c;">Solution proposée</h2>
        <p style="margin:0 0 10px;color:#3b5549;">\${echapper(COMMENT[t.methode])}</p>
        <p style="margin:0;color:#3b5549;">\${echapper(suite)}</p>
        \${lienRapport ? \`<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr><td bgcolor="#0b7a55" style="border-radius:8px;">
          <a href="\${echapper(lienRapport)}" style="display:inline-block;padding:12px 17px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Voir le rapport</a>
        </td></tr></table>\` : ''}
        <p style="margin:23px 0 0;">À bientôt,<br><strong>L’équipe Ghost</strong><br><span style="color:#50635a;font-size:14px;">Audit d’automatisation</span></p>
      </td></tr>
      <tr><td bgcolor="#f2f7f3" style="padding:15px 24px;border-top:1px solid #dbe7df;border-radius:0 0 15px 15px;color:#465d51;font-size:13px;line-height:19px;">\${echapper(confidentialite)}</td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>
</body>
</html>\`;
  return {
    json: {
      mode, cle: t.audit_id + '|' + t.nom, tache_id: t.id, plus_recente: plusRecente, nb_alertes: aEnvoyer.length,
      a: DESTINATAIRE, de: EXPEDITEUR, sujet, texte: lignes.join(String.fromCharCode(10)), html,
    },
    binary: { logo_ghost: { data: LOGO_PNG, mimeType: 'image/png', fileName: 'logo-ghost.png', fileExtension: 'png' } },
  };
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
        text: '={{ $json.texte }}', html: '={{ $json.html }}', options: { appendAttribution: false, attachments: 'logo_ghost' } } },
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
