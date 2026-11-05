# Graph Report - 智能体平台  (2026-11-05)

## Corpus Check
- 124 files · ~157,983 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1126 nodes · 2762 edges · 58 communities (54 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `960c464d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Three.js Vector Math
- projectPackageExporter.ts
- Resource Lifecycle
- Object3D Transforms
- Resource Lifecycle (2)
- cameraTourPlayer.ts
- Object3D Transforms (2)
- Three.js Vector Math (3)
- Three.js Vector Math (4)
- uiEditor.ts
- uiEditorProjectImporter.ts
- uiCssParser.ts
- exportParticleAssets.ts
- UI Editor Store / UI Editor Core
- cameraTourJson.ts
- History / Undo Redo / Scene Utils
- Scene API / UI Interaction Bindings
- gen_soft_copyright_docx.py
- Quarks Particle Adapter / Particle Scene Runt
- ECharts Presets
- Scene Label
- Scene Capture
- Editor / Use Model
- Editor Project
- Tsconfig
- Tsconfig.App
- Tsconfig.Node
- Polyhaven
- Camera Tour / Camera Tour Panel
- Camera Tour
- Package
- Package (2)
- Panel Form
- Export Panel
- Post Process
- Polyhaven / Model
- Uiexport Modal / Use Editor
- Social Icon Sprite
- Polyhaven / Environment Hdri
- Load Polyhaven / Polyhaven
- Agent Scene Control Protocol
- Post Process (2)
- Index / Chinese README
- Chinese README
- Agent Scene Control Protocol (2)
- Package (3)
- English README
- Hero Brand Graphic
- Unimplemented Features Plan
- Unimplemented Features Plan (2)
- App Favicon / Vite Logo Asset
- Package (4)
- Package (7)
- React Logo Asset

## God Nodes (most connected - your core abstractions)
1. `exportProjectPackage()` - 38 edges
2. `useSceneStore` - 33 edges
3. `EditorViewport()` - 29 edges
4. `CameraTourPlayer` - 29 edges
5. `useUIEditorStore` - 26 edges
6. `UIElement` - 24 edges
7. `useLightStore` - 20 edges
8. `restoreProjectConfig()` - 20 edges
9. `CameraTour` - 18 edges
10. `recordCameraTour()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Digital Twin Platform` --semantically_similar_to--> `数字孪生平台`  [INFERRED] [semantically similar]
  README.en.md → README.md
- `数字孪生平台 (docs build)` --semantically_similar_to--> `数字孪生平台`  [INFERRED] [semantically similar]
  docs/index.html → README.md
- `Project Package Export (ZIP)` --shares_data_with--> `数字孪生平台`  [INFERRED]
  README.en.md → README.md
- `已完成能力基线` --conceptually_related_to--> `数字孪生平台`  [INFERRED]
  文档/未实现功能规划.md → README.md
- `Vite dev entry (src/main.tsx)` --semantically_similar_to--> `数字孪生平台 (docs build)`  [INFERRED] [semantically similar]
  index.html → docs/index.html

## Import Cycles
- 3-file cycle: `src/runtime/sceneApi.ts -> src/store/sceneStore.ts -> src/utils/sceneLabel.ts -> src/runtime/sceneApi.ts`
- 4-file cycle: `src/components/Panels/CameraTourPanel.tsx -> src/store/sceneStore.ts -> src/utils/sceneLabel.ts -> src/runtime/sceneApi.ts -> src/components/Panels/CameraTourPanel.tsx`

## Hyperedges (group relationships)
- **Docs Site Social Link Icons** — docs_icons_bluesky_icon, docs_icons_discord_icon, docs_icons_github_icon, docs_icons_x_icon, docs_icons_social_icon [INFERRED 0.85]

## Communities (58 total, 4 thin omitted)

### Community 0 - "Three.js Vector Math"
Cohesion: 0.26
Nodes (9): LightPanel(), DEFAULT_LIGHTS, initialState, LightStore, TODO: 集成到历史记录系统, LightAction, LightConfig, LightState (+1 more)

### Community 1 - "projectPackageExporter.ts"
Cohesion: 0.05
Nodes (80): applyInlineAssets(), SceneUIPreviewOverlay(), stripDataUrlBackgrounds(), EXPORT_PACKAGE_DEFAULT_CAMERA_POSITION, EXPORT_PACKAGE_DEFAULT_CONTROLS_TARGET, clearPreviewUIVisibility(), dispatchUIActions(), createDefaultDataSourceConfig() (+72 more)

### Community 2 - "Resource Lifecycle"
Cohesion: 0.33
Nodes (8): GizmoToolbar(), tools, EditorStore, initialState, useEditorStore, EditorMode, EditorState, EditorTool

### Community 3 - "Object3D Transforms"
Cohesion: 0.23
Nodes (13): initialState, SceneStore, CameraConfig, SceneObject, SceneState, clearEditorScene(), isProtectedSceneChild(), disposeLabelAnchor() (+5 more)

### Community 4 - "Resource Lifecycle (2)"
Cohesion: 0.05
Nodes (40): 1.1 解决什么问题, 1.2 满足什么需求, 1.3 核心能力概览, 1.4 推荐工作流, 2.1 布局与对应操作, 2.2 三种编辑模式（点击哪里）, 3.1 导入模型, 3.2 组件库 (+32 more)

### Community 5 - "cameraTourPlayer.ts"
Cohesion: 0.26
Nodes (11): TextureAnimationSection(), TextureAnimationSectionProps, AnimationStore, useAnimationStore, DEFAULT_TEXTURE_UV_ANIMATION, TextureAnimationTarget, TextureUvAnimationConfig, forEachAnimatedTexture() (+3 more)

### Community 6 - "Object3D Transforms (2)"
Cohesion: 0.23
Nodes (10): applyEditorCameraState(), CameraTourPlayerState, flyTempPosition, flyTempTarget, syncEditorCameraGlobals(), buildTourSplines(), exportSplineCurvePoints(), sampleTourSpline() (+2 more)

### Community 7 - "Three.js Vector Math (3)"
Cohesion: 0.33
Nodes (8): GlobalSettings(), applyHdrRotationY(), downloadFileFromUrl(), downloadHdrFromSource(), fetchHdriUrl(), HdrDownloadSource, triggerBlobDownload(), Window

### Community 9 - "uiEditor.ts"
Cohesion: 0.35
Nodes (9): sampleSplinePath(), createLabelSprite(), disposeObject3D(), isSceneCaptureVisualsLocked(), markTourVisual(), removeTourPathVisual(), stripTourPathVisualForRender(), syncTourPathVisual() (+1 more)

### Community 10 - "uiEditorProjectImporter.ts"
Cohesion: 0.29
Nodes (6): ActionType, HistoryActions, HistoryEntry, HistoryState, initialState, TransformSnapshot

### Community 12 - "exportParticleAssets.ts"
Cohesion: 0.31
Nodes (8): ImportPanel(), ImportPanelProps, Toolbar(), createGltfLoader(), resolvePolyhavenResourceUrl(), useModelLoader(), buildModelResourceMap(), fetchModelGltfUrl()

### Community 14 - "UI Editor Store / UI Editor Core"
Cohesion: 0.05
Nodes (79): BASIC_COMPONENTS, ComponentPalette(), CssImportModal(), CssImportModalProps, UIEditor(), LayerNode(), LayerNodeProps, LayerTree() (+71 more)

### Community 19 - "cameraTourJson.ts"
Cohesion: 0.22
Nodes (12): normalizeCameraTour(), Vec3, buildCameraTourJson(), buildCameraTourJsonPreview(), CameraTourIndexEntry, CameraTourIndexJson, downloadCameraTourJson(), ExportedCameraTourJson (+4 more)

### Community 21 - "History / Undo Redo / Scene Utils"
Cohesion: 0.26
Nodes (12): App(), PropertyPanel(), isHelperObject(), SceneTree(), TreeNode, applyTransformSnapshot(), useKeyboardShortcuts(), useHistoryStore (+4 more)

### Community 22 - "Scene API / UI Interaction Bindings"
Cohesion: 0.10
Nodes (35): ACTION_TONE, selectProps, UIInteractionPanel(), UIInteractionPanelProps, animateCameraTo(), applySelectionHighlight(), clearSelectionHighlight(), createEditorSceneApi() (+27 more)

### Community 23 - "gen_soft_copyright_docx.py"
Cohesion: 0.42
Nodes (9): Path, add_code_line(), add_page_number(), build_all_lines(), collect_files(), main(), read_lines(), set_header_footer() (+1 more)

### Community 24 - "Quarks Particle Adapter / Particle Scene Runt"
Cohesion: 0.05
Nodes (76): ComponentLibrary(), ParticleEditor(), ParticleEditorProps, createPrimitiveObject(), DEFAULT_PRIMITIVE_MATERIAL, FLAT_DEFAULTS, MESH_DEFAULTS, PRIMITIVE_PRESETS (+68 more)

### Community 27 - "ECharts Presets"
Cohesion: 0.11
Nodes (31): EchartPropertyPanels(), EchartPropertyPanelsProps, SELECT_POPUP_CLASSNAMES, selectProps, SYMBOL_OPTIONS, EchartRenderer(), EchartRendererProps, PropertyGroup() (+23 more)

### Community 32 - "Scene Label"
Cohesion: 0.19
Nodes (23): colorToCss(), LabelEditor(), LabelEditorProps, LightConfig, createDefaultLabelConfig(), resolveLabelScale(), SCENE_LABEL_MODE_OPTIONS, SceneLabelConfig (+15 more)

### Community 34 - "Scene Capture"
Cohesion: 0.14
Nodes (29): getSplineDuration(), lockSceneCaptureVisuals(), resetSceneCaptureVisualsLock(), getEditorPostProcessConfig(), PostProcessPipeline, calcVideoBitrate(), canvasToBlob(), CaptureRenderContext (+21 more)

### Community 46 - "Editor / Use Model"
Cohesion: 0.23
Nodes (16): tickEditorCameraTour(), addLightTargetToScene(), applyLightTargetFromConfig(), createLightHelper(), disposeLightHelper(), EditorViewport(), ensureLightPickProxy(), getLightTransformAttachObject() (+8 more)

### Community 47 - "Editor Project"
Cohesion: 0.07
Nodes (56): jszip, jszip, enableMeshShadows(), applyHdrEnvironment(), applyRendererAndSceneSettings(), attachLoadedModelToScene(), createGltfLoader(), dispatchProjectRestoredEvent() (+48 more)

### Community 52 - "Tsconfig"
Cohesion: 0.09
Nodes (22): DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module (+14 more)

### Community 53 - "Tsconfig.App"
Cohesion: 0.09
Nodes (22): vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+14 more)

### Community 58 - "Tsconfig.Node"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 61 - "Polyhaven"
Cohesion: 0.27
Nodes (11): TexturePicker(), TexturePickerProps, TexturePickerModalProps, fetchAllTextures(), fetchTextureCategories(), getTextureCategoryLabel(), getTexturePreviewUrl(), TEXTURE_RESOLUTIONS (+3 more)

### Community 62 - "Camera Tour / Camera Tour Panel"
Cohesion: 0.19
Nodes (19): bindEditorTourPlayer(), CameraTourPanel(), formatVec3(), StopCard(), StopCardProps, ensureTourPlayer(), createDefaultStopFields(), TourStore (+11 more)

### Community 65 - "Camera Tour"
Cohesion: 0.19
Nodes (5): CameraTourPlayer, CameraTourPlayerOptions, easeInOutCubic(), lerpVec3(), tickEditorCameraFly()

### Community 67 - "Package"
Cohesion: 0.12
Nodes (17): antd, echarts, mp4-muxer, dependencies, antd, echarts, mp4-muxer, react (+9 more)

### Community 68 - "Package (2)"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/three, typescript (+9 more)

### Community 71 - "Panel Form"
Cohesion: 0.16
Nodes (14): PanelButton(), PanelColorField(), PanelColorFieldProps, PanelFileButton(), PanelFileButtonProps, PanelInputNumber(), PanelSelect(), panelSelectClassNames (+6 more)

### Community 72 - "Export Panel"
Cohesion: 0.12
Nodes (21): clampRecordSize(), exportFormTheme, ExportPanel(), ExportPanelProps, exportSelectClassNames, matchRecordResolutionPreset(), RECORD_RESOLUTION_PRESETS, RecordFormat (+13 more)

### Community 75 - "Post Process"
Cohesion: 0.27
Nodes (12): EffectHint(), loadSavedPostProcess(), PostProcessSettings(), buildPostProcessConfig(), DEFAULT_POST_PROCESS_PARAMS, mergePostProcessParams(), POST_PROCESS_EFFECT_GROUPS, POST_PROCESS_PRESETS (+4 more)

### Community 78 - "Polyhaven / Model"
Cohesion: 0.24
Nodes (12): ModelPicker(), ModelPickerProps, ModelPickerModal(), ModelPickerModalProps, fetchAllModels(), fetchModelCategories(), getModelCategoryLabel(), getModelPreviewUrl() (+4 more)

### Community 83 - "Uiexport Modal / Use Editor"
Cohesion: 0.08
Nodes (46): buildSaveReadme(), cloneElementsForExport(), downloadBlob(), saveUIEditorProject(), UIEditorSaveResult, getElementExportClasses(), buildElementStyle(), buildInputInnerStyle() (+38 more)

### Community 84 - "Social Icon Sprite"
Cohesion: 0.14
Nodes (14): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Docs Icon Sprite Sheet, Social/Profile Icon, X/Twitter Icon, Bluesky Icon (+6 more)

### Community 88 - "Polyhaven / Environment Hdri"
Cohesion: 0.14
Nodes (21): EnvironmentHdriSection(), EnvironmentHdriSectionProps, HdriPicker(), HdriPickerProps, fetchAllHdris(), fetchHdriCategories(), getHdriCategoryLabel(), getHdriPreviewUrl() (+13 more)

### Community 95 - "Load Polyhaven / Polyhaven"
Cohesion: 0.26
Nodes (11): MaterialEditor(), tagPolyhavenTexture(), applyUvParams(), LoadedPolyhavenTextures, loadPolyhavenTextureSet(), loadTexture(), textureLoader, TextureUvApplyParams (+3 more)

### Community 101 - "Agent Scene Control Protocol"
Cohesion: 0.22
Nodes (10): 后期处理, agent.registry, deviceType, playCameraTour, SceneAction, setMaterialState, setPostProcess, setTrajectory (+2 more)

### Community 102 - "Post Process (2)"
Cohesion: 0.27
Nodes (8): chromaticAberrationShader, collectOutlineTargets(), createEffectPass(), createPostProcessPipeline(), pixelationShader, PostProcessRuntimeConfig, updatePostProcessPass(), vignetteShader

### Community 108 - "Index / Chinese README"
Cohesion: 0.22
Nodes (7): 数字孪生平台 (docs build), Vite dev entry (src/main.tsx), Ant Design 5, Three.js, 技术栈, Vite 5, Zustand

### Community 114 - "Chinese README"
Cohesion: 0.25
Nodes (7): 数字孪生平台, 灯光系统, 材质系统, 项目结构 src/, 场景管理, UV 编辑, playTextureAnimation

### Community 115 - "Agent Scene Control Protocol (2)"
Cohesion: 0.32
Nodes (7): agent.expression, objectId ↔ scene.json binding, scene.batch, SceneCommand, scene.expression, SceneTarget, SCP/1.3

### Community 118 - "Package (3)"
Cohesion: 0.29
Nodes (7): scripts, build, build:pages, dev, lint, preview, preview:pages

### Community 119 - "English README"
Cohesion: 0.29
Nodes (6): Digital Twin Platform, MIT License, Poly Haven, Project Package Export (ZIP), React, TypeScript

### Community 120 - "Hero Brand Graphic"
Cohesion: 0.48
Nodes (6): Dashed vertical corner connectors, Dark-mode hero concept graphic, Isometric stacked rounded-square layers, Layered abstraction / depth hierarchy, Solid base slab with purple-glow edges, Transparent wireframe top layer

### Community 121 - "Unimplemented Features Plan"
Cohesion: 0.33
Nodes (6): deviceState, 已完成能力基线, 已评估暂缓项, 场景标注与信息面板, 去除全局 window 依赖, 推荐实施路线图

### Community 122 - "Unimplemented Features Plan (2)"
Cohesion: 0.33
Nodes (7): 协议接入层缺口, 自动保存与未保存提示, 复制/粘贴/克隆, 数据绑定引擎, 优先级 P0–P3, 实时数据接入, 撤销/重做完善

### Community 124 - "App Favicon / Vite Logo Asset"
Cohesion: 0.33
Nodes (6): Vite Brand Mark, Vite Logo Favicon, App Favicon, Public Vite Favicon, Vite Brand, Vite Logo Wordmark

### Community 132 - "Package (4)"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Ambiguous Edges - Review These
- `协议接入层缺口` → `数据绑定引擎`  [AMBIGUOUS]
  文档/未实现功能规划.md · relation: conceptually_related_to

## Knowledge Gaps
- **259 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `协议接入层缺口` and `数据绑定引擎`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `jszip` connect `Editor Project` to `Uiexport Modal / Use Editor`, `projectPackageExporter.ts`, `Scene Capture`, `Package`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package` to `uiCssParser.ts`, `Package (4)`, `Editor Project`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `useSceneStore` connect `History / Undo Redo / Scene Utils` to `Scene Label`, `projectPackageExporter.ts`, `Object3D Transforms`, `Three.js Vector Math (3)`, `Export Panel`, `exportParticleAssets.ts`, `Editor / Use Model`, `Editor Project`, `Scene API / UI Interaction Bindings`, `Quarks Particle Adapter / Particle Scene Runt`, `Camera Tour / Camera Tour Panel`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projectPackageExporter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05352743561030235 - nodes in this community are weakly interconnected._
- **Should `Resource Lifecycle (2)` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._