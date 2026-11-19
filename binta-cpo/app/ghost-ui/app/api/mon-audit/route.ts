import { clientUser } from '@/lib/client-auth';
import { createHash, timingSafeEqual } from 'node:crypto';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const APPS = ['Google Chrome', 'Microsoft Excel', 'Microsoft Word'];
function match(value: string, expected?: string) {
 return !!expected && expected.length >= 32 && timingSafeEqual(createHash('sha256').update(value).digest(), createHash('sha256').update(expected).digest());
}
async function role(req: Request) {
 const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
 if (match(token, process.env.GHOST_DEVICE_TOKEN)) return 'device';
 if (await clientUser()) return 'client';
 return null;
}
async function db(path: string, method='GET', body?: unknown) {
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!url || !key) throw new Error('Portail non configuré');
 const r=await fetch(`${url}/rest/v1/${path}`,{method,cache:'no-store',signal:AbortSignal.timeout(8000),headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 if (!r.ok) throw new Error('Opération refusée : vérifier la configuration et l’état du PC');
 return r.json();
}
const endpoint='portail_recorder?id=eq.henriquet';
export async function GET(req: Request) {
 const who=await role(req); if(!who) return Response.json({error:'Code d’accès incorrect'},{status:401});
 try {
  const [state]=await db(endpoint); if(!state) throw new Error('Migration du portail manquante');
  const online=!!state.heartbeat && Date.now()-Date.parse(state.heartbeat)<10000;
  if(who==='device') return Response.json(state);
  const tasks=state.audit_id?await db(`taches_detectees?audit_id=eq.${encodeURIComponent(state.audit_id)}&select=id,nom,occurrences,duree_moyenne_s,methode&limit=50`):[];
  return Response.json({...state,online,tasks},{headers:{'Cache-Control':'no-store'}});
 } catch(e) { return Response.json({error:(e as Error).message},{status:503}); }
}
export async function POST(req: Request) {
 if(await role(req)!=='client' || req.headers.get('origin')!==new URL(req.url).origin) return Response.json({error:'Accès refusé'},{status:401});
 try {
  const b=await req.json();
  if(b.action==='stop') {
   await db(endpoint,'PATCH',{desired:'stopped'});
   return Response.json({ok:true});
  }
  if(b.action!=='start'||b.consent!==true||!Array.isArray(b.applications)||!b.applications.length||b.applications.some((a:unknown)=>typeof a!=='string'||!APPS.includes(a))||!Array.isArray(b.sites)||b.sites.length>30) return Response.json({error:'Choisis le périmètre et accepte l’enregistrement.'},{status:400});
  const sites=b.sites.map((s:unknown)=>typeof s==='string'?s.trim().toLowerCase():'');
  if(sites.some((s:string)=>!/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(s)) || (b.applications.includes('Google Chrome')&&!sites.length)) return Response.json({error:'Indique les domaines autorisés, sans https ni chemin.'},{status:400});
  const rows=await db('rpc/demarrer_portail','POST',{p_apps:[...new Set(b.applications)],p_sites:[...new Set(sites)]});
  return Response.json({ok:true,audit_id:rows[0].audit_id});
 } catch(e){ return Response.json({error:(e as Error).message},{status:409}); }
}
export async function PUT(req: Request) {
 if(await role(req)!=='device') return Response.json({error:'Accès refusé'},{status:401});
 try {
  const b=await req.json();
  if(!['ready','recording','analysing','completed','error','interrupted'].includes(b.actual)) return Response.json({error:'État invalide'},{status:400});
  const filter=b.audit_id?`&audit_id=eq.${encodeURIComponent(b.audit_id)}`:'&audit_id=is.null';
  const patch:Record<string,unknown>={actual:b.actual,heartbeat:new Date().toISOString(),message:String(b.message||'').slice(0,300)};
  if(['error','interrupted','analysing','completed'].includes(b.actual)) patch.desired='stopped';
  const rows=await db(endpoint+filter,'PATCH',patch);
  if(rows.length===1 && b.audit_id && ['completed','error','interrupted'].includes(b.actual)) await db(`audits?id=eq.${encodeURIComponent(b.audit_id)}&fin=is.null`,'PATCH',{fin:new Date().toISOString(),statut:'termine'});
  return Response.json({ok:rows.length===1});
 } catch(e){return Response.json({error:(e as Error).message},{status:503});}
}
