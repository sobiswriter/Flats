// A bounded recording of the actual solo simulation and ragdoll transforms.
export class ReplayBuffer {
 constructor(){this.frames=[];this.events=[];this.pending=[];this.active=null;this.clock=0;this.speed=.4;this.freeze=0;this.fatalHeld=false}
 clear(){this.frames=[];this.events=[];this.pending=[];this.active=null;this.clock=0}
 shouldRecord(time){return !this.frames.length||time-this.frames.at(-1).time>=1/30-.001}
 record(time,players,corpses=[]){
  if(this.frames.length&&time-this.frames.at(-1).time<1/30-.001)return;
  this.frames.push({time,players:players.map(p=>({id:p.id,name:p.name,weapon:p.weapon,x:p.x,y:p.y,z:p.z,yaw:p.yaw,pitch:p.pitch,dead:p.dead,crouch:p.crouch,vx:p.vx,vz:p.vz})),corpses});
  while(this.frames.length&&this.frames[0].time<time-5)this.frames.shift();
  this.events=this.events.filter(e=>e.time>time-5);
 }
 event(time,event){if(['shot','hit','kill','ricochet','trail'].includes(event.type))this.events.push({...event,time})}
 request(time,event){this.pending.push({time,event});if(this.pending.length>2)this.pending.shift()}
 update(dt,time){
  if(this.active){if(this.freeze>0)this.freeze=Math.max(0,this.freeze-dt);else{const peak=this.active.peak-this.active.start,distance=peak-this.clock,rate=distance>0&&distance<.22?Math.min(this.speed,.14):this.speed,next=this.clock+dt*rate;if(!this.fatalHeld&&next>=peak){this.clock=peak;this.fatalHeld=true;this.freeze=.7}else this.clock=next}if(this.clock>=this.active.duration){this.active=null;this.clock=0}}
  for(const item of this.pending){if(item.clip||time<item.time+2.1)continue;const start=Math.max(this.frames[0]?.time||0,item.time-.65),end=item.time+2;
   const frames=this.frames.filter(f=>f.time>=start&&f.time<=end),events=this.events.filter(e=>e.time>=start&&e.time<=end);
   if(frames.length>1){let peak=item.time+.18,height=-Infinity;for(const f of frames){if(f.time<item.time+.12||f.time>item.time+.65)continue;const torso=f.corpses.find(c=>c.id===item.event.player+':'+item.event.id)?.parts.find(p=>p.name==='torso');if(torso&&torso.position[1]>height){height=torso.position[1];peak=f.time}}item.clip={time:item.time,peak,event:item.event,frames,events,start,duration:frames.at(-1).time-start};}
  }
  if(!this.active&&this.pending[0]?.clip){this.active=this.pending.shift().clip;this.clock=0;this.freeze=0;this.fatalHeld=false}
  return this.active?{clip:this.active,time:this.active.start+this.clock,frozen:this.freeze>0}:null;
 }
}
export function sampleReplay(frames,time){
 let index=0;while(index<frames.length-2&&frames[index+1].time<time)index++;
 const a=frames[index],b=frames[Math.min(index+1,frames.length-1)],alpha=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time||1)));
 const corpses=(a.corpses||[]).map(c=>{const next=(b.corpses||[]).find(n=>n.id===c.id);if(!next)return c;return {...c,parts:c.parts.map(part=>{const other=next.parts.find(n=>n.name===part.name);if(!other)return part;const dot=part.quaternion.reduce((sum,v,i)=>sum+v*other.quaternion[i],0),sign=dot<0?-1:1,q=part.quaternion.map((v,i)=>v+(other.quaternion[i]*sign-v)*alpha),length=Math.hypot(...q);return {...part,position:part.position.map((v,i)=>v+(other.position[i]-v)*alpha),quaternion:q.map(v=>v/(length||1))}})}});
 if(time>=b.time)for(const c of b.corpses||[])if(!corpses.some(n=>n.id===c.id))corpses.push(c);
 return {players:a.players.map(p=>{const next=b.players.find(n=>n.id===p.id)||p;const state=time>=b.time?next:p;if(p.dead!==next.dead)return{...state};return {...state,x:p.x+(next.x-p.x)*alpha,y:p.y+(next.y-p.y)*alpha,z:p.z+(next.z-p.z)*alpha,yaw:p.yaw+Math.atan2(Math.sin(next.yaw-p.yaw),Math.cos(next.yaw-p.yaw))*alpha}}),corpses};
}
