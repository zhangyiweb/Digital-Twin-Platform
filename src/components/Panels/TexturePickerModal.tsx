import { Modal } from 'antd';
import { TexturePicker } from './TexturePicker';
import type { TextureAsset, TextureResolution } from '@/utils/polyhaven';

interface TexturePickerModalProps {
  open: boolean;
  onClose: () => void;
  resolution: TextureResolution;
  onResolutionChange: (res: TextureResolution) => void;
  selectedId: string | null;
  loadingId: string | null;
  onSelect: (asset: TextureAsset) => void;
}

export function TexturePickerModal({
  open,
  onClose,
  resolution,
  onResolutionChange,
  selectedId,
  loadingId,
  onSelect,
}: TexturePickerModalProps) {
  return (
    <Modal
      title={
        <div>
          <div className="text-base font-semibold text-gray-100">Poly Haven 贴图库</div>
          <div className="text-xs font-normal text-gray-500 mt-0.5">点击贴图应用到当前材质</div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
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
      <div className="h-[min(70vh,600px)] flex flex-col">
        <TexturePicker
          variant="modal"
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
