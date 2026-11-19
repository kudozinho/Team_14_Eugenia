import { cookies } from 'next/headers';
import { allowedEmail, clientUser } from '@/lib/client-auth';
export const dynamic='force-dynamic';
function originOk(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export async function GET(){const u=await clientUser();return Response.json({authenticated:!!u,email:u?.email},{headers:{'Cache-Control':'no-store'}});}
export async function DELETE(req:Request){if(!originOk(req))return new Response(null,{status:403});cookies().delete('ghost_session');return Response.json({ok:true});}
export async function POST(req:Request){
 if(!originOk(req))return new Response(null,{status:403});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
 if(!url||!key||!allowedEmail())return Response.json({error:'La connexion par e-mail doit encore être activée par l’équipe.'},{status:503});
 try{
 const b=await req.json(),email=String(b.email||'').trim().toLowerCase();
 if(email!==allowedEmail())return Response.json({error:'Cette adresse n’est pas invitée à ce projet.'},{status:403});
 const verify=b.action==='verify';
 if(verify&&!/^\d{6,10}$/.test(String(b.code||'')))return Response.json({error:'Saisissez le code reçu par e-mail.'},{status:400});
 const r=await fetch(`${url}/auth/v1/${verify?'verify':'otp'}`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(verify?{email,token:b.code,type:'email'}:{email,create_user:true}),signal:AbortSignal.timeout(10000)});
 const d=await r.json();if(!r.ok)return Response.json({error:verify?'Code expiré ou incorrect. Demandez un nouveau code.':'Envoi indisponible. Patientez une minute ou contactez l’équipe.'},{status:r.status===429?429:400});
 if(verify){if(!d.access_token||d.user?.email?.toLowerCase()!==allowedEmail())return new Response(null,{status:403});cookies().set('ghost_session',d.access_token,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:Math.min(d.expires_in||3600,3600)});}
 return Response.json({ok:true});
 }catch{return Response.json({error:'Connexion indisponible. Réessayez.'},{status:503});}
}
