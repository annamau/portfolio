import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer as createHttpServer} from 'node:http';
import {createServer} from 'node:net';
const backend=createHttpServer((request,response)=>{response.writeHead(404,{'Content-Type':'text/plain'});response.end('Blob not found');});
backend.listen(0,'127.0.0.1');await once(backend,'listening');
const backendUrl=`http://127.0.0.1:${backend.address().port}`;
const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
const password='cloud-api-test-only-password-1234';
const context=Buffer.from(JSON.stringify({siteID:'resource-test-site',token:'test-only-token',edgeURL:backendUrl,uncachedEdgeURL:backendUrl})).toString('base64');
const env={...process.env,NODE_ENV:'production',NETLIFY:'true',RESOURCE_STORAGE:'netlify',RESOURCE_LOCAL_OWNER:'0',RESOURCE_ADMIN_PASSWORD:password,NETLIFY_BLOBS_CONTEXT:context};delete env.VERCEL;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env,stdio:['ignore','pipe','pipe']});
let output='';server.stdout.on('data',data=>{output+=data;});server.stderr.on('data',data=>{output+=data;});
const base=`http://127.0.0.1:${port}`;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Cloud test server did not start.')),20000);server.stdout.on('data',data=>{if(String(data).includes('Ready')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(Error(`Cloud test server exited ${code}: ${output.slice(-1000)}`));});});
 const missing='saved-000000000000000000000000';
 const media=await fetch(`${base}/api/resources/media/${missing}/00000000-0000-0000-0000-000000000000`,{signal:AbortSignal.timeout(3000)});
 assert.equal(media.status,404,'A missing cloud resource must return 404 promptly rather than hanging on its response body.');
 const login=await fetch(base+'/api/resources/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password}),signal:AbortSignal.timeout(3000)});
 assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const edit=await fetch(`${base}/api/resources/${missing}`,{method:'PUT',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({action:'save',version:1}),signal:AbortSignal.timeout(3000)});
 assert.equal(edit.status,404,'Owner edits of missing cloud records must return 404 promptly.');
 console.log('Resource cloud gate: missing media and owner lookups return promptly through the real Next fetch wrapper.');
}catch(error){console.error(output.slice(-1500));throw error;}
finally{
 server.kill('SIGTERM');await Promise.race([once(server,'exit'),new Promise(resolve=>setTimeout(resolve,3000))]);if(server.exitCode===null)server.kill('SIGKILL');backend.closeAllConnections();await new Promise(resolve=>backend.close(resolve));
}
