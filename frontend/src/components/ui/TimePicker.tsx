import { useRef, ChangeEvent } from 'react';

/* ── Props ─────────────────────────────────────────────────────── */
interface Props {
  id?: string;
  value: string;          // HH:MM ou '' quando vazio
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/* ── Icon ─────────────────────────────────────────────────────── */
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Mascara HH:MM ─────────────────────────────────────────────── */
function applyTimeMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(val: string): boolean {
  const m = val.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

/* ── Componente ──────────────────────────────────────────────────── */
export function TimePicker({
  id,
  value,
  onChange,
  placeholder = '18:00',
  disabled = false,
  className = '',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const masked = applyTimeMask(e.target.value);
    onChange(masked);
  };

  const handleBlur = () => {
    if (value && !isValidTime(value)) {
      // Tenta corrigir: completa se incompleto (ex: "9" -> "09:00")
      const digits = value.replace(/\D/g, '').padEnd(4, '0');
      const corrected = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
      if (isValidTime(corrected)) onChange(corrected);
      else onChange('');
    }
  };

  const hasValue = Boolean(value);

  return (
    <div className={`time-picker-wrap${className ? ` ${className}` : ''}`}>
      <span className="time-picker-icon">
        <IconClock />
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        maxLength={5}
        className={`time-picker-input${hasValue ? ' has-value' : ''}`}
        aria-label="Horário (HH:MM)"
      />
    </div>
  );
}
