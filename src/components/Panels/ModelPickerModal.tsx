import { Modal } from 'antd';
import { ModelPicker } from './ModelPicker';
import type { ModelAsset, ModelResolution } from '@/utils/polyhaven';

interface ModelPickerModalProps {
  open: boolean;
  onClose: () => void;
  resolution: ModelResolution;
  onResolutionChange: (res: ModelResolution) => void;
  selectedId: string | null;
  loadingId: string | null;
  onSelect: (asset: ModelAsset) => void;
}

export function ModelPickerModal({
  open,
  onClose,
  resolution,
  onResolutionChange,
  selectedId,
  loadingId,
  onSelect,
}: ModelPickerModalProps) {
  return (
    <Modal
      title={
        <div>
          <div className="text-base font-semibold text-gray-100">Poly Haven 模型库</div>
          <div className="text-xs font-normal text-gray-500 mt-0.5">点击模型导入到场景（GLTF）</div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      centered
      destroyOnHidden={false}
      className="texture-picker-modal"
      styles={{
        content: {
          background: '#141419',
          borderRadius: 12,
          border: '1px solid #2e2e38',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
          padding: 0,
          overflow: 'hidden',
        },
        header: {
          background: 'linear-gradient(180deg, #1c1c24 0%, #141419 100%)',
          borderBottom: '1px solid #2a2a34',
          marginBottom: 0,
          padding: '16px 20px 14px',
        },
        body: { padding: '16px 20px 20px', background: '#141419' },
      }}
    >
      <div className="h-[min(85vh,780px)] flex flex-col">
        <ModelPicker
          resolution={resolution}
          onResolutionChange={onResolutionChange}
          selectedId={selectedId}
          loadingId={loadingId}
          onSelect={onSelect}
        />
      </div>
    </Modal>
  );
}
