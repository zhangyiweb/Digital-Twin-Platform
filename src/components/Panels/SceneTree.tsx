import { useState, useEffect, useCallback } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { useLightStore } from '@/store/lightStore';
import { SearchOutlined, DownOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import * as THREE from 'three';

// 树节点数据结构
interface TreeNode {
  id: string;
  uuid: string; // Three.js对象的uuid
  name: string;
  type: 'model' | 'group' | 'mesh' | 'light';
  icon: string;
  children: TreeNode[];
  hasChildren: boolean;
}

// 递归树节点组件
function TreeNodeItem({ node, depth = 0, onDelete }: { node: TreeNode; depth?: number; onDelete: (id: string, type: 'model' | 'light') => void }) {
  const [expanded, setExpanded] = useState(false);
  const { selectedIds, selectObject, getThreeObject } = useSceneStore();
  const { selectedLightId, selectLight } = useLightStore();
  const { deselectAll } = useSceneStore();

  const isSelected = node.type === 'light'
    ? selectedLightId === node.id
    : selectedIds.includes(node.uuid) || selectedIds.includes(node.id);

  const handleClick = () => {
    if (node.type === 'light') {
      selectLight(node.id);
      deselectAll();
      const transformControls = (window as any).__editorTransformControls;
      if (transformControls) {
        transformControls.detach();
      }
    } else {
      // 对于mesh和group,使用uuid作为id
      const selectId = node.uuid || node.id;
      selectObject(selectId);
      selectLight(null);
      
      // 直接从场景中查找Three.js对象
      const scene = (window as any).__editorScene;
      if (scene) {
        let threeObj: THREE.Object3D | null = null;
        scene.traverse((child: THREE.Object3D) => {
          if (child.uuid === node.uuid) {
            threeObj = child;
          }
        });
        
        if (threeObj) {
          const transformControls = (window as any).__editorTransformControls;
          if (transformControls) {
            transformControls.attach(threeObj);
          }
        }
      }
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const iconMap: Record<string, string> = {
    model: '📦',
    group: '📁',
    mesh: '🔷',
    light: '💡',
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`group flex items-center py-1.5 cursor-pointer transition-all hover:bg-gray-800 ${
          isSelected ? 'bg-blue-900/40' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={toggleExpand}
          className="w-4 h-4 flex items-center justify-center mr-1 text-gray-500 hover:text-white"
          style={{ visibility: node.hasChildren ? 'visible' : 'hidden' }}
        >
          {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </button>

        {/* 图标 */}
        <span className="mr-2 text-sm">{iconMap[node.type] || '📦'}</span>
        
        {/* 名称 */}
        <span className="flex-1 text-white text-xs truncate">{node.name || '未命名'}</span>
        
        {/* 删除按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id, node.type === 'light' ? 'light' : 'model');
          }}
          className="ml-2 p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
          title="删除"
        >
          <DeleteOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* 子节点 */}
      {expanded && node.children.map((child) => (
        <TreeNodeItem key={child.uuid} node={child} depth={depth + 1} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function SceneTree() {
  const { objects, selectedIds, selectObject, removeObject, getThreeObject, deselectAll } = useSceneStore();
  const { lights, selectedLightId, selectLight, removeLight } = useLightStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // 构建场景树 - 从 Three.js 场景中读取完整层级结构
  const buildSceneTree = useCallback(() => {
    const scene = (window as any).__editorScene;
    if (!scene) return;

    const nodes: TreeNode[] = [];

    // 添加灯光
    lights.forEach(light => {
      if (!searchTerm || light.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        nodes.push({
          id: light.id,
          uuid: '',
          name: light.name,
          type: 'light',
          icon: '💡',
          children: [],
          hasChildren: false,
        });
      }
    });

    // 遍历场景对象,构建树形结构 - 只显示顶级对象及其子树
    scene.children.forEach((child: THREE.Object3D) => {
      // 跳过辅助对象和默认灯光(默认灯光由lightStore管理)
      if (child.name === 'grid' || 
          child.name === 'axes' || 
          child.name.startsWith('helper_') ||
          child.userData?.id === 'light_ambient_default' ||
          child.userData?.id === 'light_directional_default' ||
          child.type === 'TransformControlsGizmo' ||
          (child.children.length === 2 && child.children[0]?.type === 'TransformControlsGizmo')) {
        return;
      }

      // 构建完整的树形结构(包括根节点和所有子节点)
      const rootNode = buildTreeNode(child, searchTerm);
      if (rootNode) {
        nodes.push(rootNode);
      }
    });

    setTreeData(nodes);
  }, [lights, searchTerm]);

  // 递归构建节点树
  const buildTreeNode = (obj: THREE.Object3D, searchTerm: string): TreeNode | null => {
    // 搜索过滤
    if (searchTerm && !obj.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      // 检查子节点是否有匹配的
      let hasMatch = false;
      obj.traverse((child) => {
        if (child.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          hasMatch = true;
        }
      });
      if (!hasMatch) return null;
    }

    const children: TreeNode[] = [];
    let hasChildren = false;

    // 处理子节点
    obj.children.forEach((child) => {
      if (child.name === 'grid' || child.name === 'axes' || child.name.startsWith('helper_')) {
        return;
      }

      const childNode = buildTreeNode(child, searchTerm);
      if (childNode) {
        children.push(childNode);
        hasChildren = true;
      }
    });

    // 确定类型和图标
    let type: 'model' | 'group' | 'mesh' = 'group';
    if (obj instanceof THREE.Mesh) {
      type = 'mesh';
    } else if (obj.children.length > 0) {
      type = 'group';
    } else {
      type = 'model';
    }

    // 生成ID (对于子mesh,使用uuid作为id)
    const id = obj.userData?.businessId || obj.uuid;

    // 注册Three.js对象映射(用于子mesh选择)
    if (!obj.userData?.businessId) {
      obj.userData = obj.userData || {};
      obj.userData.businessId = obj.uuid;
    }

    return {
      id,
      uuid: obj.uuid,
      name: obj.name || (type === 'mesh' ? 'Mesh' : 'Group'),
      type,
      icon: type === 'mesh' ? '🔷' : (type === 'group' ? '📁' : '📦'),
      children,
      hasChildren,
    };
  };

  // 监听场景变化,重建树形结构
  useEffect(() => {
    buildSceneTree();
    const interval = setInterval(buildSceneTree, 500); // 每0.5秒更新一次,减少延迟
    return () => clearInterval(interval);
  }, [buildSceneTree]);

  // 处理对象选择 (区分模型和灯光)
  const handleObjectSelect = (obj: typeof treeData[0]) => {
    if (obj.type === 'light') {
      selectLight(obj.id);
      deselectAll();
      
      // 灯光不需要TransformControls
      const transformControls = (window as any).__editorTransformControls;
      if (transformControls) {
        transformControls.detach();
      }
    } else {
      selectObject(obj.id);
      selectLight(null);
      
      // 获取Three.js对象并附加TransformControls
      const threeObj = getThreeObject(obj.uuid);
      if (threeObj) {
        const transformControls = (window as any).__editorTransformControls;
        if (transformControls) {
          transformControls.attach(threeObj);
        }
      }
    }
  };

  // 删除对象
  const handleDelete = (id: string, type: 'model' | 'light') => {
    if (type === 'light') {
      // 取消选择(如果有)
      if (selectedLightId === id) {
        selectLight(null);
      }
      
      // 删除灯光
      removeLight(id);
      
      // 从场景中移除灯光对象
      const scene = (window as any).__editorScene;
      if (scene && scene.traverse) {
        const toRemove: THREE.Object3D[] = [];
        scene.traverse((child: THREE.Object3D) => {
          if (child.userData?.id === id) {
            toRemove.push(child);
          }
        });
        toRemove.forEach(child => scene.remove(child));
      }
    } else {
      // 删除模型或子mesh
      const scene = (window as any).__editorScene;
      if (!scene || !scene.traverse) {
        return;
      }
      
      // 通过uuid查找对象
      let targetObj: THREE.Object3D | null = null;
      scene.traverse((child: THREE.Object3D) => {
        if (child.uuid === id) {
          targetObj = child;
        }
      });
      
      if (targetObj) {
        // 先detach TransformControls(重要!)
        const transformControls = (window as any).__editorTransformControls;
        if (transformControls && transformControls.object === targetObj) {
          transformControls.detach();
        }
        
        // 取消选择(如果删除的是当前选中的对象)
        if (selectedIds.includes(id)) {
          deselectAll();
        }
        
        // 从场景移除
        scene.remove(targetObj);
        
        // 从store中移除
        removeObject(id);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* 搜索框 */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center bg-gray-800 rounded px-2 py-1.5">
          <SearchOutlined className="text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="搜索场景对象..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 ml-2 bg-transparent text-white text-xs placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 场景树列表 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(50vh - 100px)' }}>
        {treeData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            {searchTerm ? '未找到匹配的对象' : '场景为空'}
          </div>
        ) : (
          treeData.map((node) => (
            <TreeNodeItem key={node.uuid} node={node} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* 底部统计 */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-500 text-center">
        {treeData.length} 个对象
      </div>
    </div>
  );
}
