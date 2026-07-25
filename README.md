# Caribbean Asteroid Twin

**A fictional cinematic digital twin for communicating complex geospatial scenarios through an interactive 3D command-center experience.**

[Open the live demo](https://caribbean-asteroid-twin.vercel.app) · [Jovan Franco](https://www.jovanfranco.com)

> ⚠️ **FICTIONAL SIMULATION — NOT A FORECAST OR EMERGENCY TOOL.**
>
> This project is a stylized educational and portfolio visualization. It must never be used for navigation, emergency planning, evacuation decisions, scientific prediction, or public-safety communication. There is no real asteroid or real impact. Wave propagation, arrival times, energy, crater size, and affected zones are illustrative—not scientific outputs.

## Executive overview

Caribbean Asteroid Twin explores how an executive command-center interface can make a complex, time-based geospatial narrative understandable without pretending that cinematic visualization is operational intelligence.

The experience presents a hypothetical asteroid approach near Puerto Rico, a stylized impact, and visual wavefronts propagating across the Caribbean toward South Florida. Users can inspect phases, city markers, telemetry, affected zones, camera presets, layers, and a scrubbable timeline.

The portfolio value is not the fictional event itself. It is the combination of:

- real-time 3D rendering and geospatial transformation;
- performance-aware React architecture;
- bilingual command-center UX;
- visible confidence and scenario boundaries;
- explicit responsible-use controls;
- deployable, responsive product delivery.

## Portfolio classification

| Dimension | Status |
| --- | --- |
| Product type | Interactive cinematic digital-twin demonstrator |
| Data source | Embedded fictional scenario constants |
| Scientific validity | None claimed |
| Backend | None |
| External APIs | None |
| Personal or customer data | None |
| Deployment | Public Vercel portfolio demo |
| Decision use | Prohibited for real-world decisions |

## What this project demonstrates

| Capability | Evidence in the product |
| --- | --- |
| 3D product engineering | React Three Fiber globe, atmosphere, lighting, particles, wave rings, camera transitions |
| Geospatial reasoning | Longitude/latitude conversion, haversine distance, destination points, geodesic rings |
| Performance architecture | Frame-driven mutable simulation clock with throttled React-state synchronization |
| Executive visualization | Telemetry, phases, affected zones, confidence language, timeline, layers, presets |
| Responsible communication | Persistent disclaimer, fictional labels, limitations, and prohibited-use statements |
| Internationalization | Bilingual English/Spanish interface |
| Responsive delivery | Adaptive quality and layout behavior for desktop and mobile |

## Fictional scenario

| Item | Illustrative value |
| --- | --- |
| Scenario ID | `PR-ASTEROID-01` |
| Impact site | 18.6°N, 66.6°W, Mona Passage area — fictional |
| Impact energy | ~1.2 × 10³ megatons TNT equivalent — stylized |
| Transient crater | ~18 km — stylized |
| Propagation speed | ~620 km/h — visual pacing |
| Peak wave height | ~12 m — visual scale |
| Confidence | Cinematic simulation; not a scientific forecast |

### Narrative timeline

| Time | Phase |
| --- | --- |
| T−05m | Asteroid approach |
| T+00m | Impact |
| T+05m | Initial visual wave ring |
| T+30m | Caribbean propagation |
| T+90m | Bahamas corridor |
| T+150m | South Florida visual arrival |

All city arrival times are manually tuned for narrative pacing and are not computed from bathymetry, fluid dynamics, or an emergency model.

## Product experience

### Controls

- Play, pause, reset, and timeline scrubbing
- 1×, 5×, and 20× simulation speed
- Puerto Rico, Caribbean Wide, Miami, and Space camera presets
- Wavefront, labels, impact radius, asteroid, timeline, and satellite-style layers
- Orbit, zoom, and bilingual language controls

### Responsible-use design

The application:

- keeps a fictional-scenario warning visible;
- avoids depicting casualties, victims, or graphic human harm;
- does not imitate breaking news or an official warning system;
- does not call the scenario a prediction;
- documents the difference between visual storytelling and scientific modeling.

Forks and derivative work should retain equivalent warnings and avoid presenting fictional outputs as real intelligence.

## Architecture

```text
src/
├── components/
│   ├── scene/     Globe, stars, impact, trajectory, labels, wave propagation
│   └── ui/        Header, telemetry, controls, disclaimer, timeline
├── data/          Fictional scenario constants and phases
├── hooks/         Clock-to-state bridge and translation helpers
├── i18n/          English and Spanish dictionaries
├── lib/           Geospatial utilities and simulation clock
├── state/         Zustand UI and settings state
├── three/         Procedural Earth texture and glow assets
├── App.tsx
└── main.tsx
```

### Performance model

The simulation clock is decoupled from React render state:

1. A mutable `SimClock` advances inside the React Three Fiber render loop.
2. Scene objects read the current time every frame.
3. UI panels receive a throttled snapshot at approximately 8 Hz.
4. React avoids re-rendering the entire scene at frame rate.

This keeps camera motion, wave rings, particles, and timeline controls responsive while maintaining inspectable UI state.

### Geospatial rendering

- `geo.ts` converts longitude and latitude into globe coordinates.
- Destination-point calculations generate curved rings on the sphere.
- Haversine calculations support illustrative distances.
- The visual wavefront follows globe curvature rather than flat screen-space circles.

## Technology

- React 18
- Vite and TypeScript
- Three.js through `@react-three/fiber` and `@react-three/drei`
- `@react-three/postprocessing` for Bloom
- Zustand for UI and settings state
- Procedural canvas-generated Earth texture, glow sprites, and starfield
- Vercel deployment

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Validation

```bash
npm run typecheck
npm run build
npm run preview
```

## Validation checklist

- [x] TypeScript and production build complete successfully
- [x] Persistent fictional-simulation disclaimer
- [x] Play, pause, reset, speed, camera, layer, and scrub controls
- [x] Responsive desktop and mobile layouts
- [x] Adaptive rendering quality for smaller or lower-power devices
- [x] No backend, external dataset, API key, or user-data dependency

## Known limitations

- **Not physical:** no shallow-water equations, bathymetry, impact model, or scientific solver.
- **Simplified geography:** coastlines and continents are stylized.
- **Illustrative timing:** arrival estimates are authored values.
- **Bundle size:** Three.js and postprocessing create a comparatively large front-end bundle.
- **Visual scope:** the project prioritizes narrative clarity over geographic or scientific precision.

A real emergency or research platform would require validated datasets, domain experts, uncertainty modeling, provenance, auditability, operational authorization, and institutional review.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Contributions must preserve the fictional classification and responsible-use boundaries.

## Security

See [`SECURITY.md`](SECURITY.md). Do not publish sensitive vulnerability details in a public issue.

## License

No open-source license is currently included. Public repository visibility does not grant permission to reuse the source or presentation as an official forecast, emergency system, or scientific model.
