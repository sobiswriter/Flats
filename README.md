# FLATS

Version 0.1.2: a personal tribute to the colourful Foliage Games mobile shooter. An offline browser FPS with two open neighbourhoods, three weapons, survival guard missions, free-for-all, recoverable weapon throws, dynamic ragdolls and small slow-motion replays. Geometry and weapon effects are generated in code; the default soundtrack is your local MP3. Multiplayer remains experimental and disabled in the menu.

## Run

On Windows, double-click **Play-FLATS.cmd**. The launcher installs missing dependencies, builds the game and opens a desktop browser. Node.js 22+ is required.

Requires Node.js 22 or newer and a desktop browser with WebGL and hardware acceleration.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Choose your bot count and difficulty, then **DEPLOY**. Click the game if your browser asks to capture the mouse. Escape releases it. Embedded browsers that reject mouse capture automatically use drag-to-aim: hold right mouse and drag to aim, or left mouse and drag to aim while firing. A standalone desktop browser gives unrestricted mouse look.

To run the production game and multiplayer server together:

```sh
npm run build
npm start
```

Open http://localhost:3001. The default server binds only to localhost. For experimental LAN development, set `HOST=0.0.0.0` before starting the server. On the host network, other players open `http://HOST_LAN_IP:3001`, select Multiplayer, enter `ws://HOST_LAN_IP:3001`, and use the same room code. The first player creates the room. Multiplayer is currently disabled in the menu while solo is polished. The retained server code and network tests remain available for development. Each experimental room supports 2–8 human players. Empty rooms are deleted. After a match, use a new room code.

Hosting is **LAN / direct connect**, not a managed internet matchmaking service. Internet use requires a publicly reachable server and port forwarding or hosting; HTTPS pages require a TLS reverse proxy and a `wss://` endpoint. Do not expose an unprotected development server. `PORT` changes the production server port. The server serves `dist/` and WebSockets on the same port.

## Controls

| Input | Action |
|---|---|
| WASD | Move |
| Mouse | Aim |
| Left mouse | Automatic fire |
| Right mouse, held | Aim down sights |
| R | Reload |
| Space | Jump; hold for more height |
| Left Shift | Sprint |
| Left Ctrl | Crouch |
| E | Arm/cancel PRISM bank-shot round |
| V | Close-range bash |
| G | Throw the equipped weapon; F recovers it |
| F | Pick up a dropped weapon |
| B | Dismiss replay |
| M | Music player |
| F3 | Performance readout |
| Tab, held | Scoreboard |
| Escape | Pause solo / open menu online |

Controls menu remaps movement actions. Settings persist in local storage: FOV, sensitivity, separate effects and music volumes, shake, weapon motion, small slow-motion kill/death replays, invert Y, dismemberment, Classic/District visual identity, effect budget and render scale. Fullscreen is available in settings. Small replays default on and can be dismissed with V. They default to 0.4×, with 0.25× and 0.6× alternatives, and play in an independent window; the live simulation and your camera continue at normal speed. Online menu never pauses the server.

## Rules and tuning

100 health, first to 20 kills or 8 minutes, 3-second respawn. Solo spawn protection lasts three seconds and ends on firing. Healing begins after six seconds without damage, starts at 0.5 HP/second and ramps to 4 HP/second over the next 18 seconds. A hit resets the delay. Cyan resupply points restore 35 health. Normal bots deal 18 body damage, react in approximately 0.85 seconds, fire 0.34-second bursts with 1.2-second pauses, and see at most 28 meters. Easy bots are gentler; hard bots remain challenging. Human rifle damage is unchanged. The rifle has 30 magazine rounds and 60 reserve rounds. Body damage is 24; head damage is 60. Empty magazines automatically reload when reserve rounds remain (sprinting defers this until you stop). Tactical reloads retain unused rounds, refill at the magazine insertion event, and finish in 0.92 seconds; empty reloads finish in 1.18 seconds. Magazine capacity includes the available chambered shot; there is no separate +1 chamber mechanic.

PRISM costs three magazine rounds, banks up to three times, and has a four-second cooldown. It deals 1.25× direct damage and 1.5× after reflection; it cannot pass through cover. Press E before firing to arm the next round.

Survival has five waves, two initial enemies by default, at most seven simultaneous enemies, and five-second breaks. Bots pursue only you and do not respawn. You have one life; clearing all five waves wins. Health and ammunition carry between waves; use resupply and recovered weapons. Late-wave enemies have modestly higher health.

