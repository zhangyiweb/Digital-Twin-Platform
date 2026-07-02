import * as THREE from 'three';
import { findThreeObjectById } from '@/utils/sceneUtils';

export interface ExportedTextureUvState {
  repeat: [number, number];
  offset: [number, number];
  wrapS: number;
  wrapT: number;
  rotation: number;
}

export const DEFAULT_EDITOR_UV = {
  repeatX: 1,
  repeatY: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
} as const;

/** Three.js 新建贴图未改 UV 时的出厂状态 */
export function isFactoryDefaultTextureUv(tex: THREE.Texture): boolean {
  return (
    tex.repeat.x === 1 &&
    tex.repeat.y === 1 &&
    tex.offset.x === 0 &&
    tex.offset.y === 0 &&
    tex.rotation === 0 &&
    tex.wrapS === THREE.ClampToEdgeWrapping &&
    tex.wrapT === THREE.ClampToEdgeWrapping
  );
}

/** 将出厂默认贴图规范为编辑器默认（重复包裹） */
export function normalizeTextureUvIfFactoryDefault(tex: THREE.Texture): void {
  if (!isFactoryDefaultTextureUv(tex)) return;
  tex.wrapS = DEFAULT_EDITOR_UV.wrapS;
  tex.wrapT = DEFAULT_EDITOR_UV.wrapT;
  tex.needsUpdate = true;
}

const TEXTURE_MAP_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'emissiveMap',
  'aoMap',
  'bumpMap',
] as const;

export function normalizeMaterialTextureUvs(material: THREE.Material): void {
  const record = material as unknown as Record<string, THREE.Texture | undefined>;
  TEXTURE_MAP_KEYS.forEach((key) => {
    const tex = record[key];
    if (tex) normalizeTextureUvIfFactoryDefault(tex);
  });
}

export function normalizeObjectTextureUvs(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material) normalizeMaterialTextureUvs(material);
    });
  });
}

export function readTextureUvState(tex: THREE.Texture): ExportedTextureUvState {
  normalizeTextureUvIfFactoryDefault(tex);
  return {
    repeat: [tex.repeat.x, tex.repeat.y],
    offset: [tex.offset.x, tex.offset.y],
    wrapS: tex.wrapS,
    wrapT: tex.wrapT,
    rotation: tex.rotation,
  };
}

/** 将导出的 UV 状态写回贴图 */
export function applyTextureUvStateToTexture(tex: THREE.Texture, state: ExportedTextureUvState): void {
  tex.repeat.set(state.repeat[0], state.repeat[1]);
  tex.offset.set(state.offset[0], state.offset[1]);
  tex.wrapS = state.wrapS as THREE.Wrapping;
  tex.wrapT = state.wrapT as THREE.Wrapping;
  tex.rotation = state.rotation ?? 0;
  tex.needsUpdate = true;
}

/** 按对象 ID 恢复场景中贴图的 UV 参数 */
export function applyTextureUvStates(
  scene: THREE.Scene,
  root: THREE.Object3D | null,
  states: Record<string, ExportedTextureUvState>,
  getThreeObject?: (id: string) => THREE.Object3D | undefined
): void {
  if (!root || !states) return;

  Object.entries(states).forEach(([objectId, state]) => {
    const target =
      getThreeObject?.(objectId) ||
      findThreeObjectById(scene, objectId, getThreeObject) ||
      findThreeObjectById(scene, objectId);
    if (!target) return;

    target.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        const record = material as unknown as Record<string, THREE.Texture | undefined>;
        TEXTURE_MAP_KEYS.forEach((key) => {
          const tex = record[key];
          if (tex) applyTextureUvStateToTexture(tex, state);
        });
      });
    });
  });
}

/** 写入导出项目 main.js 的运行时规范化逻辑 */
export function buildTextureUvNormalizeScript(): string {
  return `
function isFactoryDefaultTextureUv(tex) {
  return (
    tex.repeat.x === 1 &&
    tex.repeat.y === 1 &&
    tex.offset.x === 0 &&
    tex.offset.y === 0 &&
    tex.rotation === 0 &&
    tex.wrapS === THREE.ClampToEdgeWrapping &&
    tex.wrapT === THREE.ClampToEdgeWrapping
  );
}

function normalizeMaterialTextureUvs(material) {
  if (!material) return;
  const keys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap'];
  keys.forEach((key) => {
    const tex = material[key];
    if (!tex || !isFactoryDefaultTextureUv(tex)) return;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
  });
}

function normalizeModelTextureUvs(modelRoot) {
  if (!modelRoot) return;
  modelRoot.traverse((child) => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => normalizeMaterialTextureUvs(mat));
  });
}
`.trim();
}
