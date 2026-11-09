import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSceneStore } from '@/store/sceneStore';
import { useLightStore } from '@/store/lightStore';
import { findThreeObjectById } from '@/utils/sceneUtils';
import { detachTransformControlsIfAttached } from '@/utils/particleScene';
import { applyHistoryRedo, applyHistoryUndo } from '@/utils/applyHistoryTransform';
import * as THREE from 'three';

export function useKeyboardShortcuts() {
  const { setTool, toggleGrid, toggleAxes, editorMode, setEditorMode } = useEditorStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { selectedIds, removeObject, getThreeObject } = useSceneStore();
  const { selectedLightId, removeLight, selectLight } = useLightStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && editorMode === 'preview') {
        setEditorMode('scene');
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'q':
          setTool('select');
          break;
        case 'w':
          setTool('move');
          break;
        case 'e':
          setTool('rotate');
          break;
        case 'r':
          setTool('scale');
          break;
        case 'g':
          toggleGrid();
          break;
        case 'h':
          toggleAxes();
          break;
        case 'delete':
        case 'backspace':
          if (selectedIds.length > 0) {
            e.preventDefault();
            const scene = (window as any).__editorScene as THREE.Scene | undefined;

            selectedIds.forEach((id) => {
              if (scene) {
                const threeObj = findThreeObjectById(scene, id, getThreeObject);
                // 先 detach 再移出场景，避免 TransformControls scene graph 报错
                detachTransformControlsIfAttached(id, threeObj ?? undefined);
                if (threeObj?.parent) {
                  threeObj.parent.remove(threeObj);
                }
              } else {
                detachTransformControlsIfAttached(id);
              }
              removeObject(id);
            });
          } else if (selectedLightId) {
            e.preventDefault();
            detachTransformControlsIfAttached(selectedLightId);
            selectLight(null);
            removeLight(selectedLightId);
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canUndo()) {
              const entry = undo();
              if (entry) applyHistoryUndo(entry);
            }
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canRedo()) {
              const entry = redo();
              if (entry) applyHistoryRedo(entry);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setTool,
    toggleGrid,
    toggleAxes,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedIds,
    selectedLightId,
    removeObject,
    removeLight,
    selectLight,
    getThreeObject,
    editorMode,
    setEditorMode,
  ]);
}
