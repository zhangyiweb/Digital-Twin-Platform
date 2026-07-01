/**
 * 导出项目包中的 cameraTour.js 源码（相机漫游工具包，含完整使用说明注释）
 */
export function buildCameraTourJs(): string {
  return `import * as THREE from 'three';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  相机漫游工具包 — cameraTour.js
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件为独立工具模块，不附带 UI。编辑器在「全局设置 → 漫游」中配置路线后，
 * 导出项目时会生成 config/camera-tour.json，并由 main.js 挂载到 window.cameraTour。
 *
 * ── 配置文件：config/camera-tour.json ──
 *
 * {
 *   "version": "1.0",
 *   "tour": {
 *     "id": "tour_xxx",
 *     "name": "默认漫游",        // 路线名称
 *     "loop": false              // 是否循环播放
 *   },
 *   "route": {
 *     "points": [ { "x", "y", "z" }, ... ],           // 按顺序的相机位置折线
 *     "lineSegments": [ { "from": Vec3, "to": Vec3 } ] // 相邻点连线，便于画路径
 *   },
 *   "waypoints": [
 *     {
 *       "index": 0,
 *       "name": "漫游点 1",       // 漫游点显示名称（编辑器可重命名）
 *       "type": "waypoint",       // waypoint=路径点 | focus=设备聚焦点
 *       "position": { "x", "y", "z" },  // 相机坐标
 *       "target":   { "x", "y", "z" },  // Orbit 目标点
 *       "dwellTime": 2,           // 到达后停留秒数
 *       "transitionTime": 2,      // 从上一站飞入秒数
 *       "objectId": "...",        // 可选，聚焦的设备 id
 *       "objectName": "设备A"     // 可选，聚焦的设备名称
 *     }
 *   ]
 * }
 *
 * route 仅用于可视化折线；实际漫游动画以 waypoints[].position / target 为准。
 *
 * ── 自动初始化（main.js 已处理，一般无需手写）──
 *
 *   window.cameraTour = createCameraTourController({
 *     camera,
 *     controls,
 *     configUrl: './config/camera-tour.json',
 *   });
 *   await window.cameraTour.ready;
 *
 * ── 播放控制 API ──
 *
 *   window.cameraTour.play();              // 从第 1 个漫游点开始顺序播放
 *   window.cameraTour.pause();             // 暂停
 *   window.cameraTour.resume();            // 继续
 *   window.cameraTour.stop();              // 停止并恢复手动 OrbitControls
 *
 *   window.cameraTour.goToStop(2);         // 跳到 index=2 的漫游点（从 0 起）
 *   window.cameraTour.goToStop(0, true);   // 瞬间跳转，无飞行动画
 *   window.cameraTour.prev();
 *   window.cameraTour.next();
 *
 * ── 状态查询 ──
 *
 *   window.cameraTour.getState();
 *     // 'idle' | 'playing' | 'paused' | 'dwelling'
 *
 *   window.cameraTour.getCurrentStopIndex();  // 当前漫游点序号（0 起）
 *   window.cameraTour.getCurrentStop();       // 当前漫游点对象（含 name、position 等）
 *   window.cameraTour.getTour();              // 完整路线数据
 *   window.cameraTour.isActive();             // 是否正在漫游（含暂停）
 *
 * ── 事件监听（适合做导航 UI、字幕、高亮设备）──
 *
 *   window.cameraTour.on('stopChange', (index, stop) => {
 *     console.log('到达漫游点', index, stop.name);
 *     // stop.name 即编辑器中设置的漫游点名称
 *   });
 *
 *   window.cameraTour.on('stateChange', (state) => {
 *     console.log('状态', state);
 *   });
 *
 *   window.cameraTour.on('complete', () => {
 *     console.log('整段漫游结束');
 *   });
 *
 * ── 自行加载 / 切换路线 ──
 *
 *   await window.cameraTour.loadConfig('./config/other-tour.json');
 *   // 或直接传入对象：
 *   await window.cameraTour.loadConfig(jsonObject);
 *
 * ── 示例：根据漫游点名称做简单导航按钮 ──
 *
 *   const tour = window.cameraTour.getTour();
 *   tour.stops.forEach((stop, i) => {
 *     const btn = document.createElement('button');
 *     btn.textContent = stop.name;
 *     btn.onclick = () => window.cameraTour.goToStop(i);
 *     document.body.appendChild(btn);
 *   });
 *
 * ── 不用本模块、仅用 JSON 自行实现 ──
 *
 * 读取 waypoints 数组，对 position / target 做插值即可；route 可用来在地图上绘制黄色折线。
 *
 * 依赖：Three.js（与 main.js 共用 importmap）
 */

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpVec3(out, a, b, t) {
  out.set(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

/** 将 camera-tour.json 转为内部 tour 结构 */
function configToTour(json) {
  if (!json?.waypoints?.length) return null;
  return {
    id: json.tour?.id || 'tour',
    name: json.tour?.name || '漫游',
    loop: Boolean(json.tour?.loop),
    stops: json.waypoints.map((w, i) => ({
      id: 'stop_' + i,
      name: w.name || ('漫游点 ' + (i + 1)),
      type: w.type || 'waypoint',
      position: { ...w.position },
      target: { ...w.target },
      objectId: w.objectId,
      objectName: w.objectName,
      dwellTime: w.dwellTime ?? 2,
      transitionTime: w.transitionTime ?? 2,
    })),
  };
}

/**
 * 创建相机漫游控制器
 *
 * @param {object} options
 * @param {THREE.PerspectiveCamera} options.camera
 * @param {import('three/addons/controls/OrbitControls.js').OrbitControls} options.controls
 * @param {string} [options.configUrl]  JSON 路径，默认 './config/camera-tour.json'
 * @param {object} [options.config]     已解析的 JSON 对象（与 configUrl 二选一）
 * @returns {CameraTourController}
 */
export function createCameraTourController(options) {
  const { camera, controls } = options;
  let tour = null;
  let state = 'idle';
  let stopIndex = 0;
  let phase = 'transition';
  let phaseElapsed = 0;
  const fromPosition = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const tempPosition = new THREE.Vector3();
  const tempTarget = new THREE.Vector3();
  const listeners = { stopChange: [], complete: [], stateChange: [] };

  function emit(event, ...args) {
    (listeners[event] || []).forEach((fn) => fn(...args));
  }

  function setState(next) {
    state = next;
    emit('stateChange', next);
  }

  function beginTransitionFromCurrent() {
    fromPosition.copy(camera.position);
    fromTarget.copy(controls.target);
    phase = 'transition';
    phaseElapsed = 0;
  }

  function advanceToNextStop() {
    const nextIndex = stopIndex + 1;
    if (!tour || nextIndex >= tour.stops.length) {
      if (tour?.loop && tour.stops.length > 0) {
        stopIndex = 0;
        beginTransitionFromCurrent();
        setState('playing');
        return;
      }
      api.stop();
      emit('complete');
      return;
    }
    stopIndex = nextIndex;
    beginTransitionFromCurrent();
    setState('playing');
  }

  const api = {
    /** 加载 JSON 配置（可多次调用以切换路线） */
    async loadConfig(urlOrObject) {
      if (typeof urlOrObject === 'string') {
        const res = await fetch(urlOrObject);
        tour = configToTour(await res.json());
      } else {
        tour = configToTour(urlOrObject);
      }
      return tour;
    },

    /** 从第一个漫游点开始顺序播放 */
    play() {
      if (!tour?.stops?.length) return;
      controls.enabled = false;
      stopIndex = 0;
      beginTransitionFromCurrent();
      setState('playing');
    },

    pause() {
      if (state === 'playing' || state === 'dwelling') setState('paused');
    },

    resume() {
      if (state === 'paused') setState(phase === 'dwell' ? 'dwelling' : 'playing');
    },

    /** 停止漫游并恢复手动 OrbitControls */
    stop() {
      state = 'idle';
      phaseElapsed = 0;
      controls.enabled = true;
      emit('stateChange', 'idle');
    },

    /**
     * 跳转到指定漫游点
     * @param {number} index 漫游点序号，从 0 开始
     * @param {boolean} [immediate=false] true=瞬间跳转
     */
    goToStop(index, immediate = false) {
      if (!tour?.stops?.length || index < 0 || index >= tour.stops.length) return;
      controls.enabled = false;
      stopIndex = index;
      const stop = tour.stops[index];
      if (immediate) {
        camera.position.set(stop.position.x, stop.position.y, stop.position.z);
        controls.target.set(stop.target.x, stop.target.y, stop.target.z);
        controls.update();
        emit('stopChange', index, stop);
        return;
      }
      beginTransitionFromCurrent();
      setState('playing');
    },

    /** 下一个漫游点 */
    next() {
      if (!tour?.stops?.length) return;
      api.goToStop(Math.min(stopIndex + 1, tour.stops.length - 1));
    },

    /** 上一个漫游点 */
    prev() {
      if (!tour?.stops?.length) return;
      api.goToStop(Math.max(stopIndex - 1, 0));
    },

    /**
     * 每帧更新（main.js 动画循环已自动调用）
     * @param {number} delta 帧间隔秒数
     */
    update(delta) {
      if (state !== 'playing' && state !== 'dwelling') return;
      if (!tour?.stops?.length) return;
      const stop = tour.stops[stopIndex];
      if (!stop) return;
      phaseElapsed += delta;

      if (phase === 'transition') {
        const duration = Math.max(stop.transitionTime, 0.001);
        const t = easeInOutCubic(Math.min(phaseElapsed / duration, 1));
        lerpVec3(tempPosition, fromPosition, stop.position, t);
        lerpVec3(tempTarget, fromTarget, stop.target, t);
        camera.position.copy(tempPosition);
        controls.target.copy(tempTarget);
        controls.update();
        if (phaseElapsed >= duration) {
          phase = 'dwell';
          phaseElapsed = 0;
          setState('dwelling');
          emit('stopChange', stopIndex, stop);
        }
        return;
      }

      if (phaseElapsed >= stop.dwellTime) {
        advanceToNextStop();
      }
    },

    getState: () => state,
    getCurrentStopIndex: () => stopIndex,
    /** 当前漫游点（含 name、position、target、dwellTime 等） */
    getCurrentStop: () => tour?.stops?.[stopIndex] ?? null,
    getTour: () => tour,
    isActive: () => state === 'playing' || state === 'dwelling' || state === 'paused',

  /** @param {'stopChange'|'complete'|'stateChange'} event */
    on(event, fn) {
      if (listeners[event]) listeners[event].push(fn);
    },

    off(event, fn) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((f) => f !== fn);
    },
  };

  const init = async () => {
    if (options.config) {
      tour = configToTour(options.config);
    } else if (options.configUrl) {
      await api.loadConfig(options.configUrl);
    }
  };

  api.ready = init();
  return api;
}
`;
}
