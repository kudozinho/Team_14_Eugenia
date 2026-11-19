// Contract tests without making paid calls or touching the shared database.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ts=require('typescript');
const source=readFileSync('app/api/prouver/route.ts','utf8').replace('import { tacheIdConfiguree } from "@/lib/tache";', 'const tacheIdConfiguree = () => "configured-task";');
function route(env,fetch){const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,process:{env},Response,Request,URL,AbortSignal,fetch});return exports;}
(async()=>{
 const env={SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'private',PROUVER_CODE:'0123456789abcdef'};
 const req=(code)=>new Request('https://ghost.invalid/api/prouver',{method:'POST',headers:code?{authorization:'Bearer '+code}: {},body:JSON.stringify({tache_id:'attacker-task'})});
 let calls=0;
 const noFetch=()=>{calls++;throw Error('unexpected network')};
 assert.equal((await route({},noFetch).POST(req())).status,503);
 assert.equal((await route(env,noFetch).POST(req())).status,401);
 assert.equal(calls,0);
 let payload;
 const accept=route(env,async(url,opts)=>{assert.equal(url,'https://db.invalid/rest/v1/rpc/demander_agent');payload=JSON.parse(opts.body);return Response.json([{id:'execution-123'}]);});
 const accepted=await accept.POST(req(env.PROUVER_CODE));
 assert.deepEqual(await accepted.json(),{mode:'reel',id:'execution-123'});
 assert.deepEqual(payload,{p_tache:'configured-task'});
 const offline=route(env,async()=>Response.json({error:'offline'},{status:400}));
 assert.equal((await offline.POST(req(env.PROUVER_CODE))).status,502);
 const timeout=route(env,async()=>{throw Error('network')});
 assert.equal((await timeout.POST(req(env.PROUVER_CODE))).status,503);
 console.log('PASS: configuration, access, fixed task, RPC queue, unavailable worker, network failure');
})().catch(e=>{console.error(e);process.exitCode=1});
