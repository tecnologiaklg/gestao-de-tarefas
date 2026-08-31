import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CustomSelect({ id, value, onChange, options, placeholder = 'Selecione…', disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{ up: boolean; right: boolean }>({ up: false, right: false });
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;
      const up = spaceBelow < 240 && rect.top > 240;
      const right = spaceRight < 200;
      setPlacement({ up, right });
    }
  }, [open]);

  return (
    <div
      ref={ref}
      className={`custom-select-wrap${disabled ? ' disabled' : ''}${className ? ' ' + className : ''}`}
      id={id}
    >
      <button
        type="button"
        className={`custom-select-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? 'custom-select-value' : 'custom-select-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <IconChevron open={open} />
      </button>

      {open && (
        <div
          className={`custom-select-dropdown${placement.up ? ' open-up' : ' open-down'}${placement.right ? ' align-right' : ' align-left'}`}
          role="listbox"
          onClick={e => e.stopPropagation()}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`custom-select-option${opt.value === value ? ' selected' : ''}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <IconCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
