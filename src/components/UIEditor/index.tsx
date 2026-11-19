import { ComponentPalette } from './ComponentPalette';
import { LayerTree } from './LayerTree';
import { UICanvas } from './UICanvas';
import { UIPropertyPanel } from './UIPropertyPanel';
import { usePanelResize } from '@/hooks/usePanelResize';
import './UIEditor.css';

export function UIEditor() {
  const leftWidth = usePanelResize({ axis: 'x', initial: 248, min: 180, max: 440, storageKey: 'ui-left-width' });
  const rightWidth = usePanelResize({ axis: 'x', initial: 300, min: 240, max: 560, storageKey: 'ui-right-width', reverse: true });

  const leftSplit = usePanelResize({ axis: 'y', initial: 50, min: 20, max: 80, storageKey: 'ui-left-split', percentage: true });

  return (
    <div className="ui-editor">
      <aside className="ui-editor-left" style={{ width: leftWidth.size, flexBasis: leftWidth.size, flexShrink: 0 }}>
        <div className="ui-editor-left-top" style={{ flex: `0 0 ${leftSplit.size}%` }}>
          <ComponentPalette />
        </div>
        <div
          className="panel-resize-handle panel-resize-handle-horizontal"
          role="separator"
          aria-label="调整组件库与图层树高度，双击恢复默认"
          aria-orientation="horizontal"
          aria-valuemin={20}
          aria-valuemax={80}
          aria-valuenow={leftSplit.size}
          tabIndex={0}
          {...leftSplit.handleProps}
        />
        <div className="ui-editor-left-bottom">
          <LayerTree />
        </div>
      </aside>

      <div
        className="panel-resize-handle panel-resize-handle-vertical"
        role="separator"
        aria-label="调整 UI 左侧面板宽度，双击恢复默认"
        aria-orientation="vertical"
        aria-valuemin={180}
        aria-valuemax={440}
        aria-valuenow={leftWidth.size}
        tabIndex={0}
        {...leftWidth.handleProps}
      />
      <main className="ui-editor-canvas">
        <UICanvas />
      </main>
      <div
        className="panel-resize-handle panel-resize-handle-vertical"
        role="separator"
        aria-label="调整 UI 右侧属性面板宽度，双击恢复默认"
        aria-orientation="vertical"
        aria-valuemin={240}
        aria-valuemax={560}
        aria-valuenow={rightWidth.size}
        tabIndex={0}
        {...rightWidth.handleProps}
      />
      <aside className="ui-editor-right" style={{ width: rightWidth.size, flexBasis: rightWidth.size, flexShrink: 0 }}>
        <UIPropertyPanel />
      </aside>
    </div>
  );
}
