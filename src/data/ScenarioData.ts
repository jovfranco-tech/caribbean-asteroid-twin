/**
 * ScenarioData
 * ----------------------------------------------------------------------------
 * FICTIONAL scenario constants for the cinematic digital-twin visualization.
 * NONE of these values represent a real asteroid, a real forecast, or real wave
 * physics. They are tuned purely for a dramatic, clearly-labeled visualization.
 * ----------------------------------------------------------------------------
 */

export interface GeoPoint {
  /** Longitude in degrees, [-180, 180] */
  lon: number;
  /** Latitude in degrees, [-90, 90] */
  lat: number;
}

export interface City extends GeoPoint {
  id: string;
  en: string;
  es: string;
  /** Arrival of the stylized wavefront at this city, in simulated minutes. */
  arrivalMin: number;
  /** Approximate great-circle distance from the impact site, km (illustrative). */
  distanceKm: number;
}

export interface TimelinePhase {
  tMin: number;
  en: string;
  es: string;
}

export const EARTH_RADIUS_UNITS = 2; // scene units
export const SEA_LEVEL = EARTH_RADIUS_UNITS; // surface of the globe

/** Hypothetical impact site: off the northern coast of Puerto Rico (Mona Passage area, fictional). */
export const IMPACT_SITE: GeoPoint = {
  lon: -66.6,
  lat: 18.6,
};

/**
 * Fictional asteroid trajectory start point (in deep-space direction, far north-east).
 * The asteroid travels from here toward IMPACT_SITE.
 */
export const ASTEROID_ORIGIN: GeoPoint = {
  lon: -52.0,
  lat: 38.0,
};

/** Fictional scenario telemetry — visual flavor only, not physical. */
export const SCENARIO = {
  id: 'PR-ASTEROID-01',
  energyLabelEn: '~1.2 × 10³ megatons TNT equiv.',
  energyLabelEs: '~1.2 × 10³ megatones equiv. TNT',
  craterLabelEn: 'Stylized transient crater ≈ 18 km',
  craterLabelEs: 'Cráter transitorio estilizado ≈ 18 km',
  propagationSpeedLabelEn: 'Visual wavefront ≈ 620 km/h (stylized)',
  propagationSpeedLabelEs: 'Frente de onda visual ≈ 620 km/h (estilizado)',
  peakWaveLabelEn: 'Peak stylized amplitude ≈ 12 m (visual scale)',
  peakWaveLabelEs: 'Amplitud máxima estilizada ≈ 12 m (escala visual)',
  confidenceEn: 'Cinematic simulation — not a scientific forecast.',
  confidenceEs: 'Simulación cinematográfica — no es un pronóstico científico.',
} as const;

/** Cities rendered as luminous labels on the globe. */
export const CITIES: City[] = [
  { id: 'sanjuan', lon: -66.1, lat: 18.47, en: 'San Juan', es: 'San Juan', arrivalMin: 3, distanceKm: 15 },
  { id: 'ponce', lon: -66.6, lat: 18.01, en: 'Ponce', es: 'Ponce', arrivalMin: 6, distanceKm: 66 },
  { id: 'santodomingo', lon: -69.93, lat: 18.49, en: 'Santo Domingo', es: 'Santo Domingo', arrivalMin: 26, distanceKm: 360 },
  { id: 'havana', lon: -82.36, lat: 23.13, en: 'Havana', es: 'La Habana', arrivalMin: 92, distanceKm: 1480 },
  { id: 'nassau', lon: -77.35, lat: 25.06, en: 'Nassau', es: 'Nassau', arrivalMin: 88, distanceKm: 1380 },
  { id: 'miami', lon: -80.19, lat: 25.76, en: 'Miami', es: 'Miami', arrivalMin: 150, distanceKm: 1800 },
];

/** Animated timeline phases (t in simulated minutes). */
export const PHASES: TimelinePhase[] = [
  { tMin: -3, en: 'Asteroid approach', es: 'Aproximación del asteroide' },
  { tMin: 0, en: 'Impact', es: 'Impacto' },
  { tMin: 5, en: 'Initial wave ring', es: 'Anillo de onda inicial' },
  { tMin: 30, en: 'Caribbean propagation', es: 'Propagación por el Caribe' },
  { tMin: 90, en: 'Bahamas corridor', es: 'Corredor de las Bahamas' },
  { tMin: 150, en: 'South Florida / Miami visual arrival', es: 'Arribo visual al sur de Florida / Miami' },
];

/** Total simulated window (minutes). */
export const SIM_START_MIN = -5;
export const SIM_END_MIN = 170;

/** Wave ring parameters (purely visual). */
export const WAVE_RINGS = [
  { colorHex: '#ff5a3c', lifespanMin: 60, maxRadiusKm: 900 }, // inner, hot
  { colorHex: '#ffb84d', lifespanMin: 120, maxRadiusKm: 1700 }, // mid, amber
  { colorHex: '#36c5ff', lifespanMin: 170, maxRadiusKm: 2600 }, // outer, cyan
];