Core values and bot difficulty tuning live in `src/config.js` (`CONFIG`, `DIFFICULTY`, `SOLO`, `PRISM`, `SURVIVAL`, `PRESENTATION`). Arena geometry and spawn points live in `src/arena.js`. Restart the server after changing shared tuning and rebuild for production.

## Architecture

- `simulation.js`: shared movement, swept projectile collision, damage, weapon states, spawn selection, match rules, A* bot navigation, sight and sound awareness.
- `render.js`: Three.js arena and rifle, two-hand reload motion, tracer and impact effects, animated humanoids, Cannon constrained physical ragdolls and selective head separation. Debris expires after nine seconds; at most six ragdolls are retained (three on Low). Bodies sleep when settled.
- `replay.js`: bounded five-second recording of actual player poses, shots, hits, and ragdoll transforms; independent 0.4× replay clips with a small side camera.
- `sensor.js`: circular 24-meter motion sensor. Detects movement and recent gunfire, fades contacts, rotates with your aim, and suppresses quiet crouch movement. No map geometry or permanently visible opponents.
- `audio.js`: original procedural weapon, impact, footstep and dark synth sounds.
- `main.js`: controls, settings, menus, HUD, local solo simulation, client movement prediction and reconciliation. Remote visuals are smoothed toward authoritative snapshots.
- `server.mjs`: server-authoritative 60 Hz simulation and 20 Hz snapshots. Clients send controls, never positions, hit claims, ammunition or score. Sequence acknowledgements, payload limits, input clamps, heartbeat disconnects and room capacity checks.

## Verification

```sh
npm test
npm run build
```

Tests cover 30/60/144 Hz movement consistency, tap/held jump, sprint and crouch states, thin cover, muzzle obstruction, reload timing/conservation, damage, protection, scoring, respawn, A* routing and complete bot matches, open district movement, burst/reaction pacing, solo regeneration, motion-only sensor behavior, and bounded replay sampling. The network test starts an isolated server and connects two independent WebSocket clients with 70 ms input delay and 70 ms snapshot delay, moves them through the arena, verifies a kill and consistent ammo/score, reload, respawn, and disconnect cleanup.

Browser verification artifacts are generated in `output/playwright/`. Browser diagnostics are available read-only as `window.FLATS.diagnostics`. Static building geometry is merged by material to keep draw calls low. Foreground stress samples with seven hard bots reported about approximately 17 ms at the 95th percentile in both Classic/Standard and District/Low. See RESEARCH.md for hardware, conditions and limits; this is not a universal performance guarantee. F3 exposes live diagnostics.

## Current limitations

This is a playable first version, not a finished competitive shooter.

- Multiplayer has authoritative projectiles and immediate local firing feedback, but **no historical lag compensation**, jitter-buffer interpolation or replay infrastructure. Prediction uses a compact reconciliation scheme; prolonged packet delays can cause visible correction. No matchmaking, authentication or anti-cheat beyond authoritative rules and basic input validation.
- Bot navigation uses a floor grid and does not intentionally take elevated routes or strategically select cover. Aim has persistent error, limited tracking speed, delayed acquisition and burst pauses. Bots fight each other as well as you.
- Movement collision uses an upright circular footprint with vertical clearance and height checks against shared arena boxes and ramps, not a full swept physics capsule. Ragdolls use actual rigid bodies and cone-twist constraints.
- Humanoids are deliberately blocky. Reload includes magazine removal/insertion and support-hand travel, plus a charging-handle motion on empty reloads. Fingers are not articulated. Third-person reload is a simplified arm pose.
- Dismemberment is selective fatal head separation only. No gore or other detachable limbs yet.
- Solo uses an independent recorded kill/death replay inset with real hit events and ragdoll poses. Multiplayer replay remains unfinished and disabled.
- Music is a small original procedural synth sequence, rather than a composed soundtrack. Footsteps are local; remote spatial audio is simplified.
- Keyboard bindings are editable; mouse bindings are fixed. Desktop keyboard and mouse are required for gameplay.


## Build 02 — solo polish

