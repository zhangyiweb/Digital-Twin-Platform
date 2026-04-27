import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSceneStore } from '@/store/sceneStore';

export function useKeyboardShortcuts() {
  const { setTool, toggleGrid, toggleAxes } = useEditorStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { selectedIds, removeObject, getThreeObject } = useSceneStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按�?
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
          // 删除选中对象
          if (selectedIds.length > 0) {
            e.preventDefault();
            // 先detach TransformControls
            const transformControls = (window as any).__editorTransformControls;
            if (transformControls) {
              transformControls.detach();
            }
            
            selectedIds.forEach(id => {
              const threeObj = getThreeObject(id);
              if (threeObj && threeObj.parent) {
                threeObj.parent.remove(threeObj);
              }
              removeObject(id);
            });
          }
          break;
        case 'z':
          // Ctrl+Z / Cmd+Z 撤销
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canUndo()) {
              const entry = undo();
              if (entry) {
                // 执行撤销:恢复到before状态
                const { objectId, position, rotation, scale } = entry.before;
                const threeObj = getThreeObject(objectId);
                if (threeObj) {
                  threeObj.position.set(position[0], position[1], position[2]);
                  threeObj.rotation.set(rotation[0], rotation[1], rotation[2]);
                  threeObj.scale.set(scale[0], scale[1], scale[2]);
                }
              }
            }
          }
          break;
        case 'y':
          // Ctrl+Y / Cmd+Y 重做
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canRedo()) {
              const entry = redo();
              if (entry) {
                // 执行重做:恢复到after状态
                const { objectId, position, rotation, scale } = entry.after;
                const threeObj = getThreeObject(objectId);
                if (threeObj) {
                  threeObj.position.set(position[0], position[1], position[2]);
                  threeObj.rotation.set(rotation[0], rotation[1], rotation[2]);
                  threeObj.scale.set(scale[0], scale[1], scale[2]);
                }
              }
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTool, toggleGrid, toggleAxes, undo, redo, canUndo, canRedo, selectedIds, removeObject, getThreeObject]);
}
