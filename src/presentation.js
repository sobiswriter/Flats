import {weaponFor} from './weapons.js';
export const CLASSIC_COLOURS={0x35404a:0xeeeeeb,0x46515d:0xffc642,0x252f3b:0x6a8cdc,0x67717c:0xffd3a1,0x71808d:0x9aaef0,0x8a8583:0xf3c56e,0x263c4b:0xffffff,0x9eaaa9:0xf7dac4,0x2d3742:0xaecbd7,0xa6aa9c:0xfff0ba,0x6e7981:0xf1d082,0x222c32:0x131720,0x56636b:0x29293b,0x131b20:0x0a1020,0x8f9a9d:0xffd23e,0x2d363e:0xffb636};
export const RECOIL=[.008,.009,.01,.011,.012,.012,.011,.01];
export const RECOIL_YAW=[.0007,-.0002,.0006,-.0005,.0003,-.0008,.0004,-.0005];
export function percentile(values,fraction){if(!values.length)return 0;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(sorted.length*fraction))]}
export function hitBearing(player,attacker){if(!attacker)return 0;const world=Math.atan2(-(attacker.x-player.x),-(attacker.z-player.z));return Math.atan2(Math.sin(world-player.yaw),Math.cos(world-player.yaw))}

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function blendADS(current,target,dt){return current+(target-current)*(1-Math.exp(-42*dt))}
export function weaponReloadPose(p){if(!p.reload)return{dip:0,mag:0,charge:0};const t=p.reloadTotal-p.reload,w=weaponFor(p);return{dip:smooth(0,.09,t)*(1-smooth(p.reloadTotal-.17,p.reloadTotal,t)),mag:smooth(.08,.24,t)*(1-smooth(w.insertTime-.2,w.insertTime,t)),charge:p.reloadEmpty||p.weapon==='sniper'?smooth(.75,.88,t)*(1-smooth(.9,1.05,t)):0}}
