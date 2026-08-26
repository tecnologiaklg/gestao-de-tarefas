import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function PinInput({ value, onChange, disabled }: Props) {
  const digits = value.padEnd(6, '').split('').slice(0, 6);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    onChange(next.join('').replace(/\s/g, ''));
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(paste.padEnd(6, '').slice(0, 6));
    refs[Math.min(paste.length, 5)].current?.focus();
  };

  return (
    <div className="pin-input-group">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          id={`pin-cell-${i}`}
          className="pin-input-cell"
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          autoComplete="off"
        />
      ))}
    </div>
  );
}
