const API_BASE = 'https://api.polyhaven.com';

/** 可选 HDR 分辨率 */
export const HDR_RESOLUTIONS = ['1k', '2k', '4k', '8k', '16k'] as const;
export type HdrResolution = (typeof HDR_RESOLUTIONS)[number];

/** 默认预览分辨率 */
export const DEFAULT_RESOLUTION: HdrResolution = '2k';

/** 列表缩略图尺寸（CDN 动态裁剪，约 50~90KB） */
export const THUMB_WIDTH = 320;
export const THUMB_HEIGHT = 160;

export interface HdriAsset {
  id: string;
  name: string;
  categories: string[];
  tags: string[];
  thumbnail_url: string;
  fallback_thumbnail?: string;
}

export interface HdriCategory {
  name: string;
  count: number;
  label: string;
}

/** Poly Haven HDRI 分类中文名 */
const HDRI_CATEGORY_LABELS: Record<string, string> = {
  'natural light': '自然光',
  outdoor: '户外',
  nature: '自然',
  urban: '城市',
  'low contrast': '低对比度',
  'high contrast': '高对比度',
  'morning-afternoon': '上午/下午',
  'partly cloudy': '局部多云',
  indoor: '室内',
  skies: '天空',
  'medium contrast': '中对比度',
  clear: '晴朗',
  'artificial light': '人造光',
  'sunrise-sunset': '日出/日落',
  midday: '正午',
  overcast: '阴天',
  studio: '影棚',
  'pure skies': '纯净天空',
  night: '夜晚',
};

/** 将 Poly Haven 分类名转为中文显示 */
export function getHdriCategoryLabel(name: string): string {
  if (name.startsWith('collection: ')) {
    return `合集: ${name.slice('collection: '.length)}`;
  }
  return HDRI_CATEGORY_LABELS[name] ?? name;
}

/** 当前 HDR 的下载来源 */
export type HdrDownloadSource =
  | { kind: 'polyhaven'; id: string; resolution: string; filename: string }
  | { kind: 'url'; url: string; filename: string }
  | { kind: 'file'; file: File };

function triggerBlobDownload(blob: Blob, filename: string) {
  const a = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

/** 从 URL 下载文件到本地 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 (${res.status})`);
  const blob = await res.blob();
  triggerBlobDownload(blob, filename);
}

/** 根据来源下载当前 HDR 文件 */
export async function downloadHdrFromSource(source: HdrDownloadSource): Promise<void> {
  if (source.kind === 'file') {
    triggerBlobDownload(source.file, source.file.name);
    return;
  }

  if (source.kind === 'url') {
    await downloadFileFromUrl(source.url, source.filename);
    return;
  }

  const { url } = await fetchHdriUrl(source.id, source.resolution as HdrResolution);
  await downloadFileFromUrl(url, source.filename);
}

/** 侧边栏 HDRI 缩略图 */
export function getHdriPreviewUrl(id: string): string {
  return `https://cdn.polyhaven.com/asset_img/thumbs/${encodeURIComponent(id)}.png?width=${THUMB_WIDTH}&height=${THUMB_HEIGHT}`;
}

/** 获取全部 HDRI 资产列表 */
export async function fetchAllHdris(): Promise<HdriAsset[]> {
  const res = await fetch(`${API_BASE}/assets?t=hdris`);
  if (!res.ok) throw new Error(`获取 HDRI 列表失败: ${res.status}`);
  const data = await res.json() as Record<string, {
    name: string;
    categories?: string[];
    tags?: string[];
    thumbnail_url?: string;
  }>;
  return Object.entries(data).map(([id, meta]) => ({
    id,
    name: meta.name,
    categories: meta.categories ?? [],
    tags: meta.tags ?? [],
    thumbnail_url: getHdriPreviewUrl(id),
    fallback_thumbnail: meta.thumbnail_url,
  }));
}

/** 获取 HDRI 分类及数量 */
export async function fetchHdriCategories(): Promise<HdriCategory[]> {
  const res = await fetch(`${API_BASE}/categories/hdris`);
  if (!res.ok) throw new Error(`获取分类失败: ${res.status}`);
  const data = await res.json() as Record<string, number>;
  return Object.entries(data)
    .filter(([key]) => key !== 'all')
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, label: getHdriCategoryLabel(name) }));
}

