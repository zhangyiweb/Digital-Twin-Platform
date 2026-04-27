import { useLightStore } from '@/store/lightStore';
import type { LightType } from '@/types/light';

export function LightPanel() {
  const { lights, selectedLightId, addLight, selectLight, toggleLight, removeLight } = useLightStore();

  const handleAddLight = (type: LightType) => {
    const configs: Record<LightType, any> = {
      ambient: {
        name: '环境光',
        type: 'ambient',
        enabled: true,
        color: '#ffffff',
        intensity: 0.5,
        castShadow: false,
      },
      directional: {
        name: '平行光',
        type: 'directional',
        enabled: true,
        color: '#ffffff',
        intensity: 1.0,
        position: [5, 10, 5],
        castShadow: true,
        shadowMapSize: 2048,
      },
      point: {
        name: '点光源',
        type: 'point',
        enabled: true,
        color: '#ffffff',
        intensity: 1.0,
        position: [0, 3, 0],
        distance: 10,
        castShadow: true,
        shadowMapSize: 1024,
      },
      spot: {
        name: '聚光灯',
        type: 'spot',
        enabled: true,
        color: '#ffffff',
        intensity: 1.0,
        position: [0, 5, 0],
        target: [0, 0, 0],
        angle: 0.5,
        penumbra: 0.5,
        distance: 10,
        castShadow: true,
        shadowMapSize: 1024,
      },
      hemisphere: {
        name: '半球光',
        type: 'hemisphere',
        enabled: true,
        color: '#ffffff',
        groundColor: '#444444',
        intensity: 0.5,
        castShadow: false,
      },
    };

    addLight(configs[type]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* 标题栏 */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">灯光管理</h3>
        
        {/* 添加灯光按钮 */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => handleAddLight('ambient')}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            + 环境光
          </button>
          <button
            onClick={() => handleAddLight('directional')}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            + 平行光
          </button>
          <button
            onClick={() => handleAddLight('point')}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            + 点光源
          </button>
          <button
            onClick={() => handleAddLight('spot')}
            className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            + 聚光灯
          </button>
        </div>
      </div>

      {/* 灯光列表 */}
      <div className="flex-1 overflow-y-auto">
        {lights.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            场景中没有灯光
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {lights.map((light) => (
              <div
                key={light.id}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedLightId === light.id
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => selectLight(light.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {/* 灯光类型图标 */}
                    <span className="text-sm">
                      {light.type === 'ambient' && '💡'}
                      {light.type === 'directional' && '☀️'}
                      {light.type === 'point' && '💡'}
                      {light.type === 'spot' && '🔦'}
                      {light.type === 'hemisphere' && '🌗'}
                    </span>
                    <span className="text-sm text-white">{light.name}</span>
                  </div>
                  
                  {/* 开关按钮 */}
                  <button
                    className={`w-6 h-4 rounded-full transition-colors ${
                      light.enabled ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLight(light.id);
                    }}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full transform transition-transform ${
                        light.enabled ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{light.type}</span>
                  <span>强度: {light.intensity.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-500">
        共 {lights.length} 个灯光
      </div>
    </div>
  );
}
