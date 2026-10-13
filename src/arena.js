// A street grid with five encounter junctions; all gameplay geometry is shared.
export const CITY_SIZE=224;
const CLASSIC_DISTRICTS=[{id:'market',name:'CHROMA MARKET',x:-36,z:-36},{id:'terrace',name:'SUNSET TERRACE',x:36,z:-36},{id:'promenade',name:'EAST PROMENADE',x:36,z:36},{id:'gardens',name:'LIME GARDENS',x:-36,z:36},{id:'terminal',name:'CENTRAL TERMINAL',x:0,z:0}];
export let DISTRICTS=CLASSIC_DISTRICTS.map(d=>({...d}));export let ACTIVE_MAP='classic';
export const SURVIVAL_ROUTE=[0,1,2,3,4];
export function nearestDistrict(p){return DISTRICTS.reduce((best,d)=>Math.hypot(d.x-p.x,d.z-p.z)<Math.hypot(best.x-p.x,best.z-p.z)?d:best,DISTRICTS[0])}
export let ENTRANCES=DISTRICTS.flatMap(d=>[[-29,-18],[-18,-29],[29,-18],[18,-29],[-29,18],[-18,29],[29,18],[18,29]].map(([x,z],index)=>({x:d.x+x,z:d.z+z,sector:d.id,index,entry:{x:d.x+(Math.abs(x)===29?x:0),z:d.z+(Math.abs(z)===29?z:0)}})));
export let SPAWNS=ENTRANCES.map(p=>[p.x,p.z]);
export let SUPPLIES=DISTRICTS.map(d=>({x:d.x+5,z:d.z+5,name:d.name}));
export const DISTANT_BUILDINGS=Array.from({length:24},(_,i)=>{const angle=i/24*Math.PI*2,r=145+(i%3)*13;return{x:Math.sin(angle)*r,z:Math.cos(angle)*r,w:8,h:12+(i%5)*4,d:10,kind:'skyline'}});
const cells=[-90,-54,-18,18,54,90];
export let BLOCKS=[
 ...cells.flatMap((x,xi)=>cells.map((z,zi)=>({x,z,w:20,h:11+((xi*3+zi*5)%5)*3,d:20,kind:'building',label:String(xi*6+zi+1).padStart(2,'0')}))),
 ...DISTRICTS.flatMap((d,i)=>[{x:d.x-11,z:d.z-4,w:4.4,h:1.25,d:1.8,kind:'car',color:i},{x:d.x+12,z:d.z+4,w:4.4,h:1.25,d:1.8,kind:'car',color:i+1},{x:d.x+5,z:d.z-6,w:3,h:1,d:.65,kind:'bench'},{x:d.x-6,z:d.z+5,w:.7,h:2.8,d:.7,kind:'tree'}]),
 ...[-72,0,72].flatMap(x=>[-84,-48,12,48,84].map(z=>({x:x+6,z,w:.7,h:2.8,d:.7,kind:'tree'}))),
 ...DISTANT_BUILDINGS
];
export function topAt(b,x,z){if(b.kind==='ramp')return b.h*Math.max(0,Math.min(1,(z-b.z)/b.d*b.direction+.5));return b.h}
export function inBlock(b,x,z,pad=0){return Math.abs(x-b.x)<b.w/2+pad&&Math.abs(z-b.z)<b.d/2+pad}
export function rayBox(o,d,b,max=Infinity){let near=0,far=max;for(const [axis,c,size] of [['x',b.x,b.w],['y',b.h/2,b.h],['z',b.z,b.d]]){let lo=c-size/2,hi=c+size/2;if(Math.abs(d[axis])<1e-8){if(o[axis]<lo||o[axis]>hi)return null;continue}let a=(lo-o[axis])/d[axis],v=(hi-o[axis])/d[axis];if(a>v)[a,v]=[v,a];near=Math.max(near,a);far=Math.min(far,v);if(near>far)return null}return near}
export function wallDistance(o,d,max=100){return wallHit(o,d,max)?.t??max}
export function lineOfSight(a,b){let dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,l=Math.hypot(dx,dy,dz);return wallDistance(a,{x:dx/l,y:dy/l,z:dz/l},l)>=l-.1}
export function eye(p){return {x:p.x,y:p.y+(p.crouch?.98:1.62),z:p.z}}
export function direction(yaw,pitch){return{x:-Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:-Math.cos(yaw)*Math.cos(pitch)}}
// Static collision data is built once. Broad-phase queries avoid scanning the city per footstep.
let collisionGrid=new Map();const cellSize=8;
for(const b of BLOCKS)for(let x=Math.floor((b.x-b.w/2-1)/cellSize);x<=Math.floor((b.x+b.w/2+1)/cellSize);x++)for(let z=Math.floor((b.z-b.d/2-1)/cellSize);z<=Math.floor((b.z+b.d/2+1)/cellSize);z++){const key=`${x},${z}`;if(!collisionGrid.has(key))collisionGrid.set(key,[]);collisionGrid.get(key).push(b)}
export function nearbyBlocks(x,z){return collisionGrid.get(`${Math.floor(x/cellSize)},${Math.floor(z/cellSize)}`)||[]}
let rayBoxes=BLOCKS.flatMap(b=>b.kind==='ramp'?Array.from({length:12},(_,i)=>{const z=b.z-b.d/2+(i+.5)*b.d/12;return{...b,z,d:b.d/12,h:topAt(b,b.x,z)}}):[b]);
export function wallHit(o,d,max=100){
 let nearest=max,result=null;
 const endX=o.x+d.x*max,endZ=o.z+d.z*max,minX=Math.min(o.x,endX),maxX=Math.max(o.x,endX),minZ=Math.min(o.z,endZ),maxZ=Math.max(o.z,endZ);
 for(const b of rayBoxes){if(b.x+b.w/2<minX||b.x-b.w/2>maxX||b.z+b.d/2<minZ||b.z-b.d/2>maxZ)continue;
  let near=0,far=nearest,axis=null,sign=0,valid=true;
  for(let i=0;i<3;i++){const ov=i===0?o.x:i===1?o.y:o.z,dv=i===0?d.x:i===1?d.y:d.z,c=i===0?b.x:i===1?b.h/2:b.z,half=(i===0?b.w:i===1?b.h:b.d)/2;
   if(Math.abs(dv)<1e-8){if(ov<c-half||ov>c+half){valid=false;break}continue}let a=(c-half-ov)/dv,v=(c+half-ov)/dv;if(a>v)[a,v]=[v,a];if(a>=near-1e-8&&a>=-1e-8){near=Math.max(0,a);axis=i;sign=dv>0?-1:1}far=Math.min(far,v);if(near>far){valid=false;break}}
  if(valid&&near<=nearest){nearest=near;result={t:near,normal:{x:axis===0?sign:0,y:axis===1?sign:0,z:axis===2?sign:0},block:b}}
 }
 if(d.y<0){const t=-o.y/d.y;if(t>=0&&t<nearest)result={t,normal:{x:0,y:1,z:0},block:null}}
 return result;
}

