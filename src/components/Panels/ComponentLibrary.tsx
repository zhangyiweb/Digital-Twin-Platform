import { useState } from 'react';
import { useLightStore } from '@/store/lightStore';
import { useSceneStore } from '@/store/sceneStore';
import * as THREE from 'three';

export function ComponentLibrary() {
  const { addLight, selectLight } = useLightStore();
  const { addSceneObject, selectObject } = useSceneStore();
  const [activeTab, setActiveTab] = useState<'geometry' | 'lights'>('geometry'); // 默认显示几何体

  // 添加灯光
  const handleAddLight = (type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere') => {
    const lightConfigs: Record<string, any> = {
      ambient: {
        name: '环境光',
        type: 'ambient',
        color: '#ffffff',
        intensity: 0.5,
        castShadow: false,
      },
      directional: {
        name: '平行光',
        type: 'directional',
        color: '#ffffff',
        intensity: 1.0,
        position: [5, 10, 7.5],
        castShadow: true,
      },
      point: {
        name: '点光源',
        type: 'point',
        color: '#ffffff',
        intensity: 1.0,
        position: [0, 5, 0],
        castShadow: true,
        distance: 10,
      },
      spot: {
        name: '聚光灯',
        type: 'spot',
        color: '#ffffff',
        intensity: 1.0,
        position: [0, 5, 0],
        castShadow: true,
        distance: 10,
        angle: 0.5,
        penumbra: 0.5,
      },
      hemisphere: {
        name: '半球光',
        type: 'hemisphere',
        color: '#ffffff',
        intensity: 0.5,
        groundColor: '#444444',
      },
    };

    const lightId = `light_${Date.now()}`;
    addLight({ ...lightConfigs[type], id: lightId });
    
    // 自动选中新添加的灯光
    selectLight(lightId);
  };

  // 添加基础几何体
  const handleAddGeometry = (type: 'cube' | 'sphere' | 'cylinder' | 'plane' | 'cone') => {
    let geometry: THREE.BufferGeometry;
    let name: string;

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        name = '立方体';
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        name = '球体';
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        name = '圆柱体';
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(2, 2);
        name = '平面';
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        name = '圆锥体';
        break;
      default:
        return;
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.5,
      roughness: 0.5,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // 添加到场景
    const scene = (window as any).__editorScene;
    if (scene) {
      scene.add(mesh);
      
      // 注册到store
      const id = `geometry_${Date.now()}`;
      addSceneObject({
        id,
        name: name,
        type: 'mesh',
        visible: true,
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      });
      
      // 注册Three.js对象映射
      useSceneStore.getState().registerThreeObject(id, mesh);
      
      // 自动选中新添加的几何体
      selectObject(id);
      
      // 附加TransformControls
      const transformControls = (window as any).__editorTransformControls;
      if (transformControls) {
        transformControls.attach(mesh);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-t border-gray-700">
      {/* Tab栏 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('lights')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'lights'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          💡 灯光
        </button>
        <button
          onClick={() => setActiveTab('geometry')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'geometry'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📦 几何体
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'lights' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddLight('ambient')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              环境光
            </button>
            <button
              onClick={() => handleAddLight('directional')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              平行光
            </button>
            <button
              onClick={() => handleAddLight('point')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              点光源
            </button>
            <button
              onClick={() => handleAddLight('spot')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              聚光灯
            </button>
            <button
              onClick={() => handleAddLight('hemisphere')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors col-span-2"
            >
              半球光
            </button>
          </div>
        )}

        {activeTab === 'geometry' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddGeometry('cube')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              立方体
            </button>
            <button
              onClick={() => handleAddGeometry('sphere')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              球体
            </button>
            <button
              onClick={() => handleAddGeometry('cylinder')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆柱体
            </button>
            <button
              onClick={() => handleAddGeometry('plane')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              平面
            </button>
            <button
              onClick={() => handleAddGeometry('cone')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors col-span-2"
            >
              圆锥体
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
