import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader';
import { useSceneStore } from '@/store/sceneStore';
import { useEditorStore } from '@/store/editorStore';
import { useModelLoader } from '@/hooks/useModelLoader';
import { useLightStore } from '@/store/lightStore';
import { useHistoryStore } from '@/store/historyStore';

export function EditorViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const gizmoHelperRef = useRef<THREE.Object3D | null>(null);
  const animationFrameRef = useRef<number>(0);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const initializedRef = useRef(false); // 防止React严格模式下重复初始化
  const composerRef = useRef<EffectComposer | null>(null); // 后期处理Composer
  const currentPassRef = useRef<any>(null); // 当前后期处理Pass
  const currentEffectRef = useRef<string | null>(null); // 当前效果名称
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const { camera, backgroundColor, objects, selectedIds, selectObject, deselectAll, updateObject, registerThreeObject, addObject } = useSceneStore();
  const { gridVisible, axesVisible, currentTool } = useEditorStore();
  const { handleFileImport } = useModelLoader();
  const { lights } = useLightStore();
  const { selectedLightId, selectLight } = useLightStore();
  const lightsRef = useRef<Map<string, THREE.Light>>(new Map());
  const lightHelpersRef = useRef<Map<string, any>>(new Map());

  // 像素化Shader
  const pixelationShader = {
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      pixelSize: { value: 2.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float pixelSize;
      varying vec2 vUv;
      void main() {
        vec2 dxy = pixelSize / resolution;
        vec2 coord = dxy * floor(vUv / dxy);
        gl_FragColor = texture2D(tDiffuse, coord);
      }
    `,
  };

  // 色差Shader
  const chromaticAberrationShader = {
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.002 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float amount;
      varying vec2 vUv;
      void main() {
        vec2 offset = amount * (vUv - vec2(0.5));
        float r = texture2D(tDiffuse, vUv + offset).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - offset).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
  };

  // 更新Pass参数
  const updatePassParams = (pass: any, config: any) => {
    if (!pass) return;
    
    // Bloom参数
    if (pass.threshold !== undefined && config.bloom) {
      pass.threshold = config.bloom.threshold;
      pass.strength = config.bloom.intensity;
      pass.radius = config.bloom.radius;
    }
    
    // FXAA参数
    if (pass.uniforms?.resolution !== undefined && config.fxaa) {
      pass.uniforms.resolution.value.x = 1 / (config.fxaa.resolution?.x || 1920);
      pass.uniforms.resolution.value.y = 1 / (config.fxaa.resolution?.y || 1080);
    }
    
    // Sobel参数  
    if (pass.uniforms?.resolution !== undefined && config.sobel) {
      pass.uniforms.resolution.value.x = config.sobel.resolution?.x || 1920;
      pass.uniforms.resolution.value.y = config.sobel.resolution?.y || 1080;
    }
    
    // 色差参数
    if (pass.uniforms?.amount !== undefined && config.chromatic) {
      pass.uniforms.amount.value = config.chromatic.amount;
    }
    
    // Pixelate参数
    if (pass.uniforms?.pixelSize !== undefined && config.pixelate) {
      pass.uniforms.pixelSize.value = config.pixelate.size;
    }
    
    // Vignette参数
    if (pass.uniforms?.darkness !== undefined && config.vignette) {
      pass.uniforms.darkness.value = config.vignette.darkness;
    }
  };

  // 动态重建Renderer - 用于修改antialias/alpha/logarithmicDepthBuffer参数
  const recreateRenderer = useCallback((params: {antialias: boolean, alpha: boolean, logarithmicDepthBuffer: boolean}) => {
    if (!containerRef.current || !sceneRef.current || !cameraRef.current) return;
    

    
    const oldRenderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const transformControls = transformControlsRef.current;
    
    // 保存当前场景中的所有自定义对象(排除网格、坐标轴、灯光、gizmo)
    const objectsToRestore: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.name !== 'grid' && 
          child.name !== 'axes' && 
          !(child instanceof THREE.Light) &&
          child !== transformControls?.getHelper()) {
        // 检查是否是gizmoHelper的子对象
        let isGizmo = false;
        const gizmoHelper = transformControls?.getHelper();
        if (gizmoHelper) {
          let current: THREE.Object3D | null = child;
          while (current) {
            if (current === gizmoHelper) {
              isGizmo = true;
              break;
            }
            current = current.parent;
          }
        }
        if (!isGizmo && (child instanceof THREE.Mesh || child instanceof THREE.Group)) {
          objectsToRestore.push(child);
        }
      }
    });
    
    // 移除旧renderer的DOM元素
    if (oldRenderer && containerRef.current.contains(oldRenderer.domElement)) {
      containerRef.current.removeChild(oldRenderer.domElement);
      oldRenderer.dispose();
    }
    
    // 创建新renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: params.antialias,
      alpha: params.alpha,
      logarithmicDepthBuffer: params.logarithmicDepthBuffer,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 更新全局引用
    (window as any).__editorRenderer = renderer;
    
    // 重新附加OrbitControls到新的renderer DOM
    if (controls) {
      controls.dispose();
      const newControls = new OrbitControls(camera, renderer.domElement);
      newControls.enableDamping = true;
      newControls.dampingFactor = 0.05;
      newControls.update();
      controlsRef.current = newControls;
      (window as any).__editorControls = newControls;
      
      // 重新添加监听器 - 实时更新相机坐标显示(需要重新实现拖拽检测逻辑)
      let isOrbitDragging = false;
      let mouseDownPos = { x: 0, y: 0 };
      
      renderer.domElement.addEventListener('mousedown', (e) => {
        mouseDownPos = { x: e.clientX, y: e.clientY };
      });
      
      newControls.addEventListener('start', () => {
        isOrbitDragging = false;
      });
      
      renderer.domElement.addEventListener('mousemove', (e) => {
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 5) {
          isOrbitDragging = true;
        }
      });
      
      renderer.domElement.addEventListener('mouseup', () => {
        setTimeout(() => {
          isOrbitDragging = false;
        }, 100);
      });
      
      newControls.addEventListener('change', () => {
        (window as any).__editorCameraPosition = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        };
        (window as any).__editorControlsTarget = {
          x: newControls.target.x,
          y: newControls.target.y,
          z: newControls.target.z
        };
      });
      
      // 将isOrbitDragging暴露给handleClick使用(通过闭包)
      (window as any).__isOrbitDragging = () => isOrbitDragging;
    }
    
    // 重新附加TransformControls(需要先detach再attach)
    if (transformControls) {
      transformControls.detach();
      // TransformControls会自动附加到新的renderer
      (window as any).__editorTransformControls = transformControls;
    }
    
    // 重新加载HDR环境贴图
    const hdrLoader = new HDRLoader();
    hdrLoader.load(
      '/hdr/kloofendal_48d_partly_cloudy_puresky_2k.hdr',
      (texture: THREE.DataTexture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      },
      undefined,
      (error: unknown) => {

      }
    );
    
    // 注意: 场景中的对象会自动保留,因为它们是scene的子对象,不依赖renderer
    
    // 重新绑定所有事件监听器(点击、拖拽导入等)
    const clickHandler = (window as any).__editorClickHandler;
    const dragOverHandler = (window as any).__editorDragOverHandler;
    const dropHandler = (window as any).__editorDropHandler;
    
    if (clickHandler) {
      renderer.domElement.addEventListener('click', clickHandler);
    }
    if (dragOverHandler) {
      renderer.domElement.addEventListener('dragover', dragOverHandler);
    }
    if (dropHandler) {
      renderer.domElement.addEventListener('drop', dropHandler);
    }
    
    // 重要: 需要重新触发useEffect以重新绑定所有事件(点击、拖拽等)
    // 通过更新renderer的引用,让useEffect检测到变化并重新执行
    

  }, []);
  
  // 将recreateRenderer暴露到全局,供GlobalSettings使用
  useEffect(() => {
    (window as any).__recreateRenderer = recreateRenderer;
  }, [recreateRenderer]);

  // 初始化场景
  const initScene = useCallback(() => {
    if (!containerRef.current) return;
    
    // 防止React严格模式下重复初始化
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    // 清理旧的全局引用(防止使用旧场景对象)
    delete (window as any).__editorScene;
    delete (window as any).__sceneInitialized;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');
    sceneRef.current = scene;

    // 创建相机
    const cameraObj = new THREE.PerspectiveCamera(
      camera.fov,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      camera.near,
      camera.far
    );
    cameraObj.position.set(16.28, 7.4, 15.79); // 初始相机坐标
    cameraRef.current = cameraObj;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿
      alpha: true, // 透明背景
      logarithmicDepthBuffer: true, // 对数深度缓冲区,解决大场景深度精度问题
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Three.js 0.184+ 使用PCFShadowMap
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加轨道控制器
    const controls = new OrbitControls(cameraObj, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3.33, 0); // 初始控制点位置
    controls.update();
    controlsRef.current = controls;
    
    // 监听OrbitControls拖拽 - 区分点击和拖拽操作
    let isOrbitDragging = false;
    let mouseDownPos = { x: 0, y: 0 };
    
    // 使用mousedown记录鼠标按下位置
    renderer.domElement.addEventListener('mousedown', (e) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
    });
    
    controls.addEventListener('start', () => {
      isOrbitDragging = false; // 先不标记,等判断是否真的移动了
    });
    
    controls.addEventListener('end', () => {
      // end事件触发时,检查是否真的移动了(不是纯点击)
      // 这里不立即重置,让click事件能判断
    });
    
    // 监听mousemove,如果移动了就标记为拖拽
    renderer.domElement.addEventListener('mousemove', (e) => {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果移动距离超过5像素,认为是拖拽而不是点击
      if (distance > 5) {
        isOrbitDragging = true;
      }
    });
    
    // 在mouseup时延迟重置拖拽标志
    renderer.domElement.addEventListener('mouseup', () => {
      setTimeout(() => {
        isOrbitDragging = false;
      }, 100);
    });
    
    // 监听相机变化 - 实时更新GlobalSettings中的坐标显示
    controls.addEventListener('change', () => {
      // 更新全局相机位置和控制点信息,供GlobalSettings读取
      (window as any).__editorCameraPosition = {
        x: cameraObj.position.x,
        y: cameraObj.position.y,
        z: cameraObj.position.z
      };
      (window as any).__editorControlsTarget = {
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z
      };
    });

    // 设置全局引用 - 供PropertyPanel等组件使用
    (window as any).__editorScene = scene;
    (window as any).__editorRenderer = renderer;
    (window as any).__editorCamera = cameraObj;
    (window as any).__editorControls = controls;

    // 清空场景 - 移除所有旧对象(防止刷新时累积)
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach((child) => {
      toRemove.push(child);
    });
    toRemove.forEach((child) => scene.remove(child));

    // 标记场景初始化完成
    (window as any).__sceneInitialized = true;

    // 添加默认灯光 - 环境光 + 方向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    ambientLight.userData.id = 'light_ambient_default';
    scene.add(ambientLight);
    
    // 添加默认方向光 - 让使用PBR材质的模型能正常显示
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    directionalLight.userData.id = 'light_directional_default';
    scene.add(directionalLight);
    
    // 加载默认HDR环境贴图 - 从public目录加载
    const hdrLoader = new HDRLoader();
    hdrLoader.load(
      '/hdr/kloofendal_48d_partly_cloudy_puresky_2k.hdr', // public目录下的路径
      (texture: THREE.DataTexture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture; // 设置为环境贴图,提供真实光照和反射
        // 不设置background,保持纯色背景,环境贴图只用于光照和反射
      },
      undefined,
      (error: unknown) => {

      }
    );

    // 添加网格辅助 - 紫色主题,更大更美观
    const gridHelper = new THREE.GridHelper(1000, 50, 0x9333ea, 0x581c87);
    gridHelper.name = 'grid';
    scene.add(gridHelper);

    // 添加坐标轴辅助
    const axesHelper = new THREE.AxesHelper(1000);
    axesHelper.name = 'axes';
    scene.add(axesHelper);

    // 添加变换控制器 (Gizmo)
    const transformControls = new TransformControls(cameraObj, renderer.domElement);
    let wasDragging = false; // 跟踪是否刚刚完成拖拽
    let transformStartState: {position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3} | null = null; // 记录拖拽前的状态
    let transformObjectId: string | null = null; // 记录被操作的对象ID
    
    transformControls.addEventListener('dragging-changed', (event: any) => {
      // 拖拽Gizmo时完全禁用OrbitControls,实现互斥
      controls.enabled = !event.value;
      
      // 拖拽开始时记录初始状态
      if (event.value && transformControls.object) {
        const obj = transformControls.object;
        transformStartState = {
          position: obj.position.clone(),
          rotation: obj.rotation.clone(),
          scale: obj.scale.clone(),
        };
        
        // 查找对象ID
        const scene = sceneRef.current;
        if (scene) {
          scene.traverse((child: THREE.Object3D) => {
            if (child === obj) {
              // 从store中查找ID
              const store = useSceneStore.getState();
              store.objects.forEach(o => {
                const threeObj = store.getThreeObject(o.id);
                if (threeObj === obj) {
                  transformObjectId = o.id;
                }
              });
            }
          });
        }
      }
      
      // 如果从拖拽变为不拖拽,标记刚刚完成拖拽,并记录历史
      if (!event.value && transformStartState && transformObjectId) {
        wasDragging = true;
        
        const obj = transformControls.object;
        if (obj) {
          const endState = {
            position: [obj.position.x, obj.position.y, obj.position.z],
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          };
          
          const startState = {
            position: [transformStartState.position.x, transformStartState.position.y, transformStartState.position.z],
            rotation: [transformStartState.rotation.x, transformStartState.rotation.y, transformStartState.rotation.z],
            scale: [transformStartState.scale.x, transformStartState.scale.y, transformStartState.scale.z],
          };
          
          // 记录到历史 - 根据实际变化确定操作类型
          const hasMoved = startState.position[0] !== endState.position[0] || 
                          startState.position[1] !== endState.position[1] || 
                          startState.position[2] !== endState.position[2];
          const hasRotated = startState.rotation[0] !== endState.rotation[0] || 
                            startState.rotation[1] !== endState.rotation[1] || 
                            startState.rotation[2] !== endState.rotation[2];
          const hasScaled = startState.scale[0] !== endState.scale[0] || 
                           startState.scale[1] !== endState.scale[1] || 
                           startState.scale[2] !== endState.scale[2];
          
          if (hasMoved || hasRotated || hasScaled) {
            const actionType = hasMoved ? 'move' : (hasRotated ? 'rotate' : 'scale');
            
            useHistoryStore.getState().push({
              type: actionType,
              description: `${actionType} object`,
              before: { objectId: transformObjectId, ...startState },
              after: { objectId: transformObjectId, ...endState },
              objectId: transformObjectId,
            });
          }
        }
        
        // 100ms后重置标志,让后续点击正常工作
        setTimeout(() => {
          wasDragging = false;
        }, 100);
        
        // 清空临时状态
        transformStartState = null;
        transformObjectId = null;
      }
    });
    
    // Three.js 0.184: 必须将getHelper()返回的Object3D添加到scene才能渲染Gizmo
    const gizmoHelper = transformControls.getHelper();
    scene.add(gizmoHelper);
    
    transformControlsRef.current = transformControls;
    
    // 将TransformControls暴露到全局,供键盘快捷键使用
    (window as any).__editorTransformControls = transformControls;
    gizmoHelperRef.current = gizmoHelper; // 保存gizmoHelper引用用于点击检测
    
    // 高亮管理 - 用于导入模型的选中效果(已禁用)
    const highlightedMaterials = new Map<THREE.Material, {emissive: THREE.Color, emissiveIntensity: number}>();
    
    // 应用高亮效果 - 已禁用,不再使用选中色
    (window as any).__applyHighlight = function(group: THREE.Group) {
      // 不做任何操作,已禁用高亮
    };
    
    // 清除高亮效果 - 恢复原始材质状态(支持Group和单个Mesh)
    (window as any).__clearHighlight = function() {
      // 清除Group的高亮
      highlightedMaterials.forEach((original, material) => {
        const mat = material as any;
        if (mat.emissive) {
          mat.emissive.copy(original.emissive);
          mat.emissiveIntensity = original.emissiveIntensity;
          mat.needsUpdate = true;
        }
      });
      highlightedMaterials.clear();
      
      // 清除单个Mesh的高亮
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as any;
          if (mat && !Array.isArray(mat) && mat._originalHighlight) {
            mat.emissive.copy(mat._originalHighlight.emissive);
            mat.emissiveIntensity = mat._originalHighlight.intensity;
            mat.needsUpdate = true;
            delete mat._originalHighlight;
          }
        }
      });
    };

    // 设置默认工具
    transformControls.setMode('translate');

    // 注册示例立方体到store (已删除)
    // registerThreeObject('cube_default', cube);

    // 点击事件处理 (对象选择)
    const handleClick = (event: MouseEvent) => {
      // 如果正在拖拽Gizmo、刚刚完成Gizmo拖拽、或刚刚完成视角拖拽,不处理点击
      const isDragging = typeof (window as any).__isOrbitDragging === 'function' 
        ? (window as any).__isOrbitDragging() 
        : isOrbitDragging;
      if (transformControls.dragging || wasDragging || isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraObj);
      
      // 获取场景中所有可点击的网格对象 (排除Gizmo、网格、坐标轴)
      const clickableObjects: THREE.Object3D[] = [];
      const gizmoHelper = gizmoHelperRef.current;
      
      scene.traverse((child) => {
        // 包含Mesh和Group,排除TransformControls的Gizmo对象、网格、坐标轴、灯光等不可见对象
        if ((child instanceof THREE.Mesh || child instanceof THREE.Group) && 
            child.name !== 'grid' && 
            child.name !== 'axes' &&
            !(child instanceof THREE.Light)) {
          // 检查是否是gizmoHelper或其子对象
          let isGizmo = false;
          if (gizmoHelper) {
            let current: THREE.Object3D | null = child;
            while (current) {
              if (current === gizmoHelper) {
                isGizmo = true;
                break;
              }
              current = current.parent;
            }
          }
          
          if (!isGizmo) {
            clickableObjects.push(child);
          }
        }
      });

      const intersects = raycasterRef.current.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        // 直接选中最底层的mesh,不向上升查到Group
        let selectedObject = intersects[0].object;
        
        // 确保选中是Mesh或Group类型(排除辅助对象等)
        while (selectedObject.parent && 
               !(selectedObject instanceof THREE.Mesh) && 
               !(selectedObject instanceof THREE.Group)) {
          selectedObject = selectedObject.parent;
        }
        
        // 确保对象可见
        selectedObject.visible = true;
        
        // 不再添加高亮效果,直接附加TransformControls
        
        // 附加TransformControls到选中对象(Mesh或Group都可以)
        transformControls.attach(selectedObject);
        
        // 策略1: 通过uuid查找(优先,支持子mesh)
        let businessId = objects.find(obj => obj.id === selectedObject.uuid)?.id;
        
        // 策略1.5: 如果uuid没找到,直接使用uuid作为id(对于子mesh)
        if (!businessId) {
          // 对于子mesh,直接使用uuid作为id
          businessId = selectedObject.uuid;
        }
        
        // 策略2: 通过name精确匹配
        if (!businessId) {
          businessId = objects.find(obj => obj.name === selectedObject.name)?.id;
        }
        
        // 策略3: 通过threeObjects映射查找
        if (!businessId) {
          const threeObjects = useSceneStore.getState().threeObjects;
          for (const [id, threeObj] of threeObjects) {
            if (threeObj === selectedObject || threeObj === selectedObject.parent) {
              businessId = id;
              break;
            }
          }
        }
        
        // 策略4: 使用uuid作为ID (最后兜底)
        if (!businessId) {
          businessId = selectedObject.uuid;
        }
        
        if (businessId) {
          selectObject(businessId);
        }
      } else {
        // 点击空白处 - 取消所有选中状态
        const currentSelectedIds = useSceneStore.getState().selectedIds;
        const currentSelectedLightId = useLightStore.getState().selectedLightId;
        
        if (currentSelectedIds.length > 0) {
          transformControls.detach();
          // 清除高亮效果
          if ((window as any).__clearHighlight) {
            (window as any).__clearHighlight();
          }
          deselectAll();
        }
        
        // 取消灯光选中
        if (currentSelectedLightId) {
          selectLight(null);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 拖拽导入处理
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        await handleFileImport(files, scene);
      }
    };

    renderer.domElement.addEventListener('dragover', handleDragOver);
    renderer.domElement.addEventListener('drop', handleDrop);
    
    // 将事件处理函数暴露到全局,供recreateRenderer使用
    (window as any).__editorClickHandler = handleClick;
    (window as any).__editorDragOverHandler = handleDragOver;
    (window as any).__editorDropHandler = handleDrop;

    }, [backgroundColor, camera, deselectAll, handleFileImport]);

  // 应用后期处理效果
  const applyPostProcessEffect = useCallback((effectName: string, config: any) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    
    // 销毁旧的composer
    if (composerRef.current) {
      composerRef.current.dispose();
      composerRef.current = null;
      currentPassRef.current = null;
    }
    
    // 如果选择"无"效果,不创建composer
    if (effectName === 'none') {
      composerRef.current = null;
      return;
    }
    
    // 创建EffectComposer
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    
    // 添加RenderPass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    let pass: any = null;

    // 根据效果名称创建对应的Pass
    switch (effectName) {
      case 'bloom':
        pass = new UnrealBloomPass(
          new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
          config.bloom.intensity || 1.0,
          config.bloom.radius || 0.4,
          config.bloom.threshold || 0.85
        );
        break;

      case 'fxaa':
        pass = new ShaderPass(FXAAShader);
        pass.uniforms['resolution'].value.set(
          1 / (renderer.domElement.width * renderer.getPixelRatio()),
          1 / (renderer.domElement.height * renderer.getPixelRatio())
        );
        break;

      case 'sobel':
        pass = new ShaderPass(SobelOperatorShader);
        pass.uniforms['resolution'].value.set(
          renderer.domElement.width,
          renderer.domElement.height
        );
        break;

      case 'chromatic':
        pass = new ShaderPass(chromaticAberrationShader);
        if (config.chromatic) {
          pass.uniforms['amount'].value = config.chromatic.amount || 0.002;
        }
        break;

      case 'pixelate':
        pass = new ShaderPass({
          ...pixelationShader,
          uniforms: {
            ...pixelationShader.uniforms,
            pixelSize: { value: config.pixelate.size || 2.0 },
            resolution: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
          },
        });
        break;

      case 'vignette':
        const vignetteShader = {
          uniforms: {
            tDiffuse: { value: null },
            darkness: { value: config.vignette?.darkness || 0.5 },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float darkness;
            varying vec2 vUv;
            void main() {
              vec4 texel = texture2D(tDiffuse, vUv);
              vec2 uv = (vUv - vec2(0.5)) * vec2(darkness);
              float vig = 1.0 - dot(uv, uv);
              gl_FragColor = vec4(texel.rgb * vig, texel.a);
            }
          `,
        };
        pass = new ShaderPass(vignetteShader);
        break;

      case 'none':
      default:
        composerRef.current = null;
        return;
    }
    
    if (pass) {
      composer.addPass(pass);
      currentPassRef.current = pass;
      
      // 添加OutputPass(色调映射和sRGB转换)
      const outputPass = new OutputPass();
      composer.addPass(outputPass);
    }
  }, []);

  // 渲染循环 - 添加对后期处理状态变化的监控(使用useRef避免依赖变化导致重建)
  const postProcessEnabledRef = useRef<boolean>(false);
  const postProcessEffectRef = useRef<string>('none');
  
  const animate = useCallback(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // 更新TransformControls
    if (transformControlsRef.current) {
      transformControlsRef.current.update();
    }
    
    // 更新灯光Helper
    lightHelpersRef.current.forEach((helper) => {
      if (helper.update) {
        helper.update();
      }
    });
    
    // 检查后期处理配置变化(从全局读取)
    const postConfig = (window as any).__postProcessConfig;
    if (postConfig && postConfig.enabled) {
      const needUpdate = postConfig.effect !== postProcessEffectRef.current || 
                         !composerRef.current;
      
      if (needUpdate && postConfig.effect !== 'none') {
        // 启用了后期处理且效果改变,使用composer渲染
        applyPostProcessEffect(postConfig.effect, postConfig);
        postProcessEffectRef.current = postConfig.effect;
        postProcessEnabledRef.current = true;
      }
      
      // 更新pass参数(每帧同步)
      if (composerRef.current && currentPassRef.current) {
        updatePassParams(currentPassRef.current, postConfig);
      }
      
      // 使用composer渲染
      if (composerRef.current) {
        composerRef.current.render();
      }
    } else {
      // 未启用后期处理,使用普通renderer
      if (postProcessEnabledRef.current || composerRef.current) {
        // 从启用状态变为关闭,清理composer
        composerRef.current = null;
        currentPassRef.current = null;
        postProcessEnabledRef.current = false;
        postProcessEffectRef.current = 'none';
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [applyPostProcessEffect]);

  // 窗口大小调整
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // 初始化
  useEffect(() => {
    initScene();
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      
      // 清理场景中的所有对象(防止内存泄漏)
      if (sceneRef.current) {
        const toRemove: THREE.Object3D[] = [];
        sceneRef.current.children.forEach((child) => {
          toRemove.push(child);
        });
        toRemove.forEach((child) => sceneRef.current!.remove(child));
      }
      
      // 清理全局引用和初始化标志(允许React严格模式下重新初始化)
      delete (window as any).__editorScene;
      delete (window as any).__sceneInitialized;
      initializedRef.current = false; // 重置初始化标志,允许重新初始化
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene, animate, handleResize]);

  // 控制网格和坐标轴显示
  useEffect(() => {
    if (!sceneRef.current) return;

    const grid = sceneRef.current.getObjectByName('grid');
    const axes = sceneRef.current.getObjectByName('axes');

    if (grid) grid.visible = gridVisible;
    if (axes) axes.visible = axesVisible;
  }, [gridVisible, axesVisible]);

  // 更新TransformControls工具模式
  useEffect(() => {
    if (!transformControlsRef.current) return;

    const modeMap = {
      select: 'translate',
      move: 'translate',
      rotate: 'rotate',
      scale: 'scale',
    };

    transformControlsRef.current.setMode(modeMap[currentTool]);
  }, [currentTool]);

  // 监听TransformControls变化,更新属性面板
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    const onChange = () => {
      const object = transformControls.object;
      if (object && selectedIds.length > 0) {
        updateObject(selectedIds[0], {
          position: [object.position.x, object.position.y, object.position.z],
          rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
          scale: [object.scale.x, object.scale.y, object.scale.z],
        });
      }
    };

    transformControls.addEventListener('change', onChange);

    return () => {
      transformControls.removeEventListener('change', onChange);
    };
  }, [selectedIds, updateObject]);

  // 灯光同步 - 根据lightStore创建/更新Three.js灯光
  useEffect(() => {
    if (!sceneRef.current) return;

    // 移除不在lightStore中的灯光
    lightsRef.current.forEach((light, id) => {
      if (!lights.find(l => l.id === id)) {
        sceneRef.current!.remove(light);
        lightsRef.current.delete(id);
      }
    });

    // 创建或更新灯光
    lights.forEach((lightConfig) => {
      let light = lightsRef.current.get(lightConfig.id);

      // 如果灯光不存在,创建新灯光
      if (!light) {
        switch (lightConfig.type) {
          case 'ambient':
            light = new THREE.AmbientLight(
              new THREE.Color(lightConfig.color),
              lightConfig.intensity
            );
            break;

          case 'directional':
            light = new THREE.DirectionalLight(
              new THREE.Color(lightConfig.color),
              lightConfig.intensity
            );
            if (lightConfig.position) {
              light.position.set(...lightConfig.position);
            }
            if (lightConfig.castShadow) {
              (light as THREE.DirectionalLight).castShadow = true;
              (light as THREE.DirectionalLight).shadow.mapSize.width = lightConfig.shadowMapSize || 2048;
              (light as THREE.DirectionalLight).shadow.mapSize.height = lightConfig.shadowMapSize || 2048;
            }
            break;

          case 'point':
            light = new THREE.PointLight(
              new THREE.Color(lightConfig.color),
              lightConfig.intensity,
              lightConfig.distance || 10
            );
            if (lightConfig.position) {
              light.position.set(...lightConfig.position);
            }
            if (lightConfig.castShadow) {
              (light as THREE.PointLight).castShadow = true;
            }
            break;

          case 'spot':
            light = new THREE.SpotLight(
              new THREE.Color(lightConfig.color),
              lightConfig.intensity,
              lightConfig.distance || 10,
              lightConfig.angle || 0.5,
              lightConfig.penumbra || 0.5
            );
            if (lightConfig.position) {
              light.position.set(...lightConfig.position);
            }
            if (lightConfig.castShadow) {
              (light as THREE.SpotLight).castShadow = true;
            }
            break;

          case 'hemisphere':
            light = new THREE.HemisphereLight(
              new THREE.Color(lightConfig.color),
              new THREE.Color(lightConfig.groundColor || '#444444'),
              lightConfig.intensity
            );
            break;
        }

        if (light) {
          light.name = lightConfig.name;
          light.userData.id = lightConfig.id;
          sceneRef.current!.add(light);
          lightsRef.current.set(lightConfig.id, light);
        }
      } else {
        // 更新现有灯光
        light.color.set(lightConfig.color);
        light.intensity = lightConfig.intensity;
        light.visible = lightConfig.enabled;

        if (lightConfig.position && !(light instanceof THREE.AmbientLight || light instanceof THREE.HemisphereLight)) {
          light.position.set(...lightConfig.position);
        }
      }
    });
  }, [lights]);

  // 灯光Helper显示 - 选中灯光时显示Helper,取消选中时隐藏
  useEffect(() => {
    if (!sceneRef.current) return;

    // 清除所有旧的Helper
    lightHelpersRef.current.forEach((helper) => {
      sceneRef.current!.remove(helper);
    });
    lightHelpersRef.current.clear();

    // 只有当选中灯光时才显示Helper,选中其他对象时不显示
    if (selectedLightId && selectedIds.length === 0) {
      const light = lightsRef.current.get(selectedLightId);
      if (!light) return;

      let helper: any = null;

      switch (light.type) {
        case 'DirectionalLight':
          helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 5);
          break;
        case 'PointLight':
          helper = new THREE.PointLightHelper(light as THREE.PointLight, 0.5);
          break;
        case 'SpotLight':
          helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
          break;
        case 'HemisphereLight':
          helper = new THREE.HemisphereLightHelper(light as THREE.HemisphereLight, 1);
          break;
        case 'AmbientLight':
          // AmbientLight没有Helper,因为它没有位置
          break;
      }

      if (helper) {
        helper.name = `helper_${selectedLightId}`;
        sceneRef.current.add(helper);
        lightHelpersRef.current.set(selectedLightId, helper);
      }
    }
  }, [selectedLightId, selectedIds, lights]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: 'relative' }}
    />
  );
}
