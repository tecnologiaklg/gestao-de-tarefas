import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt';
import 'flatpickr/dist/flatpickr.min.css';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'date' | 'time';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// YYYY-MM-DD → Date object
function parseStoredDate(val: string): Date | null {
  if (!val) return null;
  const [y, m, d] = val.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Date → YYYY-MM-DD (formato interno do form)
function toStoredDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function FlatDatePicker({
  id,
  value,
  onChange,
  type = 'date',
  placeholder,
  disabled = false,
  className = '',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const isTime = type === 'time';

  useEffect(() => {
    if (!inputRef.current) return;

    const defaultDate = isTime
      ? (value || undefined)
      : (value ? parseStoredDate(value) ?? undefined : undefined);

    fpRef.current = flatpickr(inputRef.current, {
      locale: Portuguese,
      enableTime: isTime,
      noCalendar: isTime,
      // Exibe no formato humano; onChange converte pro formato de armazenamento
      dateFormat: isTime ? 'H:i' : 'd/m/Y',
      defaultDate,
      time_24hr: true,
      disableMobile: true,
      allowInput: false,
      // Desabilita dropdown de mês/ano - navegar apenas pelas setas
      showMonths: 1,
      onChange(selectedDates, dateStr) {
        if (isTime) {
          onChange(dateStr);
        } else if (selectedDates[0]) {
          onChange(toStoredDate(selectedDates[0]));
        }
      },
    });

    return () => { fpRef.current?.destroy(); fpRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Sincroniza mudanças externas de valor
  useEffect(() => {
    if (!fpRef.current) return;
    if (isTime) {
      if (fpRef.current.input.value !== value) {
        fpRef.current.setDate(value || '', false);
      }
    } else {
      const parsed = value ? parseStoredDate(value) : null;
      if (parsed) fpRef.current.setDate(parsed, false);
      else if (!value) fpRef.current.clear();
    }
  }, [value, isTime]);

  return (
    <div className={`fp-wrap${className ? ` ${className}` : ''}`}>
      <span className="fp-icon" aria-hidden="true">
        {isTime ? <IconClock /> : <IconCalendar />}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder || (isTime ? '18:00' : 'dd/mm/aaaa')}
        disabled={disabled}
        readOnly
        autoComplete="off"
        className="fp-input"
      />
    </div>
  );
}
