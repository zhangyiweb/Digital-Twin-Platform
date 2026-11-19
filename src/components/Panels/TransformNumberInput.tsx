import { useState } from 'react';
import { InputNumber } from 'antd';

type TransformNumberInputProps = {
  value: number;
  onChange: (value: number) => void;
};

/** 编辑时保留原始文本，避免格式化打断全选替换、小数和负数输入。 */
export function TransformNumberInput({ value, onChange }: TransformNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const formatted = Number.isFinite(value) ? value.toFixed(2) : '';

  return (
    <InputNumber
      size="small"
      controls={false}
      step={0.1}
      className="w-full"
      value={draft ?? formatted}
      onFocus={(event) => setDraft(event.currentTarget.value)}
      onChange={(value) => {
        const text = value ?? '';
        setDraft(text);
        const parsed = Number(text);
        if (text.trim() !== '' && Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
    />
  );
}
