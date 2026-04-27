import { useEditorStore } from '@/store/editorStore';

export function GizmoToolbar() {
  const { currentTool, setTool } = useEditorStore();

  const tools = [
    { id: 'select', label: '选择', icon: '◇', key: 'Q' },
    { id: 'move', label: '移动', icon: '✥', key: 'W' },
    { id: 'rotate', label: '旋转', icon: '↻', key: 'E' },
    { id: 'scale', label: '缩放', icon: '⤢', key: 'R' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-gray-900/95 backdrop-blur-md rounded-2xl px-3 py-2 shadow-2xl border border-gray-700/50">
        {tools.map((tool) => {
          const isActive = currentTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id as any)}
              className={`
                relative group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70 hover:text-gray-200'
                }
              `}
            >
              {/* 图标 */}
              <span className="text-lg font-light">{tool.icon}</span>
              
              {/* 标签 */}
              <span className="text-sm font-medium">{tool.label}</span>
              
              {/* 快捷键提示 */}
              <span className={`
                ml-1 px-1.5 py-0.5 rounded text-xs font-mono
                ${isActive
                  ? 'bg-white/20 text-white/90'
                  : 'bg-gray-700/50 text-gray-500'
                }
              `}>
                {tool.key}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700">
                {tool.label} ({tool.key})
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
