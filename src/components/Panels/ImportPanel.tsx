import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useModelLoader } from '@/hooks/useModelLoader';

interface ImportPanelProps {
  onClose: () => void;
  scene: THREE.Scene | null;
}

export function ImportPanel({ onClose, scene }: ImportPanelProps) {
  const { handleFileImport } = useModelLoader();
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedFiles, setImportedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && scene) {
      await processFiles(files);
    }
    // 清空input,允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理文件导入
  const processFiles = async (files: FileList) => {
    if (!scene) return;
    
    setImporting(true);
    const fileNames = Array.from(files).map(f => f.name);
    setImportedFiles(fileNames);
    
    try {
      await handleFileImport(files, scene);
      // 导入成功后延迟关闭,让用户看到成功状态
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      // 错误处理由handleFileImport完成
    } finally {
      setImporting(false);
    }
  };

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && scene) {
      await processFiles(files);
    }
  }, [scene, handleFileImport]);

  // 点击触发文件选择
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">导入模型</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 文件选择区域 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="space-y-3">
              <div className="text-4xl">📁</div>
              <div className="text-sm text-gray-400">
                {dragging ? (
                  <span className="text-blue-400">释放文件以导入</span>
                ) : (
                  <>
                    <p>拖拽文件到这里</p>
                    <p className="text-xs text-gray-500 mt-1">或点击下方按钮选择文件</p>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                支持格式: .glb, .gltf
              </div>
            </div>
          </div>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 浏览按钮 */}
          <button
            onClick={handleBrowseClick}
            disabled={importing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? '导入中...' : '选择文件'}
          </button>

          {/* 已导入文件列表 */}
          {importedFiles.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2 text-sm">已导入的文件</h3>
              <ul className="space-y-1">
                {importedFiles.map((fileName, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="truncate">{fileName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 导入状态 */}
          {importing && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                <span>正在导入模型,请稍候...</span>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2 text-sm">💡 提示</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 支持同时导入多个模型文件</li>
              <li>• 模型会自动添加到场景中心位置</li>
              <li>• 导入后可在场景树中选中和编辑模型</li>
              <li>• 支持拖拽文件到3D视口中直接导入</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
