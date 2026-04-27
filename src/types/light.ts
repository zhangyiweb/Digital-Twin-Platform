// 灯光类型
export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';

// 灯光配置
export interface LightConfig {
  id: string;
  name: string;
  type: LightType;
  enabled: boolean;
  
  // 通用属性
  color: string;
  intensity: number;
  
  // 位置相关
  position?: [number, number, number];
  target?: [number, number, number];
  
  // 聚光灯特有属性
  angle?: number;          // 聚光灯角度 (弧度)
  penumbra?: number;       // 聚光灯边缘柔和度 (0-1)
  distance?: number;       // 光照距离
  
  // 阴影参数 (DirectionalLight和SpotLight)
  castShadow: boolean;
  shadowMapSize?: number;          // 阴影贴图尺寸 (默认2048)
  shadowMapWidth?: number;         // 阴影贴图宽度
  shadowMapHeight?: number;        // 阴影贴图高度
  shadowCameraNear?: number;       // 阴影相机近裁剪面 (默认0.5)
  shadowCameraFar?: number;        // 阴影相机远裁剪面 (默认5000)
  shadowCameraLeft?: number;       // 阴影相机左边界 (默认-2000)
  shadowCameraRight?: number;      // 阴影相机右边界 (默认2000)
  shadowCameraTop?: number;        // 阴影相机上边界 (默认2000)
  shadowCameraBottom?: number;     // 阴影相机下边界 (默认-2000)
  shadowBias?: number;             // 阴影偏差 (默认-0.0003)
  shadowRadius?: number;           // 阴影柔和度 (默认2)
  
  // 环境光/半球光特有
  groundColor?: string;    // 半球光地面颜色
}

// 灯光操作动作
export interface LightAction {
  type: 'add' | 'remove' | 'update' | 'toggle';
  lightId?: string;
  lightConfig?: LightConfig;
  timestamp: number;
}

// 灯光状态
export interface LightState {
  lights: LightConfig[];
  selectedLightId: string | null;
}
