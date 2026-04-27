import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSceneExporter } from '@/hooks/useSceneExporter';

interface ExportPanelProps {
  onClose: () => void;
}

// 全局引用 - 由EditorViewport设置
declare global {
  interface Window {
    __editorScene?: THREE.Scene;
    __editorRenderer?: THREE.WebGLRenderer;
  }
}

export function ExportPanel({ onClose }: ExportPanelProps) {
  const { exportGLB, exportScreenshot } = useSceneExporter();
  const [exporting, setExporting] = useState(false);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  // 从全局获取引用
  useEffect(() => {
    setScene(window.__editorScene || null);
    setRenderer(window.__editorRenderer || null);
  }, []);

  // 导出配置文件
  const handleExportConfig = () => {
    try {
      const config = generateSceneConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scene-config-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // 错误处理静默失败
    }
  };

  // 生成场景配置
  const generateSceneConfig = () => {
    const scene = window.__editorScene;
    const renderer = window.__editorRenderer;
    const camera = (window as any).__editorCamera;
    const controls = (window as any).__editorControls;
    
    if (!scene) return {};

    // 收集灯光信息
    const lights: any[] = [];
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Light) {
        const lightData: any = {
          type: child.type,
          name: child.name || child.type,
          color: `#${child.color.getHexString()}`,
          intensity: child.intensity,
          position: {
            x: child.position.x,
            y: child.position.y,
            z: child.position.z
          }
        };

        // DirectionalLight特有属性
        if (child instanceof THREE.DirectionalLight) {
          lightData.castShadow = child.castShadow;
          lightData.shadow = {
            mapSize: {
              width: child.shadow.mapSize.width,
              height: child.shadow.mapSize.height
            },
            camera: {
              left: child.shadow.camera.left,
              right: child.shadow.camera.right,
              top: child.shadow.camera.top,
              bottom: child.shadow.camera.bottom,
              near: child.shadow.camera.near,
              far: child.shadow.camera.far
            }
          };
        }

        // PointLight和SpotLight特有属性
        if (child instanceof THREE.PointLight || child instanceof THREE.SpotLight) {
          lightData.distance = child.distance;
          lightData.decay = child.decay;
        }

        // SpotLight特有属性
        if (child instanceof THREE.SpotLight) {
          lightData.angle = child.angle;
          lightData.penumbra = child.penumbra;
          lightData.target = {
            x: child.target.position.x,
            y: child.target.position.y,
            z: child.target.position.z
          };
        }

        lights.push(lightData);
      }
    });

    // 相机配置
    const cameraConfig = camera ? {
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
      fov: camera.fov,
      near: camera.near,
      far: camera.far,
      aspect: camera.aspect
    } : null;

    // 控制器配置
    const controlsConfig = controls ? {
      target: {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z
      },
      enableDamping: controls.enableDamping,
      dampingFactor: controls.dampingFactor,
      enableZoom: controls.enableZoom,
      enableRotate: controls.enableRotate,
      enablePan: controls.enablePan,
      minDistance: controls.minDistance,
      maxDistance: controls.maxDistance,
      minPolarAngle: controls.minPolarAngle,
      maxPolarAngle: controls.maxPolarAngle
    } : null;

    // 渲染器配置
    const rendererConfig = renderer ? {
      antialias: (renderer as any).antialias,
      alpha: (renderer as any).alpha,
      logarithmicDepthBuffer: (renderer as any).logarithmicDepthBuffer,
      pixelRatio: renderer.getPixelRatio(),
      toneMapping: renderer.toneMapping,
      toneMappingExposure: renderer.toneMappingExposure,
      outputColorSpace: renderer.outputColorSpace
    } : null;

    // 场景配置
    const sceneConfig = {
      background: scene.background ? {
        type: scene.background instanceof THREE.Color ? 'color' : 'texture',
        value: scene.background instanceof THREE.Color ? `#${scene.background.getHexString()}` : null
      } : null,
      environment: scene.environment ? 'enabled' : 'disabled'
    };

    // 后期处理配置(从全局读取)
    const postProcessConfig = (window as any).__postProcessConfig || null;

    return {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      scene: sceneConfig,
      camera: cameraConfig,
      controls: controlsConfig,
      renderer: rendererConfig,
      lights,
      postProcess: postProcessConfig,
      metadata: {
        totalObjects: scene.children.length,
        totalLights: lights.length
      }
    };
  };

  const handleExportGLB = async () => {
    if (!scene) return;
    setExporting(true);
    try {
      await exportGLB(scene);
    } catch (error) {

    } finally {
      setExporting(false);
    }
  };

  const handleScreenshot = () => {
    if (!renderer) return;
    exportScreenshot(renderer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">导出场景</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* GLB导出 */}
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

          {/* 截图 */}
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

          {/* 配置文件导出 */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">⚙️ 配置文件</h3>
            <p className="text-xs text-gray-400 mb-3">
              导出场景配置JSON文件,包含灯光、相机、渲染器等所有参数。可用于场景重建和分享。
            </p>
            <button
              onClick={handleExportConfig}
              disabled={!scene}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出配置 (JSON)
            </button>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            💡 提示: 导出的文件将自动下载到默认下载文件夹
          </p>
        </div>
      </div>
    </div>
  );
}
