import { useState, useRef } from 'react';
import { message, Modal } from 'antd';
import { useModelLoader } from '@/hooks/useModelLoader';
import { ExportPanel } from '@/components/Panels/ExportPanel';
import { ModelPickerModal } from '@/components/Panels/ModelPickerModal';
import { saveEditorProject } from '@/utils/editorProjectExporter';
import {
  hasEditorSceneContent,
  importEditorProjectJson,
  importEditorProjectZip,
} from '@/utils/editorProjectImporter';
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
  const [savingProject, setSavingProject] = useState(false);
  const [openingProject, setOpeningProject] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
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

  const handleSaveProject = async () => {
    setSavingProject(true);
    try {
      const result = await saveEditorProject();
      message.success(`项目已保存：${result.filename}`);
    } catch (error) {
      console.error(error);
      message.error(error instanceof Error ? error.message : '项目保存失败');
    } finally {
      setSavingProject(false);
    }
  };

  const handleOpenProjectClick = () => {
    projectInputRef.current?.click();
  };

  const runProjectImport = async (file: File) => {
    setOpeningProject(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip') {
        await importEditorProjectZip(file);
      } else if (ext === 'json') {
        await importEditorProjectJson(file);
      } else {
        throw new Error('仅支持 .zip 项目包或 .json 场景配置');
      }
      message.success(`项目已打开：${file.name}`);
    } catch (error) {
      console.error(error);
      message.error(error instanceof Error ? error.message : '项目打开失败');
    } finally {
      setOpeningProject(false);
    }
  };

  const handleProjectFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const openFile = async () => {
      await runProjectImport(file);
      if (projectInputRef.current) {
        projectInputRef.current.value = '';
      }
    };

    if (hasEditorSceneContent()) {
      Modal.confirm({
        title: '打开项目',
        content: '当前场景尚未保存，打开项目将覆盖现有内容。是否继续？',
        okText: '继续打开',
        cancelText: '取消',
        onOk: openFile,
        onCancel: () => {
          if (projectInputRef.current) {
            projectInputRef.current.value = '';
          }
        },
      });
    } else {
      await openFile();
    }
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
          <input
            ref={projectInputRef}
            type="file"
            accept=".zip,.json"
            onChange={handleProjectFileSelect}
            className="hidden"
          />

          <button
            onClick={handleOpenProjectClick}
            disabled={openingProject}
            className="toolbar-btn btn-import"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 7H11M5 10H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{openingProject ? '打开中…' : '打开项目'}</span>
          </button>

          <button
            onClick={handleSaveProject}
            disabled={savingProject}
            className="toolbar-btn btn-import"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13H13V5L10 2H3V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 2V5H10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M5 9H11M5 11H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{savingProject ? '保存中…' : '保存项目'}</span>
          </button>

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
