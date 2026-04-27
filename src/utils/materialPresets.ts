import * as THREE from 'three';

// 材质预设接口
export interface MaterialPreset {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  material: Partial<THREE.MeshStandardMaterial>;
}

// 预设材质库
export const materialPresets: MaterialPreset[] = [
  // 金属类
  {
    id: 'metal_steel',
    name: '钢材',
    category: '金属',
    material: {
      color: new THREE.Color('#71797E'),
      metalness: 0.9,
      roughness: 0.3,
    },
  },
  {
    id: 'metal_aluminum',
    name: '铝材',
    category: '金属',
    material: {
      color: new THREE.Color('#C0C0C0'),
      metalness: 0.95,
      roughness: 0.2,
    },
  },
  {
    id: 'metal_copper',
    name: '铜',
    category: '金属',
    material: {
      color: new THREE.Color('#B87333'),
      metalness: 0.9,
      roughness: 0.4,
    },
  },
  {
    id: 'metal_gold',
    name: '金',
    category: '金属',
    material: {
      color: new THREE.Color('#FFD700'),
      metalness: 1.0,
      roughness: 0.15,
    },
  },

  // 玻璃类
  {
    id: 'glass_clear',
    name: '透明玻璃',
    category: '玻璃',
    material: {
      color: new THREE.Color('#ffffff'),
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.3,
    },
  },
  {
    id: 'glass_frosted',
    name: '磨砂玻璃',
    category: '玻璃',
    material: {
      color: new THREE.Color('#ffffff'),
      metalness: 0.0,
      roughness: 0.8,
      transparent: true,
      opacity: 0.5,
    },
  },

  // 木材类
  {
    id: 'wood_oak',
    name: '橡木',
    category: '木材',
    material: {
      color: new THREE.Color('#C4A484'),
      metalness: 0.0,
      roughness: 0.8,
    },
  },
  {
    id: 'wood_walnut',
    name: '胡桃木',
    category: '木材',
    material: {
      color: new THREE.Color('#5C4033'),
      metalness: 0.0,
      roughness: 0.7,
    },
  },

  // 石材类
  {
    id: 'stone_marble',
    name: '大理石',
    category: '石材',
    material: {
      color: new THREE.Color('#F5F5F5'),
      metalness: 0.1,
      roughness: 0.2,
    },
  },
  {
    id: 'stone_granite',
    name: '花岗岩',
    category: '石材',
    material: {
      color: new THREE.Color('#808080'),
      metalness: 0.0,
      roughness: 0.9,
    },
  },

  // 塑料类
  {
    id: 'plastic_matte',
    name: '哑光塑料',
    category: '塑料',
    material: {
      color: new THREE.Color('#333333'),
      metalness: 0.0,
      roughness: 0.9,
    },
  },
  {
    id: 'plastic_glossy',
    name: '高光塑料',
    category: '塑料',
    material: {
      color: new THREE.Color('#000000'),
      metalness: 0.1,
      roughness: 0.1,
    },
  },

  // 涂料类
  {
    id: 'paint_white',
    name: '白色乳胶漆',
    category: '涂料',
    material: {
      color: new THREE.Color('#FFFFFF'),
      metalness: 0.0,
      roughness: 0.8,
    },
  },
  {
    id: 'paint_black',
    name: '黑色哑光漆',
    category: '涂料',
    material: {
      color: new THREE.Color('#111111'),
      metalness: 0.0,
      roughness: 0.9,
    },
  },
];

// 按分类获取预设
export function getPresetsByCategory(category: string): MaterialPreset[] {
  return materialPresets.filter(p => p.category === category);
}

// 获取所有分类
export function getAllCategories(): string[] {
  return [...new Set(materialPresets.map(p => p.category))];
}

// 应用预设到材质
export function applyPreset(
  material: THREE.MeshStandardMaterial,
  preset: MaterialPreset
): void {
  Object.assign(material, preset.material);
  material.needsUpdate = true;
}
