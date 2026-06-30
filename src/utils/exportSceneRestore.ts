import * as THREE from 'three';
import { useAnimationStore } from '@/store/animationStore';
import { useSceneStore } from '@/store/sceneStore';
import { findThreeObjectById } from '@/utils/sceneUtils';

export interface ExportedTextureUvState {
  repeat: [number, number];
  offset: [number, number];
  wrapS: number;
  wrapT: number;
  rotation: number;
}

/** 导出前：确保 GLB 节点携带业务 id（clone 后仍保留） */
export function stampModelUserDataForExport(exportScene: THREE.Scene) {
  const { objects, getThreeObject } = useSceneStore.getState();

  exportScene.children.forEach((child) => {
    if (child.userData?.id) return;
    const matched = objects.find((obj) => {
      const source = getThreeObject(obj.id);
      return source?.name && source.name === child.name;
    });
    if (!matched) return;
    child.userData.id = matched.id;
    child.userData.businessId = matched.id;
  });

  exportScene.traverse((child) => {
    const id = child.userData?.id || child.userData?.editorId || child.userData?.businessId;
    if (!id) return;
    child.userData.id = id;
    child.userData.businessId = id;
  });
}

/** 收集带贴图动画对象的 UV 状态，供导出项目恢复 */
export function collectTextureUvStates(scene: THREE.Scene): Record<string, ExportedTextureUvState> {
  const animations = useAnimationStore.getState().textureUvAnimations;
  const states: Record<string, ExportedTextureUvState> = {};

  Object.keys(animations).forEach((objectId) => {
    const object = findThreeObjectById(scene, objectId);
    if (!object) return;

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const material = child.material as THREE.MeshStandardMaterial;
      if (!material?.map || states[objectId]) return;

      states[objectId] = {
        repeat: [material.map.repeat.x, material.map.repeat.y],
        offset: [material.map.offset.x, material.map.offset.y],
        wrapS: material.map.wrapS,
        wrapT: material.map.wrapT,
        rotation: material.map.rotation,
      };
    });
  });

  return states;
}

/** 根据 editor.objects 为运行时生成的 JS 恢复 id（写入导出模板） */
export function buildObjectIdRestoreScript(): string {
  return `
function restoreEditorObjectIds(modelRoot, editorObjects) {
  if (!modelRoot || !editorObjects?.length) return;
  const pending = [...editorObjects];

  const bind = (node) => {
    if (!node || node.userData?.id) return;
    const index = pending.findIndex((item) => item.name && item.name === node.name);
    if (index < 0) return;
    node.userData.id = pending[index].id;
    pending.splice(index, 1);
  };

  bind(modelRoot);
  modelRoot.traverse((child) => {
    if (child !== modelRoot) bind(child);
  });

  if (!modelRoot.userData?.id && pending.length === 1 && editorObjects.length === 1) {
    modelRoot.userData.id = pending[0].id;
  }
}

function applyTextureUvStates(modelRoot, states) {
  if (!modelRoot || !states) return;
  Object.entries(states).forEach(([objectId, state]) => {
    const target = findObjectById(modelRoot, objectId) || findObjectById(modelRoot.parent || modelRoot, objectId);
    if (!target || !state) return;
    target.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat?.map) return;
        mat.map.repeat.set(state.repeat?.[0] ?? 1, state.repeat?.[1] ?? 1);
        mat.map.offset.set(state.offset?.[0] ?? 0, state.offset?.[1] ?? 0);
        mat.map.wrapS = state.wrapS ?? THREE.RepeatWrapping;
        mat.map.wrapT = state.wrapT ?? THREE.RepeatWrapping;
        mat.map.rotation = state.rotation ?? 0;
        mat.map.needsUpdate = true;
      });
    });
  });
}

function prepareTextureAnimations(modelRoot, animations) {
  if (!modelRoot || !animations) return;
  Object.entries(animations).forEach(([objectId, cfg]) => {
    if (!cfg?.enabled) return;
    const target = findObjectById(modelRoot, objectId) || findObjectById(modelRoot.parent || modelRoot, objectId);
    if (!target) return;
    const keys = cfg.target === 'all'
      ? ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap']
      : ['map'];
    target.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        keys.forEach((key) => {
          const tex = mat?.[key];
          if (!tex) return;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.needsUpdate = true;
        });
      });
    });
  });
}
`.trim();
}
