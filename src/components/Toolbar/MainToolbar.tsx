import { useState, useRef } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { useSceneExporter } from '@/hooks/useSceneExporter';
import { useModelLoader } from '@/hooks/useModelLoader';
import { ExportPanel } from '@/components/Panels/ExportPanel';
import * as THREE from 'three';

export function Toolbar() {
  const [showExport, setShowExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileImport } = useModelLoader();

  // 处理导入 - 直接打开系统文件选择器
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // 文件选择后的处理
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const scene = (window as any).__editorScene;
      if (scene) {
        await handleFileImport(files, scene);
      }
    }
    // 清空input,允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理导出 - 从EditorViewport获取引用 (通过全局变量)
  const handleExport = () => {
    setShowExport(true);
  };

  // 导出完成后回调
  const handleExportComplete = () => {
    setShowExport(false);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1 className="logo">数字孪生平台</h1>
      </div>

      <div className="toolbar-right">
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 导入按钮 */}
        <button 
          onClick={handleImport}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          导入模型
        </button>

        {/* 导出按钮 */}
        <button 
          onClick={handleExport}
          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
        >
          导出
        </button>
      </div>

      {/* 导出面板 */}
      {showExport && (
        <ExportPanel
          onClose={handleExportComplete}
        />
      )}
    </header>
  );
}