/** 从 files 接口解析指定分辨率的 .hdr 下载 URL */
export async function fetchHdriUrl(
  id: string,
  resolution: HdrResolution = DEFAULT_RESOLUTION
): Promise<{ url: string; resolution: string }> {
  const res = await fetch(`${API_BASE}/files/${id}`);
  if (!res.ok) throw new Error(`获取文件信息失败: ${res.status}`);
  const files = await res.json() as {
    hdri?: Record<string, { hdr?: { url: string } }>;
  };

  const hdri = files.hdri;
  if (!hdri) throw new Error('该资产没有 HDRI 文件');

  const order: HdrResolution[] = ['16k', '8k', '4k', '2k', '1k'];
  const targetIdx = order.indexOf(resolution);
  const candidates = order.slice(targetIdx >= 0 ? targetIdx : order.indexOf('2k'));

  for (const resKey of candidates) {
    if (hdri[resKey]?.hdr?.url) {
      return { url: hdri[resKey].hdr!.url, resolution: resKey };
    }
  }

  for (const resKey of order) {
    if (hdri[resKey]?.hdr?.url) {
      return { url: hdri[resKey].hdr!.url, resolution: resKey };
    }
  }

  throw new Error('未找到可用的 HDR 文件');
}

/** 可选 PBR 贴图分辨率 */
export const TEXTURE_RESOLUTIONS = ['1k', '2k', '4k', '8k'] as const;
export type TextureResolution = (typeof TEXTURE_RESOLUTIONS)[number];
export const DEFAULT_TEXTURE_RESOLUTION: TextureResolution = '1k';

export interface TextureAsset {
  id: string;
  name: string;
  categories: string[];
  tags: string[];
  thumbnail_url: string;
  fallback_thumbnail?: string;
}

export interface TextureCategory {
  name: string;
  count: number;
  label: string;
}

export interface PolyhavenTextureMapUrls {
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  aoMap?: string;
  resolution: string;
}

const TEXTURE_CATEGORY_LABELS: Record<string, string> = {
  aerial: '航拍',
  asphalt: '沥青',
  bark: '树皮',
  brick: '砖石',
  carpet: '地毯',
  clean: '干净',
  cobblestone: '鹅卵石',
  concrete: '混凝土',
  corduroy: '灯芯绒',
  cotton: '棉布',
  crepe: '绉纱',
  denim: '牛仔布',
  dirty: '脏旧',
  fabric: '织物',
  fleece: '抓绒',
  floor: '地面',
  food: '食物',
  fur: '毛皮',
  gravel: '碎石',
  hessian: '粗麻布',
  indoor: '室内',
  industrial: '工业',
  jacquard: '提花',
  knitted: '针织',
  leather: '皮革',
  'man made': '人造',
  metal: '金属',
  natural: '自然',
  outdoor: '户外',
  plaster: '石膏',
  'plaster-concrete': '石膏混凝土',
  'raw wood': '原木',
  road: '道路',
  rock: '岩石',
  roofing: '屋顶',
  sand: '沙子',
  sandstone: '砂岩',
  satin: '缎面',
  snow: '雪',
  stretchy: '弹性织物',
  suede: '绒面革',
  terrain: '地形',
  tiles: '瓷砖',
  velvet: '天鹅绒',
  wall: '墙面',
  wood: '木材',
  wool: '羊毛',
  woven: '编织',
  collection: '合集',
};

const TEXTURE_COLLECTION_LABELS: Record<string, string> = {
  moon: '月球',
  namaqualand: '纳马夸兰',
  pine_forest: '松树林',
  smugglers_cove: '走私者湾',
  the_shed: '小屋',
  verdant_trail: '翠绿小径',
};

export function getTextureCategoryLabel(name: string): string {
  if (name.startsWith('collection: ')) {
    const slug = name.slice('collection: '.length);
    const sub = TEXTURE_COLLECTION_LABELS[slug] ?? slug.replace(/_/g, ' ');
    return `合集: ${sub}`;
  }
  return TEXTURE_CATEGORY_LABELS[name] ?? name;
}

export function getTexturePreviewUrl(id: string, width = THUMB_WIDTH, height = THUMB_WIDTH): string {
  return `https://cdn.polyhaven.com/asset_img/thumbs/${encodeURIComponent(id)}.png?width=${width}&height=${height}`;
}

export async function fetchAllTextures(): Promise<TextureAsset[]> {
  const res = await fetch(`${API_BASE}/assets?t=textures`);
  if (!res.ok) throw new Error(`获取贴图列表失败: ${res.status}`);
  const data = await res.json() as Record<string, {
    name: string;
    categories?: string[];
    tags?: string[];
    thumbnail_url?: string;
  }>;
  return Object.entries(data).map(([id, meta]) => ({
    id,
    name: meta.name,
    categories: meta.categories ?? [],
    tags: meta.tags ?? [],
    thumbnail_url: getTexturePreviewUrl(id),
    fallback_thumbnail: meta.thumbnail_url,
  }));
}

