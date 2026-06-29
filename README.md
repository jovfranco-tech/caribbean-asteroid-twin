# Caribbean Asteroid Twin — Fictional Cinematic Digital Twin

> ⚠️ **FICTIONAL SIMULATION.** This project is a **stylized, cinematic, educational visualization**.
> It is **NOT** a real forecast, prediction, or emergency tool. It must **never** be used for
> navigation, evacuation planning, or any real-world decision. There is no real asteroid, no real
> impact, and the wave propagation is a purely visual approximation — not a tsunami model.

A 3D "Disaster Digital Twin Command Center" web experience: a stylized globe of the Caribbean
where a **hypothetical** asteroid impacts near Puerto Rico and luminous wavefronts propagate
toward Miami. Built for portfolio/demo purposes — visual storytelling, not science.

---

## ✅ Quick start

```bash
npm install
npm run dev      # open http://localhost:5173
```

Other commands:

```bash
npm run build      # type-check (tsc) + production build → dist/
npm run preview    # preview the production build
npm run typecheck  # tsc only
```

Requirements: Node 18+ (developed on Node 22). No backend, no API keys, no external datasets.

---

## The fictional scenario

| Item | Value (visual flavor only) |
| --- | --- |
| Scenario ID | `PR-ASTEROID-01` |
| Impact site | 18.6°N, 66.6°W (Mona Passage area, **fictional**) |
| Impact energy | ~1.2 × 10³ megatons TNT equiv. (stylized) |
| Transient crater | ~18 km (stylized) |
| Propagation speed | ~620 km/h (visual) |
| Peak wave height | ~12 m (visual scale) |
| Confidence | **Cinematic simulation — not a scientific forecast.** |

### Timeline (simulated minutes)

| Time | Phase |
| --- | --- |
| T−05m | Asteroid approach |
| T+00m | Impact |
| T+05m | Initial wave ring |
| T+30m | Caribbean propagation |
| T+90m | Bahamas corridor |
| T+150m | South Florida / Miami visual arrival |

Arrival times per city (San Juan ~3m, Ponce ~6m, Santo Domingo ~26m, Nassau ~88m, Havana ~92m,
Miami ~150m) are **illustrative**, tuned for narrative pacing, **not** computed from real physics.

---

## Disclaimer / responsible use

This visualization:

- Is labeled as **fictional** at all times (persistent top banner + footer note).
- Does **not** depict victims, casualties, blood, or explicit destruction of people.
- Is **not** alarmist — it reads as a resilience/demo command-center, not news.
- Must **not** be presented as a prediction of any real event.

If you fork or extend this project, keep the disclaimer visible in the UI and in any derivative
documentation.

---

## Tech stack

- **React 18 + Vite + TypeScript**
- **Three.js** via **@react-three/fiber** + **@react-three/drei**
- **@react-three/postprocessing** (Bloom) for the cinematic glow
- **Zustand** for UI/settings state
- **Procedural assets only**: the Earth texture, glow sprites, and starfield are all generated
  in-code on `<canvas>` — no downloaded imagery or map tiles.

---

## Architecture

The simulation clock is **decoupled from React state** for performance: a mutable singleton
(`SimClock`) advances each frame inside the R3F render loop, and UI panels read a throttled
snapshot (~8 Hz) via a subscription bridge. This keeps the 3D scene running at 60 fps without
re-rendering the React tree every frame.

