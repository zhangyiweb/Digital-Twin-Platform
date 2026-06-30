import JSZip from 'jszip';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createModelsExportScene } from '@/utils/sceneUtils';
import { stampModelUserDataForExport, collectTextureUvStates } from '@/utils/exportSceneRestore';
import { generateSceneConfig, type ExportedSceneConfig } from '@/utils/sceneConfigExporter';
import {
  EXPORT_PACKAGE_DEFAULT_CAMERA_POSITION,
  EXPORT_PACKAGE_DEFAULT_CONTROLS_TARGET,
} from '@/config/exportDefaults';
import {
  buildIndexHtml,
  buildStyleCss,
  buildMainJs,
  buildReadme,
} from '@/utils/exportedProjectTemplates';
import { fetchHdriUrl, type HdrDownloadSource, type HdrResolution } from '@/utils/polyhaven';

declare global {
  interface Window {
    __hdrExportSource?: HdrDownloadSource | null;
  }
}

export interface ProjectPackageExportResult {
  filename: string;
  hasModel: boolean;
  hasHdr: boolean;
}

function exportGlbBuffer(scene: THREE.Scene): Promise<ArrayBuffer> {
  const exportScene = createModelsExportScene(scene);
  stampModelUserDataForExport(exportScene);

  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
          return;
        }
        reject(new Error('GLB 导出失败：未生成二进制数据'));
      },
      (error) => reject(error instanceof Error ? error : new Error(String(error))),
      { binary: true, trs: true, onlyVisible: true, embedImages: true }
    );
  });
}

async function resolveHdrAsset(): Promise<{ data: ArrayBuffer; filename: string } | null> {
  const scene = (window as any).__editorScene as THREE.Scene | undefined;
  const globalSettings = ((window as any).__globalSettingsState ?? null) as Record<string, unknown> | null;
  const hasHdr =
    Boolean(scene?.environment) ||
    Boolean(scene?.background && (scene.background as THREE.Texture).isTexture) ||
    Boolean(globalSettings?.hdriReady);

  if (!hasHdr) return null;

  const source = window.__hdrExportSource;
  if (source?.kind === 'file') {
    return {
      data: await source.file.arrayBuffer(),
      filename: source.file.name || 'environment.hdr',
    };
  }

  if (source?.kind === 'polyhaven') {
    const { url } = await fetchHdriUrl(source.id, source.resolution as HdrResolution);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HDR 下载失败: ${response.status}`);
    }
    return {
      data: await response.arrayBuffer(),
      filename: source.filename || `${source.id}_${source.resolution}.hdr`,
    };
  }

  return null;
}

function applyExportPackageCameraDefaults(
  config: ExportedSceneConfig & {
    assets: { model?: string; hdr?: string };
    editor: ExportedSceneConfig['editor'] & { textureUvStates: Record<string, unknown> };
  }
) {
  return {
    ...config,
    camera: {
      fov: config.camera?.fov ?? 45,
      near: config.camera?.near ?? 0.1,
      far: config.camera?.far ?? 5000,
      aspect: config.camera?.aspect ?? 1,
      position: { ...EXPORT_PACKAGE_DEFAULT_CAMERA_POSITION },
    },
    controls: {
      enableDamping: config.controls?.enableDamping ?? true,
      dampingFactor: config.controls?.dampingFactor ?? 0.05,
      enableZoom: config.controls?.enableZoom ?? true,
      enableRotate: config.controls?.enableRotate ?? true,
      enablePan: config.controls?.enablePan ?? true,
      minDistance: config.controls?.minDistance ?? 0,
      maxDistance: config.controls?.maxDistance ?? Infinity,
      minPolarAngle: config.controls?.minPolarAngle ?? 0,
      maxPolarAngle: config.controls?.maxPolarAngle ?? Math.PI,
      target: { ...EXPORT_PACKAGE_DEFAULT_CONTROLS_TARGET },
    },
  };
}

function buildProjectConfig(
  baseConfig: ExportedSceneConfig,
  assets: { model?: string; hdr?: string },
  textureUvStates: Record<string, import('@/utils/exportSceneRestore').ExportedTextureUvState>
): ExportedSceneConfig & {
  assets: { model?: string; hdr?: string };
  editor: ExportedSceneConfig['editor'] & { textureUvStates: typeof textureUvStates };
} {
  return {
    ...baseConfig,
    assets,
    editor: {
      ...baseConfig.editor,
      textureUvStates,
    },
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 导出完整 HTML/CSS/JS 项目包（ZIP） */
export async function exportProjectPackage(): Promise<ProjectPackageExportResult> {
  const scene = (window as any).__editorScene as THREE.Scene | undefined;
  if (!scene) {
    throw new Error('场景尚未初始化，请等待编辑器加载完成后再导出');
  }

  const timestamp = Date.now();
  const folderName = `digital-twin-project-${timestamp}`;
  const zip = new JSZip();
  const root = zip.folder(folderName);
  if (!root) {
    throw new Error('无法创建 ZIP 目录');
  }

  const baseConfig = generateSceneConfig();
  const textureUvStates = collectTextureUvStates(scene);
  const assets: { model?: string; hdr?: string } = {};

  let hasModel = false;
  try {
    const glbBuffer = await exportGlbBuffer(scene);
    if (glbBuffer.byteLength > 0) {
      root.file('assets/models/scene.glb', glbBuffer);
      assets.model = 'assets/models/scene.glb';
      hasModel = true;
    }
  } catch (error) {
    console.warn('模型 GLB 导出失败，项目包将仅包含配置与模板', error);
  }

  let hasHdr = false;
  try {
    const hdrAsset = await resolveHdrAsset();
    if (hdrAsset) {
      const safeName = hdrAsset.filename.replace(/[^\w.\-]+/g, '_');
      const hdrPath = `assets/hdr/${safeName}`;
      root.file(hdrPath, hdrAsset.data);
      assets.hdr = hdrPath;
      hasHdr = true;
    }
  } catch (error) {
    console.warn('HDR 资源导出失败，项目包将不包含 HDR 文件', error);
  }

  const projectConfig = applyExportPackageCameraDefaults(
    buildProjectConfig(baseConfig, assets, textureUvStates)
  );
  const exportTitle = `数字孪生场景 ${new Date(baseConfig.exportTime).toLocaleString('zh-CN')}`;

  root.file('config/scene.json', JSON.stringify(projectConfig, null, 2));
  root.file('index.html', buildIndexHtml(exportTitle));
  root.file('css/style.css', buildStyleCss());
  root.file('js/main.js', buildMainJs());
  root.file('README.md', buildReadme(baseConfig.exportTime));

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${folderName}.zip`;
  downloadBlob(blob, filename);

  return { filename, hasModel, hasHdr };
}
