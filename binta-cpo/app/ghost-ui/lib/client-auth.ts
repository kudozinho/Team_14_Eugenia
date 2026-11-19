import { cookies } from 'next/headers';
export function allowedEmail(){ return (process.env.GHOST_CLIENT_EMAIL||'').trim().toLowerCase(); }
export async function clientUser(){
 const token=cookies().get('ghost_session')?.value;
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
 if(!token||!url||!key||!allowedEmail())return null;
 try{const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(5000)});if(!r.ok)return null;const u=await r.json();return u.email_confirmed_at&&u.email?.toLowerCase()===allowedEmail()?u:null;}catch{return null;}
}