const classicBlocks=BLOCKS.map(b=>({...b})),arenaCache=new Map();
function buildArenaData(id='classic'){
 const map=id==='district'?'district':'classic',foundry=map==='district',names=['WEST FREIGHT','NORTH WORKS','EAST DOCKS','SERVICE YARD','REACTOR JUNCTION'];
 const districts=CLASSIC_DISTRICTS.map((d,i)=>({...d,name:foundry?names[i]:d.name}));
 const blocks=classicBlocks.filter(b=>!foundry||b.kind!=='building'||Math.abs(b.x)<72&&Math.abs(b.z)<72||Math.abs(b.x)>72&&Math.abs(b.z)<36).map(b=>({...b,...foundry&&b.kind==='building'?{w:16,d:16,h:8+(Number(b.label)%4)*4}:{}}));
 if(foundry)for(const x of [-90,90])for(const z of [-54,54])blocks.push({x,z,w:16,h:4,d:24,kind:'warehouse'});
 const entrances=districts.flatMap(d=>[[-29,-18],[-18,-29],[29,-18],[18,-29],[-29,18],[-18,29],[29,18],[18,29]].map(([x,z],index)=>({x:d.x+x,z:d.z+z,sector:d.id,index,entry:{x:d.x+(Math.abs(x)===29?x:0),z:d.z+(Math.abs(z)===29?z:0)}})));
 const spawns=entrances.map(p=>[p.x,p.z]);
 const supplies=districts.map(d=>({x:d.x+5,z:d.z+5,name:d.name}));
 const grid=new Map();
 for(const b of blocks)for(let x=Math.floor((b.x-b.w/2-1)/cellSize);x<=Math.floor((b.x+b.w/2+1)/cellSize);x++)for(let z=Math.floor((b.z-b.d/2-1)/cellSize);z<=Math.floor((b.z+b.d/2+1)/cellSize);z++){const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(b)}
 return{id:map,districts,blocks,entrances,spawns,supplies,grid,rayBoxes:blocks};
}
export function getArenaData(id='classic'){const key=id==='district'?'district':'classic';if(!arenaCache.has(key))arenaCache.set(key,buildArenaData(key));return arenaCache.get(key)}
export function preloadArenas(){getArenaData('classic');getArenaData('district')}
export function configureArena(id='classic'){const data=getArenaData(id);ACTIVE_MAP=data.id;DISTRICTS=data.districts;BLOCKS=data.blocks;ENTRANCES=data.entrances;SPAWNS=data.spawns;SUPPLIES=data.supplies;collisionGrid=data.grid;rayBoxes=data.rayBoxes;return data}
export function weaponClearance(p){const e=eye(p),d=direction(p.yaw,p.pitch),right={x:Math.cos(p.yaw),z:-Math.sin(p.yaw)};let distance=wallDistance(e,d,2);for(const side of [0,.42]){const o={x:e.x+right.x*side,y:e.y-.16,z:e.z+right.z*side};const near=wallDistance(e,{x:right.x,y:0,z:right.z},side);if(near<side)return 0;distance=Math.min(distance,wallDistance(o,d,2))}return distance}
