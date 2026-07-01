import { useState, useEffect } from 'react';
import { message } from 'antd';
import * as THREE from 'three';
import { useSceneExporter } from '@/hooks/useSceneExporter';
import { downloadSceneConfig } from '@/utils/sceneConfigExporter';
import { exportProjectPackage } from '@/utils/projectPackageExporter';

interface ExportPanelProps {
  onClose: () => void;
}

declare global {
  interface Window {
    __editorScene?: THREE.Scene;
    __editorRenderer?: THREE.WebGLRenderer;
  }
}

export function ExportPanel({ onClose }: ExportPanelProps) {
  const { exportGLB, exportScreenshot } = useSceneExporter();
  const [exporting, setExporting] = useState(false);
  const [configExporting, setConfigExporting] = useState(false);
  const [packageExporting, setPackageExporting] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    setScene(window.__editorScene || null);
    setRenderer(window.__editorRenderer || null);
  }, []);

  const handleExportConfig = () => {
    setConfigExporting(true);
    try {
      downloadSceneConfig();
      message.success('场景配置已导出');
    } catch (error) {
      console.error('配置导出失败:', error);
      message.error(error instanceof Error ? error.message : '配置导出失败');
    } finally {
      setConfigExporting(false);
    }
  };

  const handleExportGLB = async () => {
    if (!scene) return;
    setExporting(true);
    try {
      await exportGLB(scene);
      message.success('GLB 已导出');
    } catch (error) {
      console.error('GLB 导出失败:', error);
      message.error('GLB 导出失败，请查看控制台');
    } finally {
      setExporting(false);
    }
  };

  const handleScreenshot = () => {
    if (!renderer) return;
    try {
      exportScreenshot(renderer);
      message.success('截图已导出');
    } catch (error) {
      console.error('截图失败:', error);
      message.error('截图导出失败');
    }
  };

  const handleExportProjectPackage = async () => {
    if (!scene) return;
    setPackageExporting(true);
    try {
      const result = await exportProjectPackage();
      const detail = [
        result.hasModel ? '含模型' : '无模型',
        result.hasHdr ? '含 HDR' : '无 HDR',
        result.hasTextures ? `含 ${result.textureCount} 张贴图` : '无外部贴图',
        result.polyhavenModelCount > 0 ? `Poly Haven 模型 ${result.polyhavenModelCount} 个` : null,
        result.hasCameraTour ? '含漫游' : null,
      ].filter(Boolean).join(' · ');
      message.success(`项目包已导出（${detail}）`);
    } catch (error) {
      console.error('项目包导出失败:', error);
      message.error(error instanceof Error ? error.message : '项目包导出失败');
    } finally {
      setPackageExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">导出场景</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-700 rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-white font-medium mb-2">🚀 导出项目包 (ZIP)</h3>
            <p className="text-xs text-gray-400 mb-3">
              导出完整 HTML + CSS + JS 项目，包含场景 GLB、Poly Haven 贴图/模型资源、HDR（如有）。
              解压后用静态服务器打开即可预览，便于二次开发。
            </p>
            <button
              onClick={handleExportProjectPackage}
              disabled={packageExporting || !scene}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {packageExporting ? '打包中...' : '导出项目包 (ZIP)'}
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">📦 GLB格式 (推荐)</h3>
            <p className="text-xs text-gray-400 mb-3">
              单个二进制文件,包含所有模型和材质。适合在其他3D软件中使用。
            </p>
            <button
              onClick={handleExportGLB}
              disabled={exporting || !scene}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? '导出中...' : '导出 GLB'}
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">📸 截图</h3>
            <p className="text-xs text-gray-400 mb-3">
              导出当前视角的PNG图片。
            </p>
            <button
              onClick={handleScreenshot}
              disabled={!renderer}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出截图 (PNG)
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">⚙️ 配置文件</h3>
            <p className="text-xs text-gray-400 mb-3">
              导出场景配置 JSON，包含相机、灯光、雾效、HDR、后期、渲染器等参数。需配合 GLB 还原完整场景。
            </p>
            <button
              onClick={handleExportConfig}
              disabled={configExporting || !scene}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {configExporting ? '导出中...' : '导出配置 (JSON)'}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            💡 提示: 导出的文件将自动下载到默认下载文件夹
          </p>
        </div>
      </div>
    </div>
  );
}
