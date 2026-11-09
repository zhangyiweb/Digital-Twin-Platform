import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { useHistoryStore } from '@/store/historyStore';
import type { HistoryEntry, TransformSnapshot } from '@/store/historyStore';
import { findThreeObjectById, disposeObject3DResources } from '@/utils/sceneUtils';
import { detachTransformControlsIfAttached } from '@/utils/particleScene';
import { disposeLabelAnchor } from '@/utils/sceneLabel';

/** 将历史快照中的变换写回场景对象 */
export function applyTransformSnapshot(snapshot: TransformSnapshot) {
  const scene = (window as unknown as { __editorScene?: THREE.Scene }).__editorScene;
  if (!scene) return;

  const { getThreeObject, updateObject, objects } = useSceneStore.getState();
  const threeObj = findThreeObjectById(scene, snapshot.objectId, getThreeObject);

  if (threeObj) {
    threeObj.position.set(...snapshot.position);
    threeObj.rotation.set(...snapshot.rotation);
    threeObj.scale.set(...snapshot.scale);
    if (objects.some((o) => o.id === snapshot.objectId)) {
      updateObject(snapshot.objectId, {
        position: snapshot.position,
        rotation: snapshot.rotation,
        scale: snapshot.scale,
      });
    }
  }
}

function removeObjectByHistoryId(objectId: string) {
  const scene = (window as unknown as { __editorScene?: THREE.Scene }).__editorScene;
  const { getThreeObject, removeObject } = useSceneStore.getState();
  const threeObj = scene
    ? findThreeObjectById(scene, objectId, getThreeObject)
    : getThreeObject(objectId) ?? null;

  detachTransformControlsIfAttached(objectId, threeObj ?? undefined);
  if (threeObj?.parent) {
    threeObj.parent.remove(threeObj);
    disposeLabelAnchor(threeObj);
    disposeObject3DResources(threeObj);
  }
  removeObject(objectId);
}

/** 执行撤销（支持变换 / 添加） */
export function applyHistoryUndo(entry: HistoryEntry) {
  if (entry.type === 'add') {
    const id = entry.objectId || entry.after.objectId;
    if (id) removeObjectByHistoryId(id);
    return;
  }
  applyTransformSnapshot(entry.before);
}

/** 执行重做（添加类暂不恢复对象，仅恢复变换） */
export function applyHistoryRedo(entry: HistoryEntry) {
  if (entry.type === 'add') {
    return;
  }
  applyTransformSnapshot(entry.after);
}

/** 写入一条「添加对象」历史，便于 Ctrl+Z 撤销添加 */
export function pushAddObjectHistory(
  objectId: string,
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  },
  description = 'add object'
) {
  const snapshot: TransformSnapshot = {
    objectId,
    position: transform.position,
    rotation: transform.rotation,
    scale: transform.scale,
  };
  useHistoryStore.getState().push({
    type: 'add',
    description,
    before: snapshot,
    after: snapshot,
    objectId,
  });
}
