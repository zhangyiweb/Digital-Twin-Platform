import { useCallback } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export function useSceneExporter() {
  // 导出为GLB文件
  const exportGLB = useCallback(async (scene: THREE.Scene): Promise<void> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      exporter.parse(
        scene,
        (result) => {
          // 创建Blob
          const blob = new Blob([result], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          
          // 创建下载链接
          const link = document.createElement('a');
          link.href = url;
          link.download = `scene_${Date.now()}.glb`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理
          URL.revokeObjectURL(url);
          

          resolve();
        },
        (error) => {

          reject(error);
        },
        {
          binary: true,
          trs: true,
          onlyVisible: true,
        }
      );
    });
  }, []);

  // 导出为GLTF (JSON格式)
  const exportGLTF = useCallback(async (scene: THREE.Scene): Promise<void> => {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      exporter.parse(
        scene,
        (result) => {
          // 创建JSON文件
          const json = JSON.stringify(result, null, 2);
          const blob = new Blob([json], { type: 'model/gltf+json' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `scene_${Date.now()}.gltf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
          

          resolve();
        },
        (error) => {

          reject(error);
        },
        {
          binary: false,
          trs: true,
          onlyVisible: true,
        }
      );
    });
  }, []);

  // 导出为HTML (独立查看�?
  const exportHTML = useCallback(async (scene: THREE.Scene): Promise<void> => {
    // 导出场景为JSON
    const exporter = new GLTFExporter();
    
    exporter.parse(
      scene,
      (gltfData) => {
        // 创建Base64编码
        const jsonStr = JSON.stringify(gltfData);
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        const dataUri = `data:model/gltf+json;base64,${base64}`;

        // 创建HTML模板
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>数字孪生场景查看�?/title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #1a1a1a; }
    #canvas { width: 100vw; height: 100vh; display: block; }
    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      background: rgba(0,0,0,0.5);
      padding: 10px;
      border-radius: 5px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div id="info>
    数字孪生场景查看�?br>
    鼠标左键旋转 | 右键平移 | 滚轮缩放
  </div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    // 场景设置
    const canvas = document.getElementById('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加默认灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 加载嵌入的场景数�?
    const loader = new GLTFLoader();
    loader.load(
      '${dataUri}',
      (gltf) => {
        scene.add(gltf.scene);
        
        // 自动居中
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        if (maxDim > 0) {
          const scale = 5 / maxDim;
          gltf.scene.scale.setScalar(scale);
        }
        
        gltf.scene.position.sub(center.multiplyScalar(scale));
        controls.target.copy(gltf.scene.position);
        controls.update();
        

      },
      undefined,
      (error) => {

      }
    );

    // 渲染循环
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 响应�?
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

        // 下载HTML文件
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scene_${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);


      },
      (error) => {

      },
      { binary: false }
    );
  }, []);

  // 截图导出
  const exportScreenshot = useCallback((
    renderer: THREE.WebGLRenderer,
    filename?: string
  ): void => {
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename || `screenshot_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    

  }, []);

  return {
    exportGLB,
    exportGLTF,
    exportHTML,
    exportScreenshot,
  };
}
