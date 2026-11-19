import { useState } from 'react';

type TransformNumberInputProps = {
  value: number;
  onChange: (value: number) => void;
};

/** 编辑时保留原始文本，避免格式化打断全选替换、小数和负数输入。 */
export function TransformNumberInput({ value, onChange }: TransformNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const formatted = Number.isFinite(value) ? value.toFixed(2) : '';

  return (
    <input
      type="number"
      step="0.1"
      className="w-full px-2 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded"
      value={draft ?? formatted}
      onFocus={(event) => setDraft(event.currentTarget.value)}
      onChange={(event) => {
        const text = event.currentTarget.value;
        setDraft(text);
        const next = event.currentTarget.valueAsNumber;
        if (text.trim() !== '' && Number.isFinite(next)) onChange(next);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
    />
  );
}
