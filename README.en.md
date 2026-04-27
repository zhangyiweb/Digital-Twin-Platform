# 3D Editor - Digital Twin Platform based on Three.js

## Description

A lightweight 3D editor built with Three.js + React + TypeScript, focused on rapid digital twin scene creation and editing.

### Core Features

- 🎯 **Scene Management** - Scene tree, object selection/deletion, real-time statistics
- 📦 **Model Import** - GLB/GLTF support with Draco compression
- 🎨 **Material System** - 17 material types, 5 texture uploads, real-time preview
- 💡 **Lighting System** - Multiple light types, real-time parameter adjustment, Helper visualization
- 🔧 **Transform Controls** - Move/Rotate/Scale with keyboard shortcuts
- 🌅 **Environment Settings** - Background color, HDR environment map, grid helper
- ✨ **Post Processing** - 6 official effects (Bloom, FXAA, Sobel, etc.)
- 📤 **Export** - GLB export, screenshots, configuration JSON
- ⚡ **Undo/Redo** - Complete operation history

## Tech Stack

- **Three.js r184+** - 3D rendering engine
- **React 18.2** - UI framework
- **TypeScript 5.2** - Type safety
- **Vite 5.0** - Build tool
- **Tailwind CSS** - Styling framework
- **Zustand** - State management

## Installation

1. **Clone the repository**
```bash
git clone https://gitee.com/zhangyiweb/3d-editor.git
cd 3d-editor
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**

Open your browser and visit `http://localhost:5173`

## Usage

### Import Model
1. Click the "Import Model" button in the left panel
2. Select a GLB/GLTF file (Draco compression supported)
3. Model will be auto-centered and added to scene

### Edit Material
1. Click a model in the scene tree or 3D viewport
2. Switch to "Material" tab in the right panel
3. Adjust color, metalness, roughness and other parameters
4. Upload textures (Map, Normal, Roughness, Metalness, Emissive)

### Add Lighting
1. Click the "Add Light" button in the left panel
2. Select light type (Ambient/Directional/Point/Spot)
3. Adjust light parameters in the right panel
4. Enable Helper for visual debugging

### Transform Objects
- **W** - Move mode
- **E** - Rotate mode
- **R** - Scale mode
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

### Export Scene
- **GLB Format** - Binary format, small size
- **Screenshot** - PNG image of current view
- **Configuration** - Scene parameters JSON

## Project Structure
```
src/
├── components/
│   ├── Panels/          # Panel components
│   │   ├── SceneTree.tsx        # Scene tree
│   │   ├── MaterialEditor.tsx   # Material editor
│   │   ├── LightPanel.tsx       # Light panel
│   │   ├── ExportPanel.tsx      # Export panel
│   │   └── ...
│   ├── Toolbar/         # Toolbars
│   └── Viewport/        # 3D viewport
├── hooks/               # Custom Hooks
│   ├── useSceneExporter.ts
│   ├── useModelLoader.ts
│   └── useKeyboardShortcuts.ts
├── store/               # State management
│   ├── sceneStore.ts
│   ├── lightStore.ts
│   └── historyStore.ts
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Contribution

1.  Fork the repository
2.  Create Feat_xxx branch
3.  Commit your code
4.  Create Pull Request


## Roadmap

### Short-term (1-2 weeks)
- [ ] Scene save/load (JSON)
- [ ] Precise numeric input panel
- [ ] Multi-selection and batch operations
- [ ] Material preset library

### Mid-term (1-2 months)
- [ ] Measurement tools (distance/angle)
- [ ] Alignment and distribution tools
- [ ] Camera view presets
- [ ] Basic animation system

### Long-term (3-6 months)
- [ ] Physics engine integration
- [ ] Particle system editor
- [ ] Terrain editing tools
- [ ] Collaborative editing

## License

MIT License

## Contact

- Project URL: https://gitee.com/zhangyiweb/3d-editor
- Bug Reports: Submit an Issue
