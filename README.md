# 3D编辑器 - 基于Three.js的数字孪生平台

## 介绍

一个基于 Three.js + React + TypeScript 构建的轻量级3D编辑器,专注于数字孪生场景的快速搭建和编辑。

### 核心特性

- 🎯 **场景管理** - 场景树显示、对象选择/删除、实时统计
- 📦 **模型导入** - 支持GLB/GLTF格式,内置Draco压缩
- 🎨 **材质系统** - 17种材质类型,5种贴图上传,实时预览
- 💡 **灯光系统** - 多种灯光类型,参数实时调节,Helper可视化
- 🔧 **变换控制** - 移动/旋转/缩放,键盘快捷键支持
- 🌅 **环境设置** - 背景颜色、HDR环境贴图、网格辅助线
- ✨ **后期处理** - 6种官方效果(Bloom、FXAA、Sobel等)
- 📤 **导出功能** - GLB导出、截图、配置文件JSON
- ⚡ **撤销/重做** - 完整的操作历史记录

## 技术栈

- **Three.js r184+** - 3D渲染引擎
- **React 18.2** - UI框架
- **TypeScript 5.2** - 类型安全
- **Vite 5.0** - 构建工具
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理


## 安装教程

1. **克隆项目**
```bash
git clone https://gitee.com/zhangyiweb/3d-editor.git
cd 3d-editor
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**

打开浏览器访问 `http://localhost:5173`

## 使用说明

### 导入模型
1. 点击左侧面板的「导入模型」按钮
2. 选择GLB/GLTF文件(支持Draco压缩)
3. 模型自动居中并添加到场景

### 编辑材质
1. 在场景树或3D视口中点击模型
2. 右侧面板切换到「材质」Tab
3. 调整颜色、金属度、粗糙度等参数
4. 上传贴图(基础、法线、粗糙度、金属度、自发光)

### 添加灯光
1. 点击左侧面板的「添加灯光」按钮
2. 选择灯光类型(Ambient/Directional/Point/Spot)
3. 在右侧面板调节灯光参数
4. 开启Helper可视化调试

### 变换对象
- **W** - 移动模式
- **E** - 旋转模式
- **R** - 缩放模式
- **Ctrl+Z** - 撤销
- **Ctrl+Y** - 重做

### 导出场景
- **GLB格式** - 二进制格式,体积小
- **截图** - 当前视角PNG图片
- **配置文件** - 场景参数JSON

## 项目结构
```
src/
├── components/
│   ├── Panels/          # 面板组件
│   │   ├── SceneTree.tsx        # 场景树
│   │   ├── MaterialEditor.tsx   # 材质编辑器
│   │   ├── LightPanel.tsx       # 灯光面板
│   │   ├── ExportPanel.tsx      # 导出面板
│   │   └── ...
│   ├── Toolbar/         # 工具栏
│   └── Viewport/        # 3D视口
├── hooks/               # 自定义Hooks
│   ├── useSceneExporter.ts
│   ├── useModelLoader.ts
│   └── useKeyboardShortcuts.ts
├── store/               # 状态管理
│   ├── sceneStore.ts
│   ├── lightStore.ts
│   └── historyStore.ts
├── types/               # TypeScript类型定义
└── utils/               # 工具函数
```

## 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


## 开发计划

### 短期(1-2周)
- [ ] 场景保存/加载(JSON)
- [ ] 精确数值输入面板
- [ ] 多选与批量操作
- [ ] 材质预设库

### 中期(1-2月)
- [ ] 测量工具(距离/角度)
- [ ] 对齐与分布工具
- [ ] 相机视角预设保存
- [ ] 基础动画系统

### 长期(3-6月)
- [ ] 物理引擎集成
- [ ] 粒子系统编辑器
- [ ] 地形编辑工具
- [ ] 协作编辑功能

## 许可证

MIT License

## 联系方式

- 项目地址: https://gitee.com/zhangyiweb/3d-editor
- 问题反馈: 提交Issue
