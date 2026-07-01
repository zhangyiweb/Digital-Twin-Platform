import * as THREE from 'three';

/** 绕 Y 轴旋转 HDR 背景与环境贴图（水平旋转，单位：度） */
export function applyHdrRotationY(scene: THREE.Scene, degreesY: number) {
  const rad = THREE.MathUtils.degToRad(degreesY);
  scene.environmentRotation.set(0, rad, 0);
  scene.backgroundRotation.set(0, rad, 0);
}
