import { useCallback } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { enableMeshShadows } from '@/config/defaultLighting';
import {
  fetchModelGltfUrl,
  type ModelAsset,
  type ModelResolution,
  DEFAULT_MODEL_RESOLUTION,
} from '@/utils/polyhaven';

function resolvePolyhavenResourceUrl(
  requestedUrl: string,
  gltfBaseUrl: string,
  resources: Record<string, string>
): string {
  if (resources[requestedUrl]) return resources[requestedUrl];

  const basePath = gltfBaseUrl.substring(0, gltfBaseUrl.lastIndexOf('/') + 1);
  if (requestedUrl.startsWith(basePath)) {
    const relative = requestedUrl.slice(basePath.length);
    if (resources[relative]) return resources[relative];
  }

  for (const [relPath, absUrl] of Object.entries(resources)) {
    if (requestedUrl.endsWith(`/${relPath}`) || requestedUrl.endsWith(relPath)) {
      return absUrl;
    }
  }

  return requestedUrl;
}

function createGltfLoader(gltfUrl?: string, resources?: Record<string, string>) {
  const manager = new THREE.LoadingManager();

  if (gltfUrl && resources && Object.keys(resources).length > 0) {
    manager.setURLModifier((url) => resolvePolyhavenResourceUrl(url, gltfUrl, resources));
  }

  const loader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);
  return loader;
}

export function useModelLoader() {
  const { addObject, registerThreeObject } = useSceneStore();

  const registerImportedModel = useCallback((
    model: THREE.Group,
    name: string,
    scene: THREE.Scene
  ): THREE.Group => {
    const modelId = `model_${Date.now()}`;
    model.name = name;
    model.userData.id = modelId;

    enableMeshShadows(model);
    scene.add(model);

    addObject({
      id: modelId,
      name: model.name,
      type: 'mesh',
      visible: true,
      position: [model.position.x, model.position.y, model.position.z],
      rotation: [model.rotation.x, model.rotation.y, model.rotation.z],
      scale: [model.scale.x, model.scale.y, model.scale.z],
    });

    registerThreeObject(modelId, model);
    return model;
  }, [addObject, registerThreeObject]);

  const loadModelFromUrl = useCallback(async (
    url: string,
    name: string,
    scene: THREE.Scene,
    resources?: Record<string, string>
  ): Promise<THREE.Group | null> => {
    const loader = createGltfLoader(url, resources);

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf: { scene: THREE.Group }) => {
          resolve(registerImportedModel(gltf.scene, name, scene));
        },
        undefined,
        (error: unknown) => reject(error)
      );
    });
  }, [registerImportedModel]);

  const loadPolyhavenModel = useCallback(async (
    asset: ModelAsset,
    scene: THREE.Scene,
    resolution: ModelResolution = DEFAULT_MODEL_RESOLUTION
  ): Promise<THREE.Group | null> => {
    const info = await fetchModelGltfUrl(asset.id, resolution);
    return loadModelFromUrl(info.url, asset.name, scene, info.resources);
  }, [loadModelFromUrl]);

  const loadModel = useCallback(async (
    file: File,
    scene: THREE.Scene
  ): Promise<THREE.Group | null> => {
    return new Promise((resolve, reject) => {
      const loader = createGltfLoader();
      const url = URL.createObjectURL(file);

      loader.load(
        url,
        (gltf: { scene: THREE.Group }) => {
          const model = registerImportedModel(
            gltf.scene,
            file.name.replace(/\.[^/.]+$/, ''),
            scene
          );
          URL.revokeObjectURL(url);
          resolve(model);
        },
        undefined,
        (error: unknown) => {
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  }, [registerImportedModel]);

  const handleFileImport = useCallback(async (
    files: FileList | File[],
    scene: THREE.Scene
  ) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    for (const file of fileArray) {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (['glb', 'gltf'].includes(ext || '')) {
        try {
          await loadModel(file, scene);
        } catch (error) {
          console.error('模型导入失败:', error);
        }
      }
    }
  }, [loadModel]);

  return {
    loadModel,
    loadModelFromUrl,
    loadPolyhavenModel,
    handleFileImport,
  };
}