export async function fetchTextureCategories(): Promise<TextureCategory[]> {
  const res = await fetch(`${API_BASE}/categories/textures`);
  if (!res.ok) throw new Error(`获取贴图分类失败: ${res.status}`);
  const data = await res.json() as Record<string, number>;
  return Object.entries(data)
    .filter(([key]) => key !== 'all')
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, label: getTextureCategoryLabel(name) }));
}

type TextureFileEntry = Record<string, Record<string, { url: string }>>;

function pickTextureJpgUrl(
  files: Record<string, TextureFileEntry>,
  mapType: string,
  resolution: TextureResolution
): string | undefined {
  const entry = files[mapType];
  if (!entry) return undefined;

  const order: TextureResolution[] = ['8k', '4k', '2k', '1k'];
  const targetIdx = order.indexOf(resolution);
  const candidates = order.slice(targetIdx >= 0 ? targetIdx : order.indexOf('2k'));

  for (const resKey of candidates) {
    const url = entry[resKey]?.jpg?.url;
    if (url) return url;
  }

  for (const resKey of order) {
    const url = entry[resKey]?.jpg?.url;
    if (url) return url;
  }

  return undefined;
}

/** 解析 PBR 贴图各通道 JPG 下载地址（Three.js 直接使用） */
export async function fetchTextureMapUrls(
  id: string,
  resolution: TextureResolution = DEFAULT_TEXTURE_RESOLUTION
): Promise<PolyhavenTextureMapUrls> {
  const res = await fetch(`${API_BASE}/files/${id}`);
  if (!res.ok) throw new Error(`获取贴图文件信息失败: ${res.status}`);
  const files = await res.json() as Record<string, TextureFileEntry>;

  const order: TextureResolution[] = ['8k', '4k', '2k', '1k'];
  const targetIdx = order.indexOf(resolution);
  const candidates = order.slice(targetIdx >= 0 ? targetIdx : order.indexOf('2k'));

  let usedResolution = resolution;
  for (const resKey of candidates) {
    if (files.Diffuse?.[resKey]?.jpg?.url) {
      usedResolution = resKey;
      break;
    }
  }

  return {
    map: pickTextureJpgUrl(files, 'Diffuse', usedResolution),
    normalMap: pickTextureJpgUrl(files, 'nor_gl', usedResolution),
    roughnessMap: pickTextureJpgUrl(files, 'Rough', usedResolution),
    aoMap: pickTextureJpgUrl(files, 'AO', usedResolution),
    resolution: usedResolution,
  };
}

/** 可选模型贴图分辨率（Poly Haven 模型 gltf 内嵌贴图） */
export const MODEL_RESOLUTIONS = ['1k', '2k', '4k', '8k'] as const;
export type ModelResolution = (typeof MODEL_RESOLUTIONS)[number];
export const DEFAULT_MODEL_RESOLUTION: ModelResolution = '1k';

export interface ModelAsset {
  id: string;
  name: string;
  categories: string[];
  tags: string[];
  thumbnail_url: string;
  fallback_thumbnail?: string;
}

export interface ModelCategory {
  name: string;
  count: number;
  label: string;
}

const MODEL_CATEGORY_LABELS: Record<string, string> = {
  appliances: '家电',
  bed: '床具',
  books: '书籍',
  buildings: '建筑',
  containers: '容器',
  creature: '生物',
  decorative: '装饰',
  dishes: '餐具',
  electronics: '电子',
  firearms: '枪械',
  flowers: '花卉',
  food: '食物',
  furniture: '家具',
  grass: '草',
  'ground cover': '地表植被',
  industrial: '工业',
  instrument: '乐器',
  lighting: '灯具',
  nature: '自然',
  office: '办公',
  plants: '植物',
  'potted plants': '盆栽',
  props: '道具',
  rigged: '绑定骨骼',
  rocks: '岩石',
  seating: '座椅',
  shelves: '架子',
  ships: '船舶',
  structures: '结构',
  succulent: '多肉',
  table: '桌子',
  tools: '工具',
  trees: '树木',
  vases: '花瓶',
  'wall decoration': '墙面装饰',
  weapons: '武器',
};

