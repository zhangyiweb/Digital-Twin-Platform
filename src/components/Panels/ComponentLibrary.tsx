import { useState } from 'react';
import { useLightStore } from '@/store/lightStore';
import { useSceneStore } from '@/store/sceneStore';
import {
  createPrimitiveObject,
  type PrimitiveGeometryType,
} from '@/config/defaultGeometry';

export function ComponentLibrary() {
  const { addLight, selectLight } = useLightStore();
  const { addSceneObject, selectObject, deselectAll } = useSceneStore();
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
        target: [0, 0, 0],
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
        target: [0, 0, 0],
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
        position: [0, 10, 0],
      },
    };

    const lightId = addLight({
      ...lightConfigs[type],
      enabled: true,
    });

    deselectAll();
    selectLight(lightId);
  };

  // 添加基础几何体（统一默认材质、位置、阴影等）
  const handleAddGeometry = (type: PrimitiveGeometryType) => {
    const scene = (window as any).__editorScene;
    if (!scene) return;

    const { object, preset } = createPrimitiveObject(type);
    const id = `geometry_${Date.now()}`;

    object.name = preset.name;
    object.userData.id = id;
    object.userData.geometryType = type;

    scene.add(object);

    addSceneObject({
      id,
      name: preset.name,
      type: 'mesh',
      visible: true,
      position: [...preset.position],
      rotation: [...preset.rotation],
      scale: [...preset.scale],
    });

    useSceneStore.getState().registerThreeObject(id, object);

    selectLight(null);
    selectObject(id);

    const transformControls = (window as any).__editorTransformControls;
    if (transformControls) {
      transformControls.attach(object);
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
              onClick={() => handleAddGeometry('box')}
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
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆锥体
            </button>
            <button
              onClick={() => handleAddGeometry('capsule')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              胶囊体
            </button>
            <button
              onClick={() => handleAddGeometry('circle')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆形
            </button>
            <button
              onClick={() => handleAddGeometry('ring')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆环
            </button>
            <button
              onClick={() => handleAddGeometry('torus')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆环体
            </button>
            <button
              onClick={() => handleAddGeometry('torusKnot')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              圆环结
            </button>
            <button
              onClick={() => handleAddGeometry('dodecahedron')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              十二面体
            </button>
            <button
              onClick={() => handleAddGeometry('icosahedron')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              二十面体
            </button>
            <button
              onClick={() => handleAddGeometry('octahedron')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              八面体
            </button>
            <button
              onClick={() => handleAddGeometry('tetrahedron')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              四面体
            </button>
            <button
              onClick={() => handleAddGeometry('edges')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              边缘线框
            </button>
            <button
              onClick={() => handleAddGeometry('wireframe')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors col-span-2"
            >
              线框
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
