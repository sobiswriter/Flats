export const CONFIG={health:100,killLimit:20,timeLimit:480,respawn:3,protection:1.5,radius:.34,height:1.8,crouchHeight:1.15,speed:6.8,sprint:10.2,crouchSpeed:3.4,acceleration:55,gravity:25,jump:8.6,jumpHold:.18,coyote:.09,buffer:.12,capacity:30,reserve:60,damage:24,headDamage:60,fireInterval:.105,bulletSpeed:160,bulletGravity:1.1,bulletLife:1.2,reload:.92,emptyReload:1.18,insertTime:.58,maxPlayers:8,tick:1/60};
// Bots fire readable bursts, aim at the torso, and track rather than snap.
export const DIFFICULTY={easy:{reaction:1.2,error:.18,speed:.65,vision:24,burst:.23,pause:1.7,turn:2,damage:.6},normal:{reaction:.85,error:.11,speed:.8,vision:28,burst:.34,pause:1.2,turn:3,damage:.75},hard:{reaction:.5,error:.055,speed:.95,vision:34,burst:.48,pause:.8,turn:4.5,damage:1}};
export const SOLO={regenDelay:6,regenRate:.5,regenMax:4,regenRamp:18,spawnProtection:3,sensorRange:24};
export const PRISM={cost:3,cooldown:4,damage:1.25,bankDamage:1.5,bounces:3};
export const SURVIVAL={waves:5,breakTime:5,firstCount:2,maxCount:6};
export const PRESENTATION={maxRagdolls:6,ragdollLife:9,maxEffects:120,replayFps:30};
export const DEFAULT_BINDINGS={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',crouch:'ControlLeft',reload:'KeyR'};

export const FLOW={duration:4,maxStacks:3,perStack:.12};
