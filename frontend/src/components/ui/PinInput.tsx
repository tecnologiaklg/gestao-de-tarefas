import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function PinInput({ value, onChange, disabled }: Props) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, '').slice(-1);
    const chars = Array.from({ length: 6 }, (_, idx) => value[idx] || '');
    chars[i] = char;
    
    // Constrói nova string de dígitos preenchidos contiguamente
    const nextVal = chars.join('').replace(/\s+$/, '');
    onChange(nextVal);

    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) {
        inputRefs.current[i - 1]?.focus();
      } else if (digits[i]) {
        const chars = Array.from({ length: 6 }, (_, idx) => value[idx] || '');
        chars[i] = '';
        onChange(chars.join('').replace(/\s+$/, ''));
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(paste);
    const focusIdx = Math.min(paste.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="pin-input-group">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
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

