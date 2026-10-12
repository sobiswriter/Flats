# The final FLATS pass

This is a personal tribute to Foliage Games' FLATS, built with original procedural geometry and audio. It is not an official continuation, and no original game assets were copied.

## Nostalgia

The [Foliage Games description and original screenshots on TapTap](https://www.taptap.io/app/38890) identify Survival, Assortment and Headshot Challenge as solo modes. The images show colourful, textureless environments, monochrome characters, black weapons and bright bullet trails. The classic preset is an interpretation of that visual language. The five-wave survival mode recalls the original's escalating encounters. [Contemporary coverage from August 2015](https://www.droidgamers.com/news/flats-is-a-new-cross-platform-fps-game-for-mobile-devices/) also describes its survival waves and bright artwork.

## Feel

[Bungie's GDC talk about Destiny first-person animation](https://gdcvault.com/play/1022297/The-Art-of-First-Person) discusses physical animation that remains responsive. [Naughty Dog's ranged-combat talk](https://gdcvault.com/play/1034314/A-Second-Shot-Improving-Ranged) covers weapon feel, hit detection, input delay and validation. These are design references, rather than instructions to reproduce either game.

The resulting decisions are buffered button taps, a repeatable recoil sequence, quick ADS, subtle landing compression, support-hand reload travel, an empty-reload charging handle, readable directional damage and distinct fatal-hit confirmation. Animation never redirects mouse aim. The original screenshots supplied for Build 04 clearly show long coloured ricochet paths and exaggerated airborne hit poses. Ordinary glancing ricochets now follow those references; PRISM is this tribute's stronger three-bank variant.

## Ragdolls and slow motion

Bodies retain movement momentum and receive an exaggerated whole-body launch plus an impulse at the hit location. Six articulated body parts and a dropped rifle use real rigid-body physics. Low restitution, capped initial spin, sleeping and bounded lifetime keep the launches manageable. Ragdolls intentionally do not collide with other ragdolls or their own limbs; this protects solver stability at the cost of perfect self-contact.

The inset plays recorded player and rigid-body poses, with position/quaternion interpolation, a following side camera, and a 0.7-second freeze at a recorded airborne peak before the fall. Only its recording clock slows down. Live combat, input and scoring continue at normal speed. Replay speed is independently selectable.

## Performance

World meshes are batched by material; collision broad phases and ramp ray boxes are precomputed. Tracers, particles, audio noise buffers and local actor slots are reused. Physics uses SAP broad-phase collision and sleeping. Defaults cap ragdolls at six and effects at 120; Low reduces them to three and 65. Replay rendering is capped at 30 Hz and records poses only at 30 Hz, with five seconds of bounded history and at most two pending clips. Its WebGL context is created on demand.

Foreground browser stress samples used seven hard bots at native viewport scale. Classic/Standard and District/Low both reported a frame-time 95th percentile of about 17 ms on this Windows workstation (i5-1240P, 16 GB RAM; Iris Xe and GTX 1650 present). This is a sampled result, not a sustained guarantee for every machine. Background/occluded browser measurements are unsuitable for judging rendering throughput. F3 exposes raw frame percentiles, CPU time, draw calls and current object budgets; render scale and effect quality are adjustable.

The automated suite checks swept hits and reflection normals, ammo/cooldown accounting, full survival victory and failure, actual constrained-body settling and cleanup, replay interpolation, motion sensing, movement, reloading, match loops and the retained experimental server.

Build 04 foreground stress check (Classic/Standard, native 1921 × 987 viewport): seven hard bots, up to six corpses / 42 dynamic bodies, up to 119 live effects, and airborne body parts reaching roughly 3 meters. Over about 29 seconds of live simulation, the final diagnostic window reported 17 ms frame P95, 11.5 ms CPU P95 and 17.36 ms average frame time. Actual solo kills, an airborne replay hold, continued live waves during replay, and corpse settling were also observed in the browser. These are local samples, not a guarantee across hardware. The expanded suite has 35 checks, including three-bank paths, glancing reflections, garden cooldowns, outer-city routing, peak selection/hold, dropped-weapon cleanup and cosmetic corpse reactivation.

Build 05 replaces the arena cover park with a 224-metre street grid, 36 apartment blocks and a five-neighbourhood Survival route. All enemy entrances are authored around apartment corners, and FFA spawn scoring penalizes exposure and proximity. Tests verify a complete Survival route using actual movement, safe entrance geometry, travel-gated waves, automatic reload timing and ADS convergence. The complete suite passed 43 checks; after the final street-facing correction, the 19 affected movement/encounter checks passed again.

Browser validation observed an actual Market kill, automatic empty reload, 99.25% ADS blend after 100 ms, guidance toward Sunset Terrace, and wave two starting after walking there. The larger city reuses facade materials and simpler windows. A roughly 28-second foreground Classic/Standard stress run with seven hard bots reached six corpses and 120 live effects; the final window reported 16.8 ms frame P95, 9.2 ms CPU P95 and 16.69 ms average frame time on this workstation. The local result is not a universal frame-rate guarantee.

Build 06 changes Survival to guard-post encounters: stationary sentries and four-metre patrols, a forward sight cone plus line-of-sight acquisition, bounded engagement, brief last-seen search, and return to the assigned post. Gunfire does not cause unaware guards to converge. Free-for-all roaming is preserved. Browser validation observed no enemy fire and full player health during twelve seconds at the arrival street, then acquisition by the patrol guard after walking into its view while the other sentry held its post. Automated coverage checks patrol bounds, unaware gunfire response, reaction delay, loss of contact/return, rear-hit inspection, distant-target holding and unchanged FFA roaming.

Build 07 validation: all 60 simulation/physics/network checks passed. New checks cover different map collision/nav data, wall and side clearance for long barrels, single-chamber reloads, shotgun pellets/falloff and hit accounting, enemy sniper HP rules, melee edges/cooldowns/cover, boost stacking/expiry, scarce drop pickup/expiry, healing/ammo conservation and enemy reload continuity. Browser tests observed an AWP kill and auto reload, a shotgun fight with weapon bash, a kill-flow boost, F weapon pickup, long-barrel blocking without ammo loss, native local audio playback (ready state 4, playhead advancing), and map switching after an active replay.

Foreground Standard stress samples used seven hard bots, mixed enemy weapons, up to six corpses and 120 live effects. Classic reported approximately 17 ms frame P95 and 6.2 ms CPU P95; Foundry approximately 16.9 ms and 7.4 ms, with up to 15 drops visible. These local samples are not a universal guarantee. Shotgun hit bursts use fewer particles per pellet while retaining recorded bullet segments, and meshes/materials/audio noise buffers are pooled or reused. Foundry's final decorative pass replaces colourful tree crowns with steel hazard posts and adds freight signs.

No `public/dbgm.mp3` has been supplied yet. The server's default-track manifest currently reports unavailable, and the procedural synth plays as the fallback. Adding the file is detected by the live server at the next deployment or DEFAULT SOUNDTRACK action; local playlist playback has been verified with a generated test WAV. User music stays local to the browser session.
