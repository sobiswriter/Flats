import fs from 'node:fs';
export function defaultMusic(roots=['public','dist']){
 for(const root of roots)for(const name of ['dbgm.mp3','bgm.mp3']){
  const file=root+'/'+name;if(fs.existsSync(file))return{available:true,url:'/'+name,file};
 }
 return{available:false};
}
export function streamAudio(req,res,file){
 const size=fs.statSync(file).size,range=req.headers.range;
 let start=0,end=size-1,status=200;
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return}
  start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));end=m[1]&&m[2]?Math.min(size-1,Number(m[2])):size-1;
  if(start>=size||start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return}status=206;
 }
 const headers={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Length':end-start+1};if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return}const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
}
