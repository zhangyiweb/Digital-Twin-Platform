import * as THREE from 'three';
import {
  fetchTextureMapUrls,
  type TextureResolution,
  type PolyhavenTextureMapUrls,
} from '@/utils/polyhaven';

export interface LoadedPolyhavenTextures {
  urls: PolyhavenTextureMapUrls;
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  aoMap?: THREE.Texture;
}

export interface TextureUvApplyParams {
  wrapS: number;
  wrapT: number;
  repeatX: number;
  repeatY: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

function applyUvParams(tex: THREE.Texture, params: TextureUvApplyParams) {
  tex.wrapS = params.wrapS as THREE.Wrapping;
  tex.wrapT = params.wrapT as THREE.Wrapping;
  tex.repeat.set(params.repeatX, params.repeatY);
  tex.offset.set(params.offsetX, params.offsetY);
  tex.rotation = THREE.MathUtils.degToRad(params.rotation);
  tex.needsUpdate = true;
}

async function loadTexture(url: string, colorSpace: THREE.ColorSpace): Promise<THREE.Texture> {
  const tex = await textureLoader.loadAsync(url);
  tex.colorSpace = colorSpace;
  return tex;
}

/** 从 Poly Haven 加载 PBR 贴图集并应用 UV 参数 */
export async function loadPolyhavenTextureSet(
  id: string,
  resolution: TextureResolution,
  uvParams: TextureUvApplyParams
): Promise<LoadedPolyhavenTextures> {
  const urls = await fetchTextureMapUrls(id, resolution);

  const [map, normalMap, roughnessMap, aoMap] = await Promise.all([
    urls.map ? loadTexture(urls.map, THREE.SRGBColorSpace) : Promise.resolve(undefined),
    urls.normalMap ? loadTexture(urls.normalMap, THREE.LinearSRGBColorSpace) : Promise.resolve(undefined),
    urls.roughnessMap ? loadTexture(urls.roughnessMap, THREE.LinearSRGBColorSpace) : Promise.resolve(undefined),
    urls.aoMap ? loadTexture(urls.aoMap, THREE.LinearSRGBColorSpace) : Promise.resolve(undefined),
  ]);

  [map, normalMap, roughnessMap, aoMap].forEach((tex) => {
    if (tex) applyUvParams(tex, uvParams);
  });

  return { urls, map, normalMap, roughnessMap, aoMap };
}
