import {CONFIG as C} from './config.js';
export const WEAPONS={
 rifle:{id:'rifle',name:'AR–01',description:'ASSAULT RIFLE',capacity:C.capacity,reserve:C.reserve,damage:C.damage,headDamage:C.headDamage,fireInterval:C.fireInterval,reload:C.reload,emptyReload:C.emptyReload,insertTime:C.insertTime,spread:.018,adsSpread:.0025,pellets:1,range:192,barrelClearance:1.6,blockedDistance:1.25,lowerDistance:.8,scope:.75,movement:1},
 sniper:{id:'sniper',name:'AWP–01',description:'BOLT SNIPER',capacity:1,reserve:8,damage:150,headDamage:180,fireInterval:1.25,reload:.95,emptyReload:1.05,insertTime:.63,spread:.065,adsSpread:.0006,pellets:1,range:192,barrelClearance:2,blockedDistance:1.6,lowerDistance:1.05,scope:.23,movement:.88},
 shotgun:{id:'shotgun',name:'SPAS–12',description:'SHOTGUN',capacity:6,reserve:12,damage:14,headDamage:20,fireInterval:.65,reload:1.15,emptyReload:1.35,insertTime:.75,spread:.13,adsSpread:.1,pellets:8,range:26,barrelClearance:1.65,blockedDistance:1.3,lowerDistance:.8,scope:.85,movement:.97}
};
const UNARMED={...WEAPONS.rifle,id:'unarmed',name:'UNARMED',description:'F / RECOVER · V / BASH',capacity:0,reserve:0,movement:1.08,scope:1,barrelClearance:0,blockedDistance:0,lowerDistance:0};
export const weaponFor=p=>p.weapon==='unarmed'?UNARMED:WEAPONS[p.weapon]||WEAPONS.rifle;
export function rollEnemyWeapon(){const r=Math.random();return r<.5?'rifle':r<.8?'shotgun':'sniper'}
export function dropAmmo(weapon){return weapon==='sniper'?{ammo:1,reserve:3+Math.floor(Math.random()*3)}:weapon==='shotgun'?{ammo:3+Math.floor(Math.random()*4),reserve:6+Math.floor(Math.random()*5)}:{ammo:15+Math.floor(Math.random()*16),reserve:15+Math.floor(Math.random()*16)}}
