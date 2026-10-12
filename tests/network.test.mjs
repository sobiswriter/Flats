import {test} from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {WebSocket} from 'ws';import {findPath} from '../src/simulation.js';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('two independent clients under latency agree on ammo, kills, respawn and disconnect',{timeout:65000},async()=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3002'},stdio:['ignore','pipe','pipe']});let a,b;
 try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject)});
 async function client(){const ws=new WebSocket('ws://localhost:3002'),c={ws,id:null,state:null,events:[],seq:0};await new Promise((resolve,reject)=>{ws.on('error',reject);ws.on('open',()=>ws.send(JSON.stringify({type:'join',room:'TEST'})));ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='joined'){c.id=m.id;c.state=m.snapshot;resolve()}if(m.type==='state')setTimeout(()=>{c.state=m.snapshot;c.events.push(...m.events)},70)})});c.send=i=>{const msg=JSON.stringify({type:'input',seq:++c.seq,input:i});setTimeout(()=>{if(ws.readyState===1)ws.send(msg)},70)};return c}
 a=await client();b=await client();await wait(200);assert.equal(a.state.players.length,2);assert.equal(b.state.players.length,2);
 async function navigate(c,x,z){const initial=c.state.players.find(p=>p.id===c.id),path=findPath(initial,{x,z});path.push({x,z});let end=Date.now()+25000;while(path.length&&Date.now()<end){const p=c.state.players.find(p=>p.id===c.id),g=path[0],d=Math.hypot(g.x-p.x,g.z-p.z);if(d<.65){path.shift();continue}const yaw=Math.atan2(-(g.x-p.x),-(g.z-p.z));c.send({forward:.4,yaw,pitch:0});await wait(40)}c.send({forward:0});await wait(300);assert.equal(path.length,0,'navigation completed: '+JSON.stringify(c.state.players.find(p=>p.id===c.id))+' goal '+JSON.stringify(path[0]))}
 await Promise.all([navigate(a,-36,-32),navigate(b,-36,-36)]);
 for(let i=0;i<55;i++){const p=a.state.players.find(p=>p.id===a.id),t=a.state.players.find(p=>p.id===b.id);if(t.dead)break;const yaw=Math.atan2(-(t.x-p.x),-(t.z-p.z));a.send({yaw,pitch:-.06,fire:true,ads:true});await wait(50)}a.send({fire:false});await wait(400);
 const pa=a.state.players.find(p=>p.id===a.id),pb=b.state.players.find(p=>p.id===a.id);assert.equal(pa.kills,1);assert.equal(pb.kills,1);assert.equal(pa.ammo,pb.ammo);assert.ok(pa.ammo<30);assert.equal(a.events.filter(e=>e.type==='kill').length,1);assert.equal(b.events.filter(e=>e.type==='kill').length,1);
 await wait(3400);assert.equal(a.state.players.find(p=>p.id===b.id).dead,false);a.send({reload:true});await wait(2600);a.send({reload:false});await wait(200);assert.equal(a.state.players.find(p=>p.id===a.id).ammo,30);assert.equal(a.state.players.find(p=>p.id===a.id).reserve,b.state.players.find(p=>p.id===a.id).reserve);
 b.ws.close();await wait(350);assert.equal(a.state.players.length,1);assert.ok(a.events.some(e=>e.type==='disconnect'));
 }finally{a?.ws.close();b?.ws.close();child.kill()}
});