Eight freestanding apartment blocks, open 110-meter district streets, brighter atmospheric lighting, distant skyline, and no perimeter walls or artificial movement clamp. The central cover keeps encounters readable while the surrounding routes offer space. The visual ground extends well beyond the combat district; bots patrol the district rather than an infinite world. Vertical camera pitch now agrees with projectile aim. Invert mouse Y is a separately persisted setting. The solo focus is reflected in the disabled multiplayer menu.

## Build 03 — the tribute edition

Classic is the default visual identity: bright flat colours, distinct pastel apartment blocks, colourful Flatmen, black weapon silhouettes and yellow hands. The darker District preset remains selectable. New five-wave Survival accompanies free-for-all. PRISM adds single-bank rifle shots; directional damage, kill-chain callouts, landing/weapon motion, repeatable recoil and combat reports improve feedback. Your latest run and eight recent reports save locally.

Replay poses interpolate, fatal hits have a small replay-only hold, and live simulation never slows down. Physics bodies receive location-based impulses with capped spin and clean up correctly. Effects and audio buffers are reused; collision queries are spatially culled; local actor slots are retained across restarts. User settings save automatically. Multiplayer remains disabled while the project focuses on offline solo.

[Research, original-game references and performance notes](RESEARCH.md).

## Build 04 — ricochet city

The supplied original FLATS screenshots guide the new Classic palette: saturated apartments, white windows, cyan and magenta bullet lines, and colourful trees. The navigable district now spans 156 × 156 meters with twenty apartment blocks, outer avenues, promenade crossings, lamps and four named resupply gardens. Walk through an active cyan pickup to restore 35 health and 60 reserve rounds, capped at your normal maximum; each garden recharges after 25 seconds. The ground remains open beyond the district.

Ordinary rifle rounds ricochet at glancing angles, up to twice, losing damage at each bounce. PRISM reflects at any valid surface up to three times. Long persistent lines follow the actual swept projectile segments and surface endpoints instead of short travelling streaks.

Fatal shots launch six constrained body parts with a stronger upward kick, hit-location torque and a separate tumbling rifle. Later bullet paths can wake and kick existing bodies; these cosmetic corpse hits never award damage or kills. Corpses do not collide with one another or their own limbs. Standard keeps six corpses (42 dynamic bodies including rifles); Low keeps three. Bodies sleep, settle and are removed after nine seconds.

Replay clips retain two seconds after the kill, choose the highest recorded torso pose within the first 0.65 seconds, ease into it, freeze for 0.7 real seconds, then continue the recorded fall. The camera follows that actual torso. Hit shards are reconstructed cosmetic effects; body transforms and bullet endpoints are recorded. Live movement, aim and combat remain at normal speed. V dismisses the inset and replays can be disabled in Settings.

## Build 05 — neighbourhood survival

The old central cover park is removed. A 224 × 224 metre grid now has 36 apartments, connected roads and pavements, crosswalks, parked cars, benches, street trees, overhead district signs and shop fronts. These features provide cover through city geometry rather than scattered arena blocks. Shared facade materials and simpler windows reduce rendering overhead despite the larger map.

Survival is a five-location route: Chroma Market → Sunset Terrace → East Promenade → Lime Gardens → Central Terminal. You start on the market arrival street, facing the junction. Each district has eight hand-placed corner entrances; waves use distinct entrances behind apartment corners, then enemies advance along street routes. After a clear, the next wave waits for both the five-second break and your arrival within 12 metres of its junction. Follow the cyan beacon, destination distance and direction arrow. There is no between-wave teleport. Normal movement integration is tested through the complete route and final victory.

FFA starts around the market, uses the same authored entrance network, and selects safe respawns around the current fight. It strongly penalizes points within 14 metres of living players and exposed sightlines, with neighbouring-sector fallback when local entrances are crowded. Bots patrol connected city junctions rather than picking arbitrary spawn coordinates as destinations. Protection still ends on firing.

Reloads now seat the magazine at 0.58 seconds, finish tactically at 0.92 seconds, or finish from empty at 1.18 seconds. Animation uses separate lift, magazine removal/seating and empty-bolt actions. Held fire resumes after the animation completes. No-reserve weapons do not loop reloads. ADS uses a frame-independent response with over 98% blend reached in 100 ms.

## Build 06 — guard-post missions

Survival uses the district's authored corner entrances as assigned guard posts. Alternate enemies are stationary lookouts or patrol a short four-metre sidewalk route with pauses. They no longer march toward the junction at deployment or follow distant gunfire. Spotting requires unobstructed sight within a roughly 140-degree forward cone, with the existing acquisition delay. Taking a hit makes an unaware guard pause and turn toward the attacker before visually acquiring them.

