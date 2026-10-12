import {SOLO} from './config.js';
export function motionContacts(player,players,time){
 if(!player||player.dead)return[];
 return players.filter(p=>p.id!==player.id&&!p.dead&&Math.hypot(p.x-player.x,p.z-player.z)<=SOLO.sensorRange&&((!p.crouch&&Math.hypot(p.vx,p.vz)>.8)||Math.abs(p.vy||0)>.5||time-(p.lastShot??-100)<.8)).map(p=>{
 const dx=p.x-player.x,dz=p.z-player.z;return{id:p.id,x:(dx*Math.cos(player.yaw)-dz*Math.sin(player.yaw))/SOLO.sensorRange,y:(dx*Math.sin(player.yaw)+dz*Math.cos(player.yaw))/SOLO.sensorRange,above:p.y-player.y>2,below:player.y-p.y>2};
 });
}
export class MotionSensor{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.contacts=new Map();this.pulse=0}
 clear(){this.contacts.clear()}
 draw(dt,player,players,time){
 this.pulse=(this.pulse+dt*.65)%1;const c=this.ctx,size=this.canvas.width,r=size*.43,center=size/2;
 c.clearRect(0,0,size,size);c.fillStyle='#111f29dd';c.beginPath();c.arc(center,center,r,0,Math.PI*2);c.fill();
 for(const scale of [1,.65,.32]){c.strokeStyle=scale===1?'#84aeb388':'#73969c33';c.lineWidth=scale===1?2:1;c.beginPath();c.arc(center,center,r*scale,0,Math.PI*2);c.stroke()}
 c.strokeStyle='#71949c25';c.beginPath();c.moveTo(center-r,center);c.lineTo(center+r,center);c.moveTo(center,center-r);c.lineTo(center,center+r);c.stroke();
 c.strokeStyle=`rgba(129,230,222,${(1-this.pulse)*.3})`;c.beginPath();c.arc(center,center,r*this.pulse,0,Math.PI*2);c.stroke();
 for(const contact of motionContacts(player,players,time))this.contacts.set(contact.id,{...contact,age:0});
 for(const [id,p]of this.contacts){p.age+=dt;if(p.age>.65){this.contacts.delete(id);continue}c.globalAlpha=1-p.age/.65;c.fillStyle='#ff825c';c.shadowColor='#ff744a';c.shadowBlur=7;const x=center+p.x*r*.94,y=center+p.y*r*.94;c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fill();if(p.above||p.below){c.font='10px monospace';c.fillText(p.above?'⌃':'⌄',x-3,y-6)}}
 c.shadowBlur=0;c.globalAlpha=1;c.fillStyle='#c7fff2';c.beginPath();c.moveTo(center,center-5);c.lineTo(center-4,center+4);c.lineTo(center+4,center+4);c.closePath();c.fill();
 }
}
