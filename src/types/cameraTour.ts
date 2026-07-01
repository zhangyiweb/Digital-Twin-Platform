/** 漫游站点类型：路径点 / 设备聚焦 */
export type CameraTourStopType = 'waypoint' | 'focus';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 单个漫游站点 */
export interface CameraTourStop {
  id: string;
  name: string;
  type: CameraTourStopType;
  /** 相机位置 */
  position: Vec3;
  /** 注视点（OrbitControls.target） */
  target: Vec3;
  /** 聚焦模式绑定的场景对象 id */
  objectId?: string;
  objectName?: string;
  /** 到达后停留秒数 */
  dwellTime: number;
  /** 从上一站飞入的过渡秒数 */
  transitionTime: number;
}

/** 漫游路线 */
export interface CameraTour {
  id: string;
  name: string;
  loop: boolean;
  stops: CameraTourStop[];
}

export const DEFAULT_DWELL_TIME = 2;
export const DEFAULT_TRANSITION_TIME = 2;

export function createStopId(): string {
  return `stop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createTourId(): string {
  return `tour_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