After contact, guards engage near their post, hold position against distant targets, and remain within an 18-metre pursuit leash. Lost contact produces a three-second search of the last observed position, followed by a return to the post or patrol. There is no knowledge of the player's subsequent position through walls and no shared alarm that pulls every guard into combat. Free-for-all keeps its roaming/hearing behaviour. Survival is now about locating and clearing defended corners before following the next district beacon.

## Build 07 — the arsenal update

Choose **FLATS / 2015 — Chroma City** or **FLATS / 2026 — Foundry** directly in the launch panel. Chroma has 36 apartments, colourful street trees and shops. Foundry has 20 narrower industrial blocks, four low freight depots, wider alleys, open outer yards, hazard-lit steel posts and its own district signs. Both support solo FFA and the five-stage guard mission. Their collision and navigation geometry are rebuilt when you switch maps; the previous render context and assets are released. The selected map and starting weapon save locally.

The starting loadout choices are AR–01, AWP–01 and SPAS–12. Enemy weapons randomize on deployment and respawn: roughly 50% rifles, 30% shotguns and 20% snipers. The AWP has a single chamber, strong scoped accuracy, larger hip spread, a reload after every shot and a 1.25-second firing interval. SPAS fires eight pellets with spread and damage falling off over its 26-metre reach; its six-shell magazine reloads quickly. Enemy snipers have much larger aim error and a 2.1-second firing interval. A hit on a human at 50 HP or above leaves 10 HP; a hit below 50 HP kills. Bot-versus-bot and human sniper hits use normal weapon damage.

V bashes for 60 damage within 2.1 metres, with a 0.65-second cooldown, a forward hit cone and cover checks. B dismisses a replay. F replaces your current gun with the nearest visible enemy drop within 2.4 metres. As of 0.1, enemy drops last 45 seconds, cap at 24, and contain useful randomized rounds. Player-swapped or thrown weapons keep their exact ammunition and remain for 90 seconds. There is one carried gun rather than a three-gun inventory. Resupply adds up to two magazines of reserve ammunition for your current weapon and 35 health, without deleting ammunition you already carry. Enemy reload reserves replenish when empty so missed shots do not permanently silence a guard; their dropped ammo is randomized.

Each human kill grants FLOW: +12% movement speed per stack, capped at three (+36%). A kill refreshes the four-second window; expiration or death clears the stacks. The HUD shows stacks and time remaining. As of 0.1, gradual passive recovery starts after a six-second quiet period; between-wave refilling remains off. Respawns still reset your loadout.

Guns retract as the barrel approaches a surface, lower fully against close walls and refuse obstructed shots without spending ammo. ADS lowers during a bash, reload or wall obstruction. Very short fire clicks are buffered so single-shot guns do not miss input ticks. All three guns have distinct first-person shapes and reports; snipers have a scope overlay, shotguns have a pump action, and enemy shots use stereo direction and audible distance falloff.

**FLATS RADIO** is available from the menu, pause panel or M. Add local audio files to a session-only playlist, play/pause, select tracks, skip and adjust volume. Local music is not uploaded. The built-in procedural synth remains the fallback. Put your default song at **public/bgm.mp3** (or **public/dbgm.mp3**, preferred if both exist): the running local server detects it on the next deployment or DEFAULT SOUNDTRACK click and streams it without a rebuild. A production build also packages it if present. The launch gesture starts BGM; if a browser blocks imported-track autoplay, use PLAY. Weapon balance lives in `src/weapons.js`.

## Version 0.1 — recovery and momentum

Enemy drops now contain AR 15–30 loaded rounds + 15–30 reserve, SPAS 3–6 shells + 6–10 reserve, or AWP 1 loaded shot + 3–5 reserve. F swaps weapons while leaving your old gun on the ground with its ammunition unchanged, including empty guns. A 0.3-second pickup delay prevents an immediate accidental swap back.

G throws the equipped weapon at 34 m/s with gravity and swept collision against walls and enemies. A direct hit deals 160 damage, enough to kill every survival guard, and triggers the normal kill, FLOW and replay systems. The thrown weapon lands as a recoverable pickup. You can bash with V while unarmed. Throws are limited to eight in flight; drops cap at 24 and favour retaining player-owned guns.