```
src/
├── data/
│   └── ScenarioData.ts          # Fictional scenario constants, cities, phases, wave rings
├── lib/
│   ├── geo.ts                   # lon/lat→world, haversine, destination-point, geodesic rings
│   └── simClock.ts              # Mutable simulation clock (singleton, frame-driven)
├── state/
│   └── useSimStore.ts           # Zustand: language, camera mode, layers, live t mirror
├── i18n/
│   └── dict.ts                  # Bilingual EN/ES strings
├── hooks/
│   └── useSim.ts                # Clock→store bridge + translation helpers
├── three/
│   └── earthTexture.ts          # Procedural equirectangular Earth texture + glow sprites
├── components/
│   ├── scene/
│   │   ├── ImpactScene.tsx      # R3F Canvas, lighting, camera driver, post-processing
│   │   ├── Earth.tsx            # Textured globe + atmosphere/haze shaders
│   │   ├── Stars.tsx            # Procedural starfield
│   │   ├── CityLabels.tsx       # Luminous city markers + HTML labels (arrival-aware)
│   │   ├── AsteroidTrajectory.tsx  # Approach phase: rock + glow + trail
│   │   ├── ImpactEffect.tsx     # Flash, shockwave ring, ejecta, persistent crater
│   │   └── WavePropagation.tsx  # Expanding geodesic wavefront rings
│   └── ui/
│       ├── UIOverlay.tsx        # Root HTML overlay
│       ├── DisclaimerBar.tsx    # Always-visible fictional-scenario banner
│       ├── HeaderOverlay.tsx    # Title, language toggle, legend, phase tag
│       ├── CommandPanel.tsx     # Telemetry + affected zones + confidence
│       └── TimelineControls.tsx # Play/pause/reset, speed, cameras, layers, timeline scrub
├── styles/                      # Design tokens + app CSS
├── App.tsx
└── main.tsx
```

### Component responsibilities

- **ImpactScene** — owns the `Canvas`, scene lighting, the per-frame clock advance, and smooth
  camera transitions between presets. Conditionally enables Bloom on high quality.
- **CaribbeanMap / Earth** — procedural globe with simplified continents + high-detail Caribbean
  landmasses, luminous coastlines, graticule grid, and additive atmosphere shaders.
- **WavePropagation** — three concentric rings rebuilt every frame with the destination-point
  formula so they hug the globe's curvature (not flat screen-space circles).
- **AsteroidTrajectory** — the asteroid travels along a quadratic bezier from deep space to the
  impact site during the approach phase, with an oriented glowing trail.
- **CommandPanel / TimelineControls** — the command-center UI (telemetry, affected zones,
  transport, speed, camera modes, layer toggles, scrubbable phase timeline).

### Controls

- **Play / Pause / Reset** — transport the simulation clock.
- **Speed** — 1× / 5× / 20× (simulated minutes per real second).
- **Camera** — Puerto Rico · Caribbean Wide · Miami · Space View.
- **Layers** — Wavefronts · Labels · Impact Radius · Asteroid · Timeline · Satellite View.
- **Orbit** — drag to rotate, scroll/pinch to zoom.
- **Language** — EN/ES toggle (top-right).

---

## Validation checklist

- [x] `npm run build` passes (tsc + vite build, 0 errors).
- [x] No TypeScript errors (`npm run typecheck` clean).
- [x] No references to real prediction/forecast (all such terms appear only inside disclaimers
      that explicitly negate them).
- [x] UI shows a persistent, visible fictional-simulation disclaimer (top banner + footer).
- [x] Animation can be paused and reset; timeline is scrubbable.
- [x] Runs on desktop and mobile (responsive panels, adaptive DPR, quality auto-downgrades on
      small screens).

---

## Risks / limitations

- **Not physical.** Wave propagation uses geodesic rings with hand-tuned radii and lifespans —
  there is no shallow-water equation solver, no bathymetry, no real tsunami modeling.
- **Simplified geography.** Continents are low-detail silhouettes; only the Caribbean region is
  rendered with higher fidelity. Coastlines are stylized, not survey-accurate.
- **Bundle size.** Three.js + postprocessing produce a ~1 MB JS bundle (gzip ~300 KB). Acceptable
  for a demo; consider code-splitting if embedded in a larger app.
- **Performance.** Bloom + 128-segment rings are GPU-light but disabled automatically on small /
  low-power screens (quality = "low").

---

## Suggested next improvements

- Swap procedural texture for a real low-res Blue Marble / Natural Earth raster (with proper
  licensing) for higher realism.
- Add a bathymetry-aware wave-speed model so ring expansion varies with ocean depth.
- Integrate deck.gl/MapLibre for an optional 2D map inset with real coastlines.
- Add an audio bed (sub-bass impact rumble, ambient drone) with mute toggle.
- Persist language/layer preferences to `localStorage`.
- Add a "narration" caption track synced to the timeline phases.
