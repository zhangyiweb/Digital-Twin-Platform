import * as THREE from 'three';
import type { CameraTour, CameraTourStop, Vec3 } from '@/types/cameraTour';

export type CameraTourPlayerState = 'idle' | 'playing' | 'paused' | 'dwelling';

export interface CameraTourPlayerOptions {
  onStopChange?: (index: number, stop: CameraTourStop) => void;
  onComplete?: () => void;
  onStateChange?: (state: CameraTourPlayerState) => void;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function lerpVec3(out: THREE.Vector3, a: Vec3, b: Vec3, t: number) {
  out.set(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

export class CameraTourPlayer {
  private camera: THREE.PerspectiveCamera;
  private controls: { target: THREE.Vector3; update: () => void; enabled: boolean };
  private tour: CameraTour;
  private options: CameraTourPlayerOptions;

  private state: CameraTourPlayerState = 'idle';
  private stopIndex = 0;
  private phase: 'transition' | 'dwell' = 'transition';
  private phaseElapsed = 0;

  private fromPosition = new THREE.Vector3();
  private fromTarget = new THREE.Vector3();
  private tempPosition = new THREE.Vector3();
  private tempTarget = new THREE.Vector3();

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: { target: THREE.Vector3; update: () => void; enabled: boolean },
    tour: CameraTour,
    options: CameraTourPlayerOptions = {}
  ) {
    this.camera = camera;
    this.controls = controls;
    this.tour = tour;
    this.options = options;
  }

  setTour(tour: CameraTour) {
    this.tour = tour;
    this.stop();
  }

  getState(): CameraTourPlayerState {
    return this.state;
  }

  getCurrentStopIndex(): number {
    return this.stopIndex;
  }

  isActive(): boolean {
    return this.state === 'playing' || this.state === 'dwelling';
  }

  play() {
    if (this.tour.stops.length === 0) return;
    this.controls.enabled = false;
    this.stopIndex = 0;
    this.beginTransitionFromCurrent();
    this.setState('playing');
  }

  pause() {
    if (this.state === 'playing' || this.state === 'dwelling') {
      this.setState('paused');
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.setState(this.phase === 'dwell' ? 'dwelling' : 'playing');
    }
  }

  stop() {
    this.state = 'idle';
    this.phaseElapsed = 0;
    this.controls.enabled = true;
    this.options.onStateChange?.('idle');
  }

  goToStop(index: number, immediate = false) {
    if (index < 0 || index >= this.tour.stops.length) return;
    this.controls.enabled = false;
    this.stopIndex = index;
    if (immediate) {
      const stop = this.tour.stops[index];
      this.camera.position.set(stop.position.x, stop.position.y, stop.position.z);
      this.controls.target.set(stop.target.x, stop.target.y, stop.target.z);
      this.controls.update();
      this.options.onStopChange?.(index, stop);
      return;
    }
    this.beginTransitionFromCurrent();
    this.setState('playing');
  }

  next() {
    if (this.tour.stops.length === 0) return;
    const next = Math.min(this.stopIndex + 1, this.tour.stops.length - 1);
    this.goToStop(next);
  }

  prev() {
    if (this.tour.stops.length === 0) return;
    const prev = Math.max(this.stopIndex - 1, 0);
    this.goToStop(prev);
  }

  update(delta: number) {
    if (this.state !== 'playing' && this.state !== 'dwelling') return;
    if (this.tour.stops.length === 0) return;

    const stop = this.tour.stops[this.stopIndex];
    if (!stop) return;

    this.phaseElapsed += delta;

    if (this.phase === 'transition') {
      const duration = Math.max(stop.transitionTime, 0.001);
      const t = easeInOutCubic(Math.min(this.phaseElapsed / duration, 1));
      lerpVec3(this.tempPosition, this.fromPosition, stop.position, t);
      lerpVec3(this.tempTarget, this.fromTarget, stop.target, t);
      this.camera.position.copy(this.tempPosition);
      this.controls.target.copy(this.tempTarget);
      this.controls.update();

      if (this.phaseElapsed >= duration) {
        this.phase = 'dwell';
        this.phaseElapsed = 0;
        this.setState('dwelling');
        this.options.onStopChange?.(this.stopIndex, stop);
      }
      return;
    }

    if (this.phaseElapsed >= stop.dwellTime) {
      this.advanceToNextStop();
    }
  }

  private setState(state: CameraTourPlayerState) {
    this.state = state;
    this.options.onStateChange?.(state);
  }

  private beginTransitionFromCurrent() {
    this.fromPosition.copy(this.camera.position);
    this.fromTarget.copy(this.controls.target);
    this.phase = 'transition';
    this.phaseElapsed = 0;
  }

  private advanceToNextStop() {
    const nextIndex = this.stopIndex + 1;
    if (nextIndex >= this.tour.stops.length) {
      if (this.tour.loop && this.tour.stops.length > 0) {
        this.stopIndex = 0;
        this.beginTransitionFromCurrent();
        this.setState('playing');
        return;
      }
      this.stop();
      this.options.onComplete?.();
      return;
    }
    this.stopIndex = nextIndex;
    this.beginTransitionFromCurrent();
    this.setState('playing');
  }
}

export function captureCurrentCameraState(): { position: Vec3; target: Vec3 } | null {
  const camera = (window as { __editorCamera?: THREE.PerspectiveCamera }).__editorCamera;
  const controls = (window as { __editorControls?: { target: THREE.Vector3 } }).__editorControls;
  if (!camera || !controls) return null;
  return {
    position: {
      x: parseFloat(camera.position.x.toFixed(3)),
      y: parseFloat(camera.position.y.toFixed(3)),
      z: parseFloat(camera.position.z.toFixed(3)),
    },
    target: {
      x: parseFloat(controls.target.x.toFixed(3)),
      y: parseFloat(controls.target.y.toFixed(3)),
      z: parseFloat(controls.target.z.toFixed(3)),
    },
  };
}

/** 将编辑器相机瞬间切换到指定视角（用于漫游点编辑） */
export function applyEditorCameraState(position: Vec3, target: Vec3): boolean {
  const camera = (window as { __editorCamera?: THREE.PerspectiveCamera }).__editorCamera;
  const controls = (window as {
    __editorControls?: { target: THREE.Vector3; update: () => void; enabled: boolean };
  }).__editorControls;
  if (!camera || !controls) return false;

  camera.position.set(position.x, position.y, position.z);
  controls.target.set(target.x, target.y, target.z);
  controls.enabled = true;
  controls.update();

  (window as { __editorCameraPosition?: Vec3 }).__editorCameraPosition = { ...position };
  (window as { __editorControlsTarget?: Vec3 }).__editorControlsTarget = { ...target };

  return true;
}