The SPAS now has a wide ribbed pump, tubular magazine, pistol grip and folding stock rather than an assault-rifle receiver. Its sharp initial crack, low boom and mechanical pump are different from the AR's short dry report and the AWP's heavy ringing crack. Flying and dropped guns use simple shared models.

FLOW has cyan peripheral streaks that animate while moving; damage flashes red and shows its direction. Below 35 HP, black corners pulse and the health number turns red. The centre of the screen stays clear. Quiet-time regeneration builds from 0.5 to 4 HP/s, caps at 100, and resets on every hit. Motion/reduced-motion preferences limit speed animations.

Radio detects your supplied bgm.mp3, loops the default track, selects newly imported local songs immediately, supports seeking, and explains when the browser requires an explicit PLAY click. Local songs remain on the device. The server streams byte ranges for seeking; the production build includes the default song. A single imported song loops; multiple imported songs advance through the local playlist.

Performance work includes bounded reusable weapon meshes, HUD text updates at 12.5 Hz, per-frame crosshair and hit effects, and camera projection updates only when its field of view changes. Physics and Three.js ship as separate cacheable bundles.

Release verification: 68 automated tests pass, including real ragdoll physics, five-district survival progression, weapon recovery/throw collisions, progressive healing, music byte ranges and two-client network regression checks. The production build completes without bundle warnings. Browser checks exercised MP3/WAV import, playlist switching, playback controls, default-track looping, throw kills and recovery, and damage/low-health effects. Seven-bot Standard-quality matches reached six ragdolls and 120 effects on each map with a measured 16.9 ms frame P95 on the development machine (CPU P95: Chroma 6.4 ms, Foundry 8.7 ms). These measurements describe this machine and run, not every browser or device.

## Version 0.1.1 — punch and presence

All three guns have stronger attack transients and heavier low-frequency bodies. Nearby enemy shots are almost as present as your own, with gentler distance falloff and stereo bearing. A lighter compressor preserves their initial crack; a separate peak limiter controls simultaneous gunfire. Native offline audio checks measured approximately 1.5–2.2 times the previous early RMS amplitude for player shots and 2.1–3.1 times for enemy shots at 30 metres, depending on the gun.

Enemy snipers now alternate warning misses with an aimed third or fourth shot, choosing a fresh three/four-shot cycle after each aimed attempt. The aimed shot follows a visible target's current torso position; it remains a normal projectile that movement and cover can evade. It never applies guaranteed damage through cover. Their existing 10-HP hit rule and slower firing cadence remain. Guard post ordering shuffles within safety tiers; FFA spawn ranking varies among similarly safe planned entrances. The survival arrival and district progression remain deliberate.

Throws have increased speed and lower gravity, with an actual 20-metre target hit covered by regression tests. FLOW now has 24 outward peripheral streaks, a cyan tunnel glow, a stronger HUD badge, a short activation sound and smooth FOV widening of up to 10.5 degrees outside ADS. Damage flashes last half a second; critical corners pulse more visibly below 35 HP. These presentation layers remain bounded and preserve a clear central aiming area. The automated suite now has 71 passing checks.

Both mode selectors support 1–7 AI combatants. In survival this sets the first-wave count; subsequent waves increase to a maximum of seven, with unique planned guard posts.

## Version 0.1.2 — combat feedback and enemy voices

Every solo kill refreshes the entire four-second FLOW timer, including kills at the three-stack cap. A brief refresh cue makes the reset explicit. Head hits have a small gold HEADSHOT label and a distinct bright confirmation sound, deduplicated by trigger for shotgun pellets.

Enemies use 11 bundled CC0 voice clips: three acquisition callouts from Kenney and four pain/four death reactions from Badre-Eddine on OpenGameArt. Files and source/license credits live in public/voices. Callouts require sight of the human; pain reactions are throttled; death interrupts that actor’s prior reaction. Distance and stereo bearing position the voices, small actor-dependent pitch shifts add variety, and only three voices can play together. Pausing/leaving stops pending voices. Enemy voices can be disabled in Settings; Effects volume also applies.

Replace or extend alert, pain, and death lists in public/voices/manifest.json to use your own short voice recordings, including a Hey you! callout. Files play locally and are packaged into the build. The shipped selection adds approximately 200 KB. Nine focused timer, feedback and guard checks passed; browser playback decoded all eleven clips without failures.
