import { useState, useEffect, useRef, useCallback } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { useEditorStore } from '@/store/editorStore';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export function GlobalSettings() {
  const { backgroundColor, updateCamera } = useSceneStore();
  const { gridVisible, axesVisible, toggleGrid, toggleAxes } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'scene' | 'environment' | 'render' | 'postprocess'>('scene');
  const [bgColor, setBgColor] = useState('#000000');
  const [fogEnabled, setFogEnabled] = useState(false);
  const [fogColor, setFogColor] = useState('#ffffff');
  const [fogNear, setFogNear] = useState(1);
  const [fogFar, setFogFar] = useState(100);
  const [pixelRatio, setPixelRatio] = useState('2');
  const [toneMapping, setToneMapping] = useState('aces');
  const [exposure, setExposure] = useState(1.0);
  const [envMapIntensity, setEnvMapIntensity] = useState(1.0);
  const [correctLights, setCorrectLights] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 10, y: 10, z: 10 }); // 初始相机坐标(10, 10, 10)
  const [controlsTarget, setControlsTarget] = useState({ x: 0, y: 0, z: 0 });
  const [cameraFov, setCameraFov] = useState(45); // 默认45度
  const [cameraNear, setCameraNear] = useState(0.1);
  const [cameraFar, setCameraFar] = useState(5000);
  const [antialias, setAntialias] = useState(true); // 抗锯齿
  const [alpha, setAlpha] = useState(true); // 透明背景
  const [logarithmicDepthBuffer, setLogarithmicDepthBuffer] = useState(true); // 对数深度缓冲区
  const rendererRef = useRef<{antialias: boolean, alpha: boolean, logarithmicDepthBuffer: boolean} | null>(null); // 保存renderer配置
  
  // 后期处理参数
  const [postProcessEnabled, setPostProcessEnabled] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string>('none');
  const [bloomIntensity, setBloomIntensity] = useState(1.0);
  const [bloomRadius, setBloomRadius] = useState(0.4);
  const [bloomThreshold, setBloomThreshold] = useState(0.85);
  const [vignetteDarkness, setVignetteDarkness] = useState(0.5);
  const [filmGrain, setFilmGrain] = useState(0.1);
  const [pixelSize, setPixelSize] = useState(2.0);
  const [glitchIntensity, setGlitchIntensity] = useState(0.5);
  const [chromaticAmount, setChromaticAmount] = useState(0.002);
  const hdrFileRef = useRef<HTMLInputElement>(null);
  const hdrBgFileRef = useRef<HTMLInputElement>(null);
  const hdrEnvFileRef = useRef<HTMLInputElement>(null);
  const isProgrammaticChange = useRef(false); // 标记是否为程序化更改(代码修改相机)
  const isUserInputChange = useRef(false); // 标记是否为用户手动输入

  // 同步背景颜色到场景
  useEffect(() => {
    const scene = (window as any).__editorScene;
    if (scene) {
      scene.background = new THREE.Color(bgColor);
    }
  }, [bgColor]);

  // 初始化相机位置并设置监听器 - 使用重试机制确保获取到相机和控制器
  useEffect(() => {
    let animationFrameId: number;
    let retryCount = 0;
    const maxRetries = 50; // 最多重试50次(5秒)
    
    const setupCameraListener = () => {
      const camera = (window as any).__editorCamera;
      const controls = (window as any).__editorControls;
      
      // 如果相机和控制器都准备好了,设置监听器
      if (camera && controls) {
        // 更新初始相机位置
        setCameraPosition({
          x: parseFloat(camera.position.x.toFixed(2)),
          y: parseFloat(camera.position.y.toFixed(2)),
          z: parseFloat(camera.position.z.toFixed(2))
        });
        
        // 更新初始控制点位置
        setControlsTarget({
          x: parseFloat(controls.target.x.toFixed(2)),
          y: parseFloat(controls.target.y.toFixed(2)),
          z: parseFloat(controls.target.z.toFixed(2))
        });

        // 创建监听器 - 当相机移动时更新UI
        const updateCameraUI = () => {
          // 如果是程序化更改,不更新UI(避免无限循环)
          if (isProgrammaticChange.current) return;
          
          setCameraPosition({
            x: parseFloat(camera.position.x.toFixed(2)),
            y: parseFloat(camera.position.y.toFixed(2)),
            z: parseFloat(camera.position.z.toFixed(2))
          });
          setControlsTarget({
            x: parseFloat(controls.target.x.toFixed(2)),
            y: parseFloat(controls.target.y.toFixed(2)),
            z: parseFloat(controls.target.z.toFixed(2))
          });
        };

        // 监听change事件(相机移动时触发)
        controls.addEventListener('change', updateCameraUI);
        


        return () => {
          controls.removeEventListener('change', updateCameraUI);
        };
      } else if (retryCount < maxRetries) {
        // 还没准备好,继续重试
        retryCount++;
        animationFrameId = requestAnimationFrame(setupCameraListener);
      } else {

      }
    };
    
    // 开始重试机制
    animationFrameId = requestAnimationFrame(setupCameraListener);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 同步雾效到场景
  useEffect(() => {
    const scene = (window as any).__editorScene;
    if (scene) {
      if (fogEnabled) {
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
      } else {
        scene.fog = null;
      }
    }
  }, [fogEnabled, fogColor, fogNear, fogFar]);

  // 同步相机位置到Three.js相机 - 只在用户手动输入时同步,避免监听器更新导致相机跳动
  useEffect(() => {
    // 只有用户手动修改输入框时才同步到相机,监听器自动更新不同步
    if (!isUserInputChange.current) {
      return;
    }
    
    const camera = (window as any).__editorCamera;
    if (camera) {
      // 标记为程序化更改,避免触发监听器导致无限循环
      isProgrammaticChange.current = true;
      
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      
      const controls = (window as any).__editorControls;
      if (controls) controls.update();
      
      // 下一帧重置标志位,允许用户手动操作相机时更新UI
      requestAnimationFrame(() => {
        isProgrammaticChange.current = false;
        isUserInputChange.current = false; // 重置用户输入标志
      });
    }
  }, [cameraPosition]);

  // 同步相机其他参数(FOV, Near, Far)
  useEffect(() => {
    const camera = (window as any).__editorCamera;
    if (camera) {
      camera.fov = cameraFov;
      camera.near = cameraNear;
      camera.far = cameraFar;
      camera.updateProjectionMatrix(); // 必须调用此方法使参数生效
    }
  }, [cameraFov, cameraNear, cameraFar]);

  // 同步渲染参数
  useEffect(() => {
    const renderer = (window as any).__editorRenderer;
    if (renderer) {
      // 色调映射
      const toneMappingMap: Record<string, number> = {
        none: THREE.NoToneMapping,
        linear: THREE.LinearToneMapping,
        reinhard: THREE.ReinhardToneMapping,
        cineon: THREE.CineonToneMapping,
        aces: THREE.ACESFilmicToneMapping,
        custom: THREE.CustomToneMapping,
      };
      renderer.toneMapping = toneMappingMap[toneMapping] ?? THREE.ACESFilmicToneMapping;
      
      // 曝光度
      renderer.toneMappingExposure = exposure;
      
      // 环境贴图强度
      renderer.environmentIntensity = envMapIntensity;
    }
  }, [toneMapping, exposure, envMapIntensity]);

  // 同步CorrectLights
  useEffect(() => {
    const renderer = (window as any).__editorRenderer;
    if (renderer) {
      renderer.useLegacyLights = !correctLights;
    }
  }, [correctLights]);

  // 同步渲染参数(antialias, alpha, logarithmicDepthBuffer需要重建renderer)
  const handleRendererParamChange = useCallback(async (param: 'antialias' | 'alpha' | 'logarithmicDepthBuffer', value: boolean) => {
    // 更新state
    if (param === 'antialias') setAntialias(value);
    if (param === 'alpha') setAlpha(value);
    if (param === 'logarithmicDepthBuffer') setLogarithmicDepthBuffer(value);
    
    // 保存新配置到ref
    rendererRef.current = {
      antialias: param === 'antialias' ? value : (rendererRef.current?.antialias ?? true),
      alpha: param === 'alpha' ? value : (rendererRef.current?.alpha ?? true),
      logarithmicDepthBuffer: param === 'logarithmicDepthBuffer' ? value : (rendererRef.current?.logarithmicDepthBuffer ?? true),
    };
    
    // 调用全局函数重建renderer(会有短暂闪烁)
    const recreateRenderer = (window as any).__recreateRenderer;
    if (typeof recreateRenderer === 'function') {

      recreateRenderer(rendererRef.current);
    } else {

    }
  }, []);

  // 加载HDR文件作为背景或环境
  const handleLoadHDR = useCallback(async (file: File, asBackground: boolean) => {
    const scene = (window as any).__editorScene;
    const renderer = (window as any).__editorRenderer;
    
    if (!scene || !renderer) return;

    const loader = new RGBELoader();
    const url = URL.createObjectURL(file);

    loader.load(url, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      if (asBackground) {
        // 作为背景
        scene.background = texture;
      } else {
        // 作为环境
        scene.environment = texture;
      }

      URL.revokeObjectURL(url);
    });
  }, []);

  // 同步后期处理参数到全局(供EditorViewport使用)
  useEffect(() => {
    (window as any).__postProcessConfig = {
      enabled: postProcessEnabled,
      effect: selectedEffect,
      bloom: {
        intensity: bloomIntensity,
        radius: bloomRadius,
        threshold: bloomThreshold
      },
      vignette: {
        darkness: vignetteDarkness
      },
      film: {
        grain: filmGrain
      },
      pixelate: {
        size: pixelSize
      },
      glitch: {
        intensity: glitchIntensity
      },
      chromatic: {
        amount: chromaticAmount
      }
    };
  }, [postProcessEnabled, selectedEffect, bloomIntensity, bloomRadius, bloomThreshold, vignetteDarkness, filmGrain, pixelSize, glitchIntensity, chromaticAmount]);

  // 处理HDR文件选择

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tab栏 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('scene')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'scene'
              ? 'text-white border-b-2 border-blue-500 bg-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          场景
        </button>
        <button
          onClick={() => setActiveTab('environment')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'environment'
              ? 'text-white border-b-2 border-blue-500 bg-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          环境
        </button>
        <button
          onClick={() => setActiveTab('render')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'render'
              ? 'text-white border-b-2 border-blue-500 bg-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          渲染
        </button>
        <button
          onClick={() => setActiveTab('postprocess')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'postprocess'
              ? 'text-white border-b-2 border-blue-500 bg-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          后期
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 场景设置 */}
        {activeTab === 'scene' && (
          <>
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">背景颜色</h4>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-gray-600"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">相机位置</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-red-400 block mb-1">X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cameraPosition.x}
                    onChange={(e) => {
                      isUserInputChange.current = true; // 标记为用户手动输入
                      setCameraPosition(prev => ({...prev, x: parseFloat(e.target.value) || 0}))
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-green-400 block mb-1">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cameraPosition.y}
                    onChange={(e) => {
                      isUserInputChange.current = true; // 标记为用户手动输入
                      setCameraPosition(prev => ({...prev, y: parseFloat(e.target.value) || 0}))
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-400 block mb-1">Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cameraPosition.z}
                    onChange={(e) => {
                      isUserInputChange.current = true; // 标记为用户手动输入
                      setCameraPosition(prev => ({...prev, z: parseFloat(e.target.value) || 0}))
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">控制点位置 (OrbitControls.target)</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-red-400 block mb-1">X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlsTarget.x}
                    onChange={(e) => {
                      const x = parseFloat(e.target.value) || 0;
                      setControlsTarget(prev => ({...prev, x}));
                      const controls = (window as any).__editorControls;
                      if (controls) controls.target.x = x;
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-green-400 block mb-1">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlsTarget.y}
                    onChange={(e) => {
                      const y = parseFloat(e.target.value) || 0;
                      setControlsTarget(prev => ({...prev, y}));
                      const controls = (window as any).__editorControls;
                      if (controls) controls.target.y = y;
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-400 block mb-1">Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlsTarget.z}
                    onChange={(e) => {
                      const z = parseFloat(e.target.value) || 0;
                      setControlsTarget(prev => ({...prev, z}));
                      const controls = (window as any).__editorControls;
                      if (controls) controls.target.z = z;
                    }}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">相机参数</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    FOV (视野): {cameraFov}°
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    step="1"
                    value={cameraFov}
                    onChange={(e) => setCameraFov(parseFloat(e.target.value) || 75)}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Near (近裁剪): {cameraNear}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    max="10"
                    step="0.01"
                    value={cameraNear}
                    onChange={(e) => setCameraNear(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Far (远裁剪): {cameraFar}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="10"
                    value={cameraFar}
                    onChange={(e) => setCameraFar(parseFloat(e.target.value) || 1000)}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 网格和坐标轴 */}
            <div className="space-y-2 pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">显示网格</span>
                <button
                  onClick={toggleGrid}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    gridVisible ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      gridVisible ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">显示坐标轴</span>
                <button
                  onClick={toggleAxes}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    axesVisible ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      axesVisible ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* 环境设置 */}
        {activeTab === 'environment' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">启用雾效</span>
              <button
                onClick={() => setFogEnabled(!fogEnabled)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  fogEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                    fogEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {fogEnabled && (
              <>
                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-2">雾颜色</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fogColor}
                      onChange={(e) => setFogColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-600"
                    />
                    <input
                      type="text"
                      value={fogColor}
                      onChange={(e) => setFogColor(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded font-mono"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-1">
                    近处距离: {fogNear}
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={fogNear}
                    onChange={(e) => setFogNear(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-300 mb-1">
                    远处距离: {fogFar}
                  </h4>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="1"
                    value={fogFar}
                    onChange={(e) => setFogFar(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">HDR环境贴图</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => hdrBgFileRef.current?.click()}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  📁 作为背景加载HDR
                </button>
                <input 
                  ref={hdrBgFileRef}
                  type="file"
                  accept=".hdr,.exr"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLoadHDR(file, true);
                  }}
                />
                
                <button 
                  onClick={() => hdrEnvFileRef.current?.click()}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs"
                >
                  🌍 作为环境加载HDR
                </button>
                <input 
                  ref={hdrEnvFileRef}
                  type="file"
                  accept=".hdr,.exr"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLoadHDR(file, false);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* 渲染设置 */}
        {activeTab === 'render' && (
          <>
            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">Renderer 基础设置</h4>
              <div className="space-y-2">
                {/* 抗锯齿 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">抗锯齿 (Antialias)</span>
                  <button 
                    onClick={() => handleRendererParamChange('antialias', !antialias)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      antialias ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    title="开启后边缘更平滑,但会略微影响性能"
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      antialias ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {/* 透明背景 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">透明背景 (Alpha)</span>
                  <button 
                    onClick={() => handleRendererParamChange('alpha', !alpha)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      alpha ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    title="开启后背景可以透明,关闭后为纯色背景"
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      alpha ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {/* 对数深度缓冲区 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">对数深度缓冲区 (LogarithmicDepthBuffer)</span>
                  <button 
                    onClick={() => handleRendererParamChange('logarithmicDepthBuffer', !logarithmicDepthBuffer)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      logarithmicDepthBuffer ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    title="开启后解决大场景深度精度问题(深度闪烁)"
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      logarithmicDepthBuffer ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">色调映射 (Tone Mapping)</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">类型</label>
                  <select 
                    value={toneMapping}
                    onChange={(e) => setToneMapping(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  >
                    <option value="none">NoToneMapping (无)</option>
                    <option value="linear">LinearToneMapping (线性)</option>
                    <option value="reinhard">ReinhardToneMapping</option>
                    <option value="cineon">CineonToneMapping</option>
                    <option value="aces">ACES Filmic (推荐)</option>
                    <option value="custom">CustomToneMapping (自定义)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    曝光 (Exposure): {exposure.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.01"
                    value={exposure}
                    onChange={(e) => setExposure(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">阴影设置 (Shadow Map)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">启用阴影</span>
                  <button className="w-10 h-5 rounded-full bg-green-500 transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full transform translate-x-5 transition-transform" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">阴影类型</label>
                  <select 
                    defaultValue="pcf"
                    className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
                  >
                    <option value="basic">BasicShadowMap (基础)</option>
                    <option value="pcf">PCFShadowMap (PCF)</option>
                    <option value="pcfSoft">PCFSoftShadowMap (PCF软)</option>
                    <option value="vsm">VSMShadowMap (VSM)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">输出颜色空间</h4>
              <select 
                defaultValue="srgb"
                className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
              >
                <option value="srgb">SRGBColorSpace (sRGB)</option>
                <option value="linear">LinearSRGBColorSpace (线性)</option>
              </select>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">物理灯光</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">启用物理CorrectLights</span>
                <button 
                  onClick={() => setCorrectLights(!correctLights)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    correctLights ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      correctLights ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">环境贴图强度</h4>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  强度: {envMapIntensity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={envMapIntensity}
                  onChange={(e) => setEnvMapIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-300 mb-2">像素比</h4>
              <select 
                value={pixelRatio}
                onChange={(e) => setPixelRatio(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-gray-700 text-white border border-gray-600 rounded"
              >
                <option value="1">1x (性能)</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x (质量)</option>
                <option value="3">3x (最高)</option>
              </select>
            </div>
          </>
        )}

        {/* 后期处理设置 */}
        {activeTab === 'postprocess' && (
          <>
            {/* 后期处理总开关 */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">启用后期处理</span>
                <button
                  onClick={() => setPostProcessEnabled(!postProcessEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    postProcessEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      postProcessEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {postProcessEnabled && (
              <>
                {/* 后期效果选择 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">选择效果</h3>
                  <select 
                    value={selectedEffect}
                    onChange={(e) => setSelectedEffect(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-700 text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="none">无</option>
                    <option value="bloom">泛光/辉光 (Bloom)</option>
                    <option value="fxaa">快速抗锯齿 (FXAA)</option>
                    <option value="sobel">边缘检测 (Sobel)</option>
                    <option value="chromatic">色差效果 (Chromatic Aberration)</option>
                    <option value="pixelate">像素化 (Pixelation)</option>
                    <option value="vignette">暗角 (Vignette)</option>
                  </select>
                </div>

                {/* 泛光参数 */}
                {selectedEffect === 'bloom' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">泛光参数</h4>
                    
                    <div className="mb-3">
                      <label className="text-xs text-gray-400 block mb-1">
                        强度: {bloomIntensity.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.05"
                        value={bloomIntensity}
                        onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-xs text-gray-400 block mb-1">
                        半径: {bloomRadius.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bloomRadius}
                        onChange={(e) => setBloomRadius(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        阈值: {bloomThreshold.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bloomThreshold}
                        onChange={(e) => setBloomThreshold(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 暗角参数 */}
                {selectedEffect === 'vignette' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">暗角参数</h4>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        暗度: {vignetteDarkness.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={vignetteDarkness}
                        onChange={(e) => setVignetteDarkness(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* FXAA参数 */}
                {selectedEffect === 'fxaa' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">FXAA参数</h4>
                    <div className="text-xs text-gray-400">
                      <p>• 快速近似抗锯齿</p>
                      <p>• 性能优异,适合实时渲染</p>
                    </div>
                  </div>
                )}

                {/* Sobel参数 */}
                {selectedEffect === 'sobel' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">Sobel参数</h4>
                    <div className="text-xs text-gray-400">
                      <p>• 边缘检测效果</p>
                      <p>• 可用于艺术风格渲染</p>
                    </div>
                  </div>
                )}

                {/* 色差参数 */}
                {selectedEffect === 'chromatic' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">色差参数</h4>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        色差强度: {chromaticAmount.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.01"
                        step="0.001"
                        value={chromaticAmount}
                        onChange={(e) => setChromaticAmount(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 像素化参数 */}
                {selectedEffect === 'pixelate' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-3">像素化参数</h4>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        像素大小: {pixelSize.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={pixelSize}
                        onChange={(e) => setPixelSize(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
