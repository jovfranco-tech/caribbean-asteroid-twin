import { SIM_END_MIN, SIM_START_MIN } from '@/data/ScenarioData';

/**
 * SimClock
 * ----------------------------------------------------------------------------
 * Mutable singleton that owns the simulation time `t` (in simulated minutes).
 *
 * It is intentionally NOT React state: updating state every frame at 60fps is
 * wasteful and causes the whole tree to re-render. Instead, the render loop
 * (useFrame) advances this clock by `dt * speed`, and UI components read a
 * throttled snapshot (~8Hz) via `subscribe`.
 *
 * tMin is clamped to [SIM_START_MIN, SIM_END_MIN].
 * ----------------------------------------------------------------------------
 */

export type Listener = (tMin: number) => void;

class SimClock {
  private tMin = SIM_START_MIN;
  private playing = false;
  private speed = 1; // 1x | 5x | 20x simulated minutes per real second base unit
  private listeners = new Set<Listener>();
  private throttleAcc = 0;
  private readonly throttleInterval = 1 / 8; // ~8Hz UI snapshots

  get value(): number {
    return this.tMin;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get speedValue(): number {
    return this.speed;
  }

  /** Advance the clock. dt is in real seconds. */
  advance(dt: number): void {
    if (!this.playing) return;
    // Base: 1 simulated minute per real second at 1x.
    this.tMin += dt * this.speed;
    if (this.tMin >= SIM_END_MIN) {
      this.tMin = SIM_END_MIN;
      this.playing = false;
    }
    if (this.tMin < SIM_START_MIN) this.tMin = SIM_START_MIN;

    this.throttleAcc += dt;
    if (this.throttleAcc >= this.throttleInterval) {
      this.throttleAcc = 0;
      this.emit();
    }
  }

  play(): void {
    if (this.tMin >= SIM_END_MIN) this.tMin = SIM_START_MIN;
    this.playing = true;
    this.emit();
  }

  pause(): void {
    this.playing = false;
    this.emit();
  }

  toggle(): void {
    this.playing ? this.pause() : this.play();
  }

  reset(): void {
    this.tMin = SIM_START_MIN;
    this.playing = false;
    this.emit();
  }

  setSpeed(s: number): void {
    this.speed = s;
    this.emit();
  }

  seek(tMin: number): void {
    this.tMin = Math.max(SIM_START_MIN, Math.min(SIM_END_MIN, tMin));
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.tMin); // immediate snapshot
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    for (const l of this.listeners) l(this.tMin);
  }
}

export const simClock = new SimClock();
