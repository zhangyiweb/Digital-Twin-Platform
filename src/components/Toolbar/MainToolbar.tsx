import { useState, useRef } from 'react';
import { message } from 'antd';
import { useModelLoader } from '@/hooks/useModelLoader';
import { ExportPanel } from '@/components/Panels/ExportPanel';
import { ModelPickerModal } from '@/components/Panels/ModelPickerModal';
import {
  DEFAULT_MODEL_RESOLUTION,
  type ModelAsset,
  type ModelResolution,
} from '@/utils/polyhaven';

export function Toolbar() {
  const [showExport, setShowExport] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelResolution, setModelResolution] = useState<ModelResolution>(DEFAULT_MODEL_RESOLUTION);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileImport, loadPolyhavenModel } = useModelLoader();

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const scene = (window as any).__editorScene;
      if (scene) {
        await handleFileImport(files, scene);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePolyhavenModelSelect = async (asset: ModelAsset) => {
    const scene = (window as any).__editorScene;
    if (!scene) {
      message.error('场景尚未初始化');
      return;
    }

    setLoadingModelId(asset.id);
    try {
      await loadPolyhavenModel(asset, scene, modelResolution);
      setSelectedModelId(asset.id);
      message.success(`已导入模型：${asset.name}`);
      setModelModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error(error instanceof Error ? error.message : '模型加载失败');
    } finally {
      setLoadingModelId(null);
    }
  };

  const handleExport = () => {
    setShowExport(true);
  };

  const handleExportComplete = () => {
    setShowExport(false);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-bg"></div>
      <div className="toolbar-content">
        <div className="toolbar-left">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M14 10L20 13V19L14 22L8 19V13L14 10Z" fill="currentColor" opacity="0.3"/>
                <circle cx="14" cy="16" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1 className="logo-title">3D Editor</h1>
              <span className="logo-subtitle">数字孪生平台</span>
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleImport}
            className="toolbar-btn btn-import"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V10M8 2L5 5M8 2L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>导入模型</span>
          </button>

          <button
            onClick={() => setModelModalOpen(true)}
            disabled={!!loadingModelId}
            className="toolbar-btn btn-import"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13V6L8 3L13 6V13H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M3 9H13" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>模型库</span>
          </button>

          <button
            onClick={handleExport}
            className="toolbar-btn btn-export"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 10V2M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>导出</span>
          </button>
        </div>
      </div>

      <ModelPickerModal
        open={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        resolution={modelResolution}
        onResolutionChange={setModelResolution}
        selectedId={selectedModelId}
        loadingId={loadingModelId}
        onSelect={handlePolyhavenModelSelect}
      />

      {showExport && (
        <ExportPanel onClose={handleExportComplete} />
      )}
    </header>
  );
}
