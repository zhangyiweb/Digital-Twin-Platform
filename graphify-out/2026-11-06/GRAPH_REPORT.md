# Graph Report - 智能体平台  (2026-11-06)

## Corpus Check
- 122 files · ~92,201 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1043 nodes · 2677 edges · 59 communities (53 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80b1e4e5`
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
- SceneUIPreviewOverlay.tsx
- UI Editor Store / UI Editor Core
- UIElement
- UIElementView.tsx
- uiCssParser.ts
- Vite Brand
- cameraTourJson.ts
- echarts
- History / Undo Redo / Scene Utils
- Scene API / UI Interaction Bindings
- gen_soft_copyright_docx.py
- Quarks Particle Adapter / Particle Scene Runt
- @types/node
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
- Post Process (2)
- Index / Chinese README
- Package (3)
- Hero Brand Graphic
- App Favicon / Vite Logo Asset
- Package (4)
- Package (7)
- React Logo Asset

## God Nodes (most connected - your core abstractions)
1. `exportProjectPackage()` - 38 edges
2. `useSceneStore` - 34 edges
3. `CameraTourPlayer` - 29 edges
4. `EditorViewport()` - 28 edges
5. `useUIEditorStore` - 26 edges
6. `UIElement` - 24 edges
7. `useLightStore` - 20 edges
8. `restoreProjectConfig()` - 20 edges
9. `CameraTour` - 18 edges
10. `recordCameraTour()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Digital Twin Platform` --semantically_similar_to--> `数字孪生平台`  [INFERRED] [semantically similar]
  README.en.md → README.md
- `Project Package Export (ZIP)` --shares_data_with--> `数字孪生平台`  [INFERRED]
  README.en.md → README.md
- `saveEditorProject()` --references--> `jszip`  [EXTRACTED]
  src/utils/editorProjectExporter.ts → package.json
- `writeCameraTourFiles()` --references--> `jszip`  [EXTRACTED]
  src/utils/editorProjectExporter.ts → package.json
- `exportProjectPackage()` --references--> `jszip`  [EXTRACTED]
  src/utils/projectPackageExporter.ts → package.json

## Import Cycles
- 3-file cycle: `src/runtime/sceneApi.ts -> src/store/sceneStore.ts -> src/utils/sceneLabel.ts -> src/runtime/sceneApi.ts`
- 4-file cycle: `src/components/Panels/CameraTourPanel.tsx -> src/store/sceneStore.ts -> src/utils/sceneLabel.ts -> src/runtime/sceneApi.ts -> src/components/Panels/CameraTourPanel.tsx`

## Communities (59 total, 6 thin omitted)

### Community 0 - "Three.js Vector Math"
Cohesion: 0.23
Nodes (11): LightPanel(), DEFAULT_LIGHTS, initialState, LightStore, TODO: 集成到历史记录系统, useLightStore, LightAction, LightConfig (+3 more)

### Community 1 - "projectPackageExporter.ts"
Cohesion: 0.11
Nodes (30): buildCameraTourGuideMarkdown(), buildCameraTourIndexJson(), getExportableTours(), buildCameraTourJs(), buildLabelRuntimeJs(), buildParticleRuntimeJs(), buildPostProcessJs(), buildIndexHtml() (+22 more)

### Community 2 - "Resource Lifecycle"
Cohesion: 0.27
Nodes (11): EditorStore, initialState, initialState, SceneStore, CameraConfig, EditorMode, EditorState, EditorTool (+3 more)

### Community 3 - "Object3D Transforms"
Cohesion: 0.29
Nodes (10): isHelperObject(), SceneTree(), TreeNode, clearEditorScene(), isProtectedSceneChild(), disposeLabelAnchor(), DISPOSE_TEXTURE_KEYS, disposeMaterial() (+2 more)

### Community 4 - "Resource Lifecycle (2)"
Cohesion: 0.14
Nodes (21): BASIC_COMPONENTS, ComponentPalette(), UIEditor(), LayerNode(), LayerNodeProps, LayerTree(), typeIcons, SELECT_POPUP_CLASSNAMES (+13 more)

### Community 5 - "cameraTourPlayer.ts"
Cohesion: 0.26
Nodes (11): TextureAnimationSection(), TextureAnimationSectionProps, AnimationStore, useAnimationStore, DEFAULT_TEXTURE_UV_ANIMATION, TextureAnimationTarget, TextureUvAnimationConfig, forEachAnimatedTexture() (+3 more)

### Community 6 - "Object3D Transforms (2)"
Cohesion: 0.12
Nodes (26): CameraTourPanel(), normalizeCameraTour(), Vec3, buildCameraTourJson(), buildCameraTourJsonPreview(), CameraTourIndexEntry, CameraTourIndexJson, downloadCameraTourJson() (+18 more)

### Community 7 - "Three.js Vector Math (3)"
Cohesion: 0.16
Nodes (14): downloadFileFromUrl(), downloadHdrFromSource(), getHdriCategoryLabel(), HDRI_CATEGORY_LABELS, HdriCategory, MODEL_CATEGORY_LABELS, MODEL_COLLECTION_LABELS, ModelGltfAsset (+6 more)

### Community 8 - "Three.js Vector Math (4)"
Cohesion: 0.14
Nodes (31): downloadBlob(), exportGlbBuffer(), resolveHdrAsset(), saveEditorProject(), writeCameraTourFiles(), buildTextureFilename(), cloneMaterialTextures(), CollectedTextureAsset (+23 more)

### Community 9 - "uiEditor.ts"
Cohesion: 0.35
Nodes (9): sampleSplinePath(), createLabelSprite(), disposeObject3D(), isSceneCaptureVisualsLocked(), markTourVisual(), removeTourPathVisual(), stripTourPathVisualForRender(), syncTourPathVisual() (+1 more)

### Community 10 - "uiEditorProjectImporter.ts"
Cohesion: 0.23
Nodes (12): EchartPropertyPanels(), EchartPropertyPanelsProps, SELECT_POPUP_CLASSNAMES, selectProps, SYMBOL_OPTIONS, EchartRenderer(), EchartRendererProps, ECHART_PRESETS (+4 more)

### Community 11 - "uiCssParser.ts"
Cohesion: 0.30
Nodes (10): collectTextureUvStates(), applyTextureUvStates(), applyTextureUvStateToTexture(), DEFAULT_EDITOR_UV, ExportedTextureUvState, isFactoryDefaultTextureUv(), normalizeMaterialTextureUvs(), normalizeTextureUvIfFactoryDefault() (+2 more)

### Community 12 - "exportParticleAssets.ts"
Cohesion: 0.33
Nodes (8): ImportPanel(), ImportPanelProps, enableMeshShadows(), createGltfLoader(), resolvePolyhavenResourceUrl(), useModelLoader(), buildModelResourceMap(), fetchModelGltfUrl()

### Community 13 - "SceneUIPreviewOverlay.tsx"
Cohesion: 0.23
Nodes (13): UIBindingExportEntry, buildLabelPagePacks(), collectReferencedLabelPageIds(), ExportedLabelPagePack, downloadSceneConfig(), generateSceneConfig(), roundNum(), serializePostProcess() (+5 more)

### Community 14 - "UI Editor Store / UI Editor Core"
Cohesion: 0.30
Nodes (12): rectsIntersect(), UICanvas(), getAbsolutePosition(), getDeepestSelectedIds(), getTopmostSelectedIds(), collectAxisTargets(), computeSnap(), getParentBounds() (+4 more)

### Community 15 - "UIElement"
Cohesion: 0.18
Nodes (16): cloneElements(), collectDescendantIds(), createEmptyPage(), flushAndOptionalSwitch(), generatePageId(), initialPage, isDescendantOf(), pageFromActive() (+8 more)

### Community 16 - "UIElementView.tsx"
Cohesion: 0.20
Nodes (7): DEFAULT_PRIMITIVE_MATERIAL, FLAT_DEFAULTS, MESH_DEFAULTS, PRIMITIVE_PRESETS, PrimitiveGeometryType, PrimitivePreset, MaterialParams

### Community 17 - "uiCssParser.ts"
Cohesion: 0.35
Nodes (11): CssImportModal(), CssImportModalProps, isColorValue(), mapBackgroundRepeat(), mapTextAlign(), normalizeColor(), parseBorder(), parseLanhuCss() (+3 more)

### Community 19 - "cameraTourJson.ts"
Cohesion: 0.33
Nodes (7): EXPORT_PACKAGE_DEFAULT_CAMERA_POSITION, EXPORT_PACKAGE_DEFAULT_CONTROLS_TARGET, buildMainJs(), IndexHtmlOptions, buildExportedSceneApiScript(), buildObjectIdRestoreScript(), buildTextureUvNormalizeScript()

### Community 21 - "History / Undo Redo / Scene Utils"
Cohesion: 0.18
Nodes (18): App(), GlobalSettings(), PropertyPanel(), GizmoToolbar(), tools, useKeyboardShortcuts(), useEditorStore, ActionType (+10 more)

### Community 22 - "Scene API / UI Interaction Bindings"
Cohesion: 0.08
Nodes (37): bindEditorTourPlayer(), PropertyGroup(), ACTION_TONE, selectProps, UIInteractionPanel(), UIInteractionPanelProps, animateCameraTo(), applySelectionHighlight() (+29 more)

### Community 23 - "gen_soft_copyright_docx.py"
Cohesion: 0.42
Nodes (9): Path, add_code_line(), add_page_number(), build_all_lines(), collect_files(), main(), read_lines(), set_header_footer() (+1 more)

### Community 24 - "Quarks Particle Adapter / Particle Scene Runt"
Cohesion: 0.06
Nodes (65): ParticleEditor(), ParticleEditorProps, FALLING_WEATHER, getParticleEmitSizeMeta(), isFallingWeatherPreset(), ParticleEmitSizeMeta, getPresetConfig(), ParticlePresetMeta (+57 more)

### Community 27 - "ECharts Presets"
Cohesion: 0.18
Nodes (18): buildAreaStyle(), buildCartesianAxes(), buildLegend(), buildLineSymbol(), buildPieData(), buildTooltip(), DEFAULT_BAR_Y, DEFAULT_LINE_Y (+10 more)

### Community 32 - "Scene Label"
Cohesion: 0.17
Nodes (26): ComponentLibrary(), colorToCss(), LabelEditor(), LabelEditorProps, createPrimitiveObject(), PARTICLE_PRESETS, getParticleSpawnTransform(), createDefaultLabelConfig() (+18 more)

### Community 34 - "Scene Capture"
Cohesion: 0.14
Nodes (29): getSplineDuration(), lockSceneCaptureVisuals(), resetSceneCaptureVisualsLock(), getEditorPostProcessConfig(), PostProcessPipeline, calcVideoBitrate(), canvasToBlob(), CaptureRenderContext (+21 more)

### Community 46 - "Editor / Use Model"
Cohesion: 0.19
Nodes (17): tickEditorCameraTour(), addLightTargetToScene(), applyLightTargetFromConfig(), createLightHelper(), disposeLightHelper(), EditorViewport(), ensureLightPickProxy(), getLightTransformAttachObject() (+9 more)

### Community 47 - "Editor Project"
Cohesion: 0.07
Nodes (53): jszip, jszip, Toolbar(), FORMAT_OPTIONS, UIExportModal(), UIExportModalProps, EditorNotifyApi, NOTIFY_DEFAULTS (+45 more)

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
Cohesion: 0.24
Nodes (12): TexturePicker(), TexturePickerProps, TexturePickerModal(), TexturePickerModalProps, fetchAllTextures(), fetchTextureCategories(), getTextureCategoryLabel(), getTexturePreviewUrl() (+4 more)

### Community 62 - "Camera Tour / Camera Tour Panel"
Cohesion: 0.24
Nodes (13): formatVec3(), StopCard(), StopCardProps, createDefaultStopFields(), TourStore, useTourStore, CameraTour, CameraTourMode (+5 more)

### Community 65 - "Camera Tour"
Cohesion: 0.21
Nodes (3): CameraTourPlayer, CameraTourPlayerOptions, easeInOutCubic()

### Community 67 - "Package"
Cohesion: 0.12
Nodes (17): antd, mp4-muxer, dependencies, antd, mp4-muxer, react, react-dom, three (+9 more)

### Community 68 - "Package (2)"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/three, typescript (+9 more)

### Community 71 - "Panel Form"
Cohesion: 0.17
Nodes (13): PanelButton(), PanelColorField(), PanelColorFieldProps, PanelFileButton(), PanelFileButtonProps, PanelInputNumber(), PanelSelect(), panelSelectClassNames (+5 more)

### Community 72 - "Export Panel"
Cohesion: 0.17
Nodes (13): clampRecordSize(), exportFormTheme, ExportPanel(), ExportPanelProps, exportSelectClassNames, matchRecordResolutionPreset(), RECORD_RESOLUTION_PRESETS, RecordFormat (+5 more)

### Community 75 - "Post Process"
Cohesion: 0.27
Nodes (12): EffectHint(), loadSavedPostProcess(), PostProcessSettings(), buildPostProcessConfig(), DEFAULT_POST_PROCESS_PARAMS, mergePostProcessParams(), POST_PROCESS_EFFECT_GROUPS, POST_PROCESS_PRESETS (+4 more)

### Community 78 - "Polyhaven / Model"
Cohesion: 0.24
Nodes (12): ModelPicker(), ModelPickerProps, ModelPickerModal(), ModelPickerModalProps, fetchAllModels(), fetchModelCategories(), getModelCategoryLabel(), getModelPreviewUrl() (+4 more)

### Community 83 - "Uiexport Modal / Use Editor"
Cohesion: 0.06
Nodes (70): buildElementStyle(), buildInputStyle(), HANDLES, ResizeHandle, UIElementView(), UIElementViewProps, applyInlineAssets(), SceneUIPreviewOverlay() (+62 more)

### Community 84 - "Social Icon Sprite"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Public Icon Sprite Sheet, Social/Profile Icon, X/Twitter Icon

### Community 88 - "Polyhaven / Environment Hdri"
Cohesion: 0.27
Nodes (10): EnvironmentHdriSection(), EnvironmentHdriSectionProps, HdriPicker(), HdriPickerProps, fetchAllHdris(), fetchHdriCategories(), getHdriPreviewUrl(), HDR_RESOLUTIONS (+2 more)

### Community 95 - "Load Polyhaven / Polyhaven"
Cohesion: 0.26
Nodes (11): MaterialEditor(), tagPolyhavenTexture(), applyUvParams(), LoadedPolyhavenTextures, loadPolyhavenTextureSet(), loadTexture(), textureLoader, TextureUvApplyParams (+3 more)

### Community 102 - "Post Process (2)"
Cohesion: 0.27
Nodes (8): chromaticAberrationShader, collectOutlineTargets(), createEffectPass(), createPostProcessPipeline(), pixelationShader, PostProcessRuntimeConfig, updatePostProcessPass(), vignetteShader

### Community 108 - "Index / Chinese README"
Cohesion: 0.10
Nodes (19): Vite dev entry (src/main.tsx), Ant Design 5, 数字孪生平台, Digital Twin Platform, MIT License, Poly Haven, Project Package Export (ZIP), React (+11 more)

### Community 118 - "Package (3)"
Cohesion: 0.29
Nodes (7): scripts, build, build:pages, dev, lint, preview, preview:pages

### Community 120 - "Hero Brand Graphic"
Cohesion: 0.48
Nodes (6): Dashed vertical corner connectors, Dark-mode hero concept graphic, Isometric stacked rounded-square layers, Layered abstraction / depth hierarchy, Solid base slab with purple-glow edges, Transparent wireframe top layer

### Community 132 - "Package (4)"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **217 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+212 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `Editor Project` to `projectPackageExporter.ts`, `Scene Capture`, `Package`, `Three.js Vector Math (4)`, `Uiexport Modal / Use Editor`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package` to `Package (4)`, `echarts`, `Editor Project`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Package (2)` to `@types/node`, `Package (4)`, `Package (7)`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _217 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projectPackageExporter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Should `Resource Lifecycle (2)` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `Object3D Transforms (2)` be split into smaller, more focused modules?**
  _Cohesion score 0.12413793103448276 - nodes in this community are weakly interconnected._