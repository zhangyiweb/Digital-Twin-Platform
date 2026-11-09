import {
  AimOutlined,
  DragOutlined,
  ExpandOutlined,
  RedoOutlined,
  ReloadOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useEditorStore } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import type { EditorTool } from '@/types/scene';
import { applyHistoryRedo, applyHistoryUndo } from '@/utils/applyHistoryTransform';

const tools: { value: EditorTool; label: string; icon: React.ReactNode; key: string }[] = [
  { value: 'select', label: '选择', icon: <AimOutlined />, key: 'Q' },
  { value: 'move', label: '移动', icon: <DragOutlined />, key: 'W' },
  { value: 'rotate', label: '旋转', icon: <ReloadOutlined />, key: 'E' },
  { value: 'scale', label: '缩放', icon: <ExpandOutlined />, key: 'R' },
];

export function GizmoToolbar() {
  const { currentTool, setTool } = useEditorStore();
  // 在 selector 内计算，保证 history/currentIndex 变化时按钮一定刷新
  const canUndo = useHistoryStore((s) => s.currentIndex >= 0);
  const canRedo = useHistoryStore((s) => s.currentIndex < s.history.length - 1);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  const handleUndo = () => {
    const entry = useHistoryStore.getState().canUndo() ? undo() : null;
    if (entry) applyHistoryUndo(entry);
  };

  const handleRedo = () => {
    const entry = useHistoryStore.getState().canRedo() ? redo() : null;
    if (entry) applyHistoryRedo(entry);
  };

  return (
    <div className="gizmo-toolbar-wrap">
      <div className="gizmo-toolbar" role="toolbar" aria-label="变换工具">
        <button
          type="button"
          className="gizmo-btn"
          onClick={handleUndo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
          aria-label="撤销"
        >
          <UndoOutlined />
        </button>
        <button
          type="button"
          className="gizmo-btn"
          onClick={handleRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
          aria-label="重做"
        >
          <RedoOutlined />
        </button>

        <div className="gizmo-sep" aria-hidden="true" />

        {tools.map((tool) => {
          const isActive = currentTool === tool.value;
          return (
            <button
              key={tool.value}
              type="button"
              className={`gizmo-btn ${isActive ? 'active' : ''}`}
              onClick={() => setTool(tool.value)}
              title={`${tool.label} (${tool.key})`}
              aria-pressed={isActive}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
