// Exercices du contrat API : aucun appel H, aucune base distante.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ts=require('typescript');
const source=readFileSync('app/api/prouver/route.ts','utf8');
const task='tache_a1a0c7545c805f328eba1e25', key='a0000000-0000-4000-8000-000000000001';
function route(env,fetch){const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,process:{env},Response,Request,URL,AbortSignal,fetch});return exports;}
const env={SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'private',PROUVER_CODE:'0123456789abcdef',TACHE_ID:task,GHOST_WORKER_URL:'https://worker.invalid',GHOST_WORKER_TOKEN:'x'.repeat(32)};
const req=(code=env.PROUVER_CODE,body={cle_demande:key,tache_id:task})=>new Request('https://ghost.invalid/api/prouver',{method:'POST',headers:{authorization:'Bearer '+code},body:JSON.stringify(body)});
(async()=>{
 let calls=0;const noFetch=()=>{calls++;throw Error('unexpected network')};
 assert.equal((await route(env,noFetch).POST(req('wrong'))).status,401);
 assert.equal((await route({...env,TACHE_ID:''},noFetch).POST(req())).status,503);
 assert.equal((await route(env,noFetch).POST(req(undefined,{cle_demande:key,tache_id:'other'}))).status,400);
 assert.equal((await route(env,noFetch).POST(req(undefined,null))).status,400);
 assert.equal(calls,0);
 let queued=0,dispatched=0;
 const accept=route(env,async(url,opts)=>{
  if(url.includes('cle_demande=eq.'))return Response.json([]);
  if(url.endsWith('/ready'))return Response.json({ready:true});
  if(url.endsWith('rpc/demander_agent_http')){queued++;assert.deepEqual(JSON.parse(opts.body),{p_tache:task,p_cle:key});return Response.json([{id:'run-1'}]);}
  if(url.endsWith('/run')){dispatched++;assert.deepEqual(JSON.parse(opts.body),{id:'run-1'});return Response.json({accepted:true},{status:202});}
  throw Error(url);
 });
 assert.deepEqual(await (await accept.POST(req())).json(),{mode:'reel',id:'run-1'});
 assert.equal(queued,1);assert.equal(dispatched,1);
 // Same key after a lost response finds a completed execution without waking H or spending another run.
 const resume=route(env,async(url)=>{assert.ok(url.includes('cle_demande=eq.'));return Response.json([{id:'run-1',statut:'completed'}])});
 assert.deepEqual(await (await resume.POST(req())).json(),{mode:'reel',id:'run-1'});
 const warming=route(env,async(url)=>{if(url.includes('cle_demande=eq.'))return Response.json([]);throw Error('cold')});
 assert.equal((await warming.POST(req())).status,202);
 for(const [message,status] of [['NO_CONFIRMED_CREDITS',402],['BUSY_OR_REVIEW',409],['OFFLINE',503]]){
  const r=route(env,async(url)=>url.includes('cle_demande=eq.')?Response.json([]):url.endsWith('/ready')?Response.json({ready:true}):Response.json({message},{status:400}));
  assert.equal((await r.POST(req())).status,status);
 }
 const recovery=route(env,async(url)=>{assert.ok(url.includes('cle_demande=eq.')&&url.includes(task));return Response.json([{id:'run-1',statut:'completed'}]);});
 const get=new Request('https://ghost.invalid/api/prouver?cle_demande='+key,{headers:{authorization:'Bearer '+env.PROUVER_CODE}});
 assert.equal((await recovery.GET(get)).status,200);
 console.log('PASS: access, strict task, admission, cold start, credit refusal, concurrency refusal, recovery by stable key');
})().catch(e=>{console.error(e);process.exitCode=1});