const MODEL_COLLECTION_LABELS: Record<string, string> = {
  hidden_alley: '隐秘小巷',
  moon: '月球',
  namaqualand: '纳马夸兰',
  pine_forest: '松树林',
  project_lighthouse: '灯塔计划',
  smugglers_cove: '走私者湾',
  the_shed: '小屋',
  verdant_trail: '翠绿小径',
};

export function getModelCategoryLabel(name: string): string {
  if (name.startsWith('collection: ')) {
    const slug = name.slice('collection: '.length);
    const sub = MODEL_COLLECTION_LABELS[slug] ?? slug.replace(/_/g, ' ');
    return `合集: ${sub}`;
  }
  return MODEL_CATEGORY_LABELS[name] ?? name;
}

export function getModelPreviewUrl(id: string, width = THUMB_WIDTH, height = THUMB_WIDTH): string {
  return `https://cdn.polyhaven.com/asset_img/thumbs/${encodeURIComponent(id)}.png?width=${width}&height=${height}`;
}

export async function fetchAllModels(): Promise<ModelAsset[]> {
  const res = await fetch(`${API_BASE}/assets?t=models`);
  if (!res.ok) throw new Error(`获取模型列表失败: ${res.status}`);
  const data = await res.json() as Record<string, {
    name: string;
    categories?: string[];
    tags?: string[];
    thumbnail_url?: string;
  }>;
  return Object.entries(data).map(([id, meta]) => ({
    id,
    name: meta.name,
    categories: meta.categories ?? [],
    tags: meta.tags ?? [],
    thumbnail_url: getModelPreviewUrl(id),
    fallback_thumbnail: meta.thumbnail_url,
  }));
}

export async function fetchModelCategories(): Promise<ModelCategory[]> {
  const res = await fetch(`${API_BASE}/categories/models`);
  if (!res.ok) throw new Error(`获取模型分类失败: ${res.status}`);
  const data = await res.json() as Record<string, number>;
  return Object.entries(data)
    .filter(([key]) => key !== 'all')
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, label: getModelCategoryLabel(name) }));
}

type ModelGltfAsset = {
  url: string;
  include?: Record<string, { url: string }>;
};

type ModelResolutionEntry = {
  gltf?: ModelGltfAsset;
  glb?: ModelGltfAsset;
};

export interface PolyhavenModelLoadInfo {
  url: string;
  resolution: string;
  format: 'gltf' | 'glb';
  /** GLTF 内相对路径 → 实际 CDN 地址（贴图、bin 等） */
  resources: Record<string, string>;
}

function buildModelResourceMap(include?: Record<string, { url: string }>): Record<string, string> {
  if (!include) return {};
  const map: Record<string, string> = {};
  Object.entries(include).forEach(([relPath, info]) => {
    map[relPath] = info.url;
    const baseName = relPath.split('/').pop();
    if (baseName) map[baseName] = info.url;
  });
  return map;
}

/** 解析模型 GLTF/GLB 下载地址及依赖资源映射 */
export async function fetchModelGltfUrl(
  id: string,
  resolution: ModelResolution = DEFAULT_MODEL_RESOLUTION
): Promise<PolyhavenModelLoadInfo> {
  const res = await fetch(`${API_BASE}/files/${id}`);
  if (!res.ok) throw new Error(`获取模型文件信息失败: ${res.status}`);
  const files = await res.json() as { gltf?: Record<string, ModelResolutionEntry> };

  const gltf = files.gltf;
  if (!gltf) throw new Error('该资产没有 GLTF 模型文件');

  const order: ModelResolution[] = ['8k', '4k', '2k', '1k'];
  const targetIdx = order.indexOf(resolution);
  const candidates = order.slice(targetIdx >= 0 ? targetIdx : order.indexOf('1k'));

  const pick = (resKey: string): PolyhavenModelLoadInfo | null => {
    const entry = gltf[resKey];
    if (!entry) return null;
    if (entry.glb?.url) {
      return {
        url: entry.glb.url,
        resolution: resKey,
        format: 'glb',
        resources: buildModelResourceMap(entry.glb.include),
      };
    }
    if (entry.gltf?.url) {
      return {
        url: entry.gltf.url,
        resolution: resKey,
        format: 'gltf',
        resources: buildModelResourceMap(entry.gltf.include),
      };
    }
    return null;
  };

  for (const resKey of candidates) {
    const info = pick(resKey);
    if (info) return info;
  }

  for (const resKey of order) {
    const info = pick(resKey);
    if (info) return info;
  }

  throw new Error('未找到可用的模型文件');
}
