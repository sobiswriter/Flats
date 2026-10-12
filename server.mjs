import http from 'node:http';
import {defaultMusic,streamAudio} from './music-files.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {WebSocketServer} from 'ws';
import {Match} from './src/simulation.js';
import {CONFIG} from './src/config.js';
const port=Number(process.env.PORT||3001),rooms=new Map();let nextId=0;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.json':'application/json'};
const server=http.createServer((req,res)=>{if(req.url?.split('?')[0]==='/music-default.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify((({file,...manifest})=>manifest)(defaultMusic())));return}if(['/dbgm.mp3','/bgm.mp3'].includes(req.url?.split('?')[0])){const name=req.url.split('?')[0].slice(1),file=['public/','dist/'].map(root=>root+name).find(f=>fs.existsSync(f));if(file){streamAudio(req,res,file);return}}const base=path.resolve('dist');let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{res.writeHead(400).end();return}const file=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Run npm run build to serve FLATS. WebSocket server is ready.');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res)});
const wss=new WebSocketServer({server,maxPayload:8192});
function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data))}
wss.on('connection',ws=>{let room=null,p=null,lastSeq=-1,messageCount=0,lastWindow=Date.now();ws.alive=true;ws.on('pong',()=>ws.alive=true);send(ws,{type:'connected'});
ws.on('message',raw=>{if(Date.now()-lastWindow>1000){messageCount=0;lastWindow=Date.now()}if(++messageCount>150){ws.close(1008,'Too many messages');return}let m;try{m=JSON.parse(raw)}catch{return}
 if(m.type==='join'&&!p){const code=String(m.room||'FOUNDRY').replace(/[^a-z0-9_-]/gi,'').slice(0,16).toUpperCase()||'FOUNDRY';room=rooms.get(code);if(!room){room={match:new Match(),clients:new Map(),lastEvent:0};rooms.set(code,room)}if(room.clients.size>=CONFIG.maxPlayers){send(ws,{type:'error',message:'This room is full (8 players).'});return}if(room.match.ended){send(ws,{type:'error',message:'This match has ended. Choose a new room code.'});return}p=room.match.addPlayer('p'+(++nextId),'OPERATOR '+String(nextId).padStart(2,'0'));room.clients.set(ws,p);send(ws,{type:'joined',id:p.id,room:code,snapshot:room.match.snapshot()})}
 if(m.type==='input'&&p&&!room.match.ended){const i=m.input;if(!i||!Number.isSafeInteger(m.seq)||m.seq<=lastSeq)return;lastSeq=m.seq;p.input={sequence:m.seq,forward:Math.max(-1,Math.min(1,Number(i.forward)||0)),right:Math.max(-1,Math.min(1,Number(i.right)||0)),yaw:Number.isFinite(i.yaw)?i.yaw:p.yaw,pitch:Number.isFinite(i.pitch)?i.pitch:p.pitch,...Object.fromEntries(['fire','ads','reload','jump','crouch','sprint'].map(k=>[k,!!i[k]]))}}
 });ws.on('close',()=>{if(room){room.clients.delete(ws);room.match.players=room.match.players.filter(e=>e!==p);room.match.emit('disconnect',{player:p?.id});if(!room.clients.size)for(const [key,r] of rooms)if(r===room)rooms.delete(key)}})
});
let ticks=0,lastTick=performance.now(),accumulator=0;setInterval(()=>{const now=performance.now();accumulator+=Math.min(.2,(now-lastTick)/1000);lastTick=now;while(accumulator>=CONFIG.tick){accumulator-=CONFIG.tick;for(const room of rooms.values()){room.match.step(CONFIG.tick);if(ticks%3===0){const events=room.match.events.filter(e=>e.id>room.lastEvent);room.lastEvent=room.match.eventId;for(const ws of room.clients.keys())send(ws,{type:'state',snapshot:room.match.snapshot(),events})}}ticks++}},8);
setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue}ws.alive=false;ws.ping()}},15000).unref();
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`FLATS local game: http://localhost:${port} (HOST can enable experimental LAN hosting)`));
