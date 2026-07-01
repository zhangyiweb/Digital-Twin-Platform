import type { CameraTour, Vec3 } from '@/types/cameraTour';

export interface ExportedCameraTourWaypoint {
  index: number;
  name: string;
  type: 'waypoint' | 'focus';
  position: Vec3;
  target: Vec3;
  objectId?: string;
  objectName?: string;
  dwellTime: number;
  transitionTime: number;
}

export interface ExportedCameraTourJson {
  version: string;
  exportTime: string;
  tour: {
    id: string;
    name: string;
    loop: boolean;
  };
  /** 路线折线：按漫游点顺序连接相机位置，便于直观看漫游路径 */
  route: {
    points: Vec3[];
    lineSegments: Array<{ from: Vec3; to: Vec3 }>;
  };
  /** 各漫游点名称、坐标与参数，可单独拿去实现漫游 */
  waypoints: ExportedCameraTourWaypoint[];
}

export function buildCameraTourJson(tour: CameraTour): ExportedCameraTourJson {
  const waypoints: ExportedCameraTourWaypoint[] = tour.stops.map((stop, index) => ({
    index,
    name: stop.name,
    type: stop.type,
    position: { ...stop.position },
    target: { ...stop.target },
    objectId: stop.objectId,
    objectName: stop.objectName,
    dwellTime: stop.dwellTime,
    transitionTime: stop.transitionTime,
  }));

  const points = waypoints.map((w) => w.position);
  const lineSegments: Array<{ from: Vec3; to: Vec3 }> = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    lineSegments.push({ from: { ...points[i] }, to: { ...points[i + 1] } });
  }

  return {
    version: '1.0',
    exportTime: new Date().toISOString(),
    tour: {
      id: tour.id,
      name: tour.name,
      loop: tour.loop,
    },
    route: { points, lineSegments },
    waypoints,
  };
}

export function downloadCameraTourJson(tour: CameraTour, filename?: string) {
  const json = buildCameraTourJson(tour);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `camera-tour-${tour.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 从导出 JSON 还原为播放器可用的 tour 结构 */
export function tourFromExportedJson(json: ExportedCameraTourJson): CameraTour {
  return {
    id: json.tour.id,
    name: json.tour.name,
    loop: json.tour.loop,
    stops: json.waypoints.map((w) => ({
      id: `stop_${w.index}`,
      name: w.name,
      type: w.type,
      position: { ...w.position },
      target: { ...w.target },
      objectId: w.objectId,
      objectName: w.objectName,
      dwellTime: w.dwellTime,
      transitionTime: w.transitionTime,
    })),
  };
}
