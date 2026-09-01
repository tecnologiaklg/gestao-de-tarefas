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

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

  useEffect(() => {
    if (!inputRef.current) return;

    const isTime = type === 'time';

    fpRef.current = flatpickr(inputRef.current, {
      locale: Portuguese,
      enableTime: isTime,
      noCalendar: isTime,
      dateFormat: isTime ? 'H:i' : 'Y-m-d',
      altInput: true,
      altFormat: isTime ? 'H:i' : 'd/m/Y',
      defaultDate: value || undefined,
      time_24hr: true,
      disableMobile: true, // Garante que use o tema flatpickr em qualquer tela
      onChange: (selectedDates, dateStr) => {
        onChange(dateStr);
      },
    });

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [type]);

  // Atualiza valor se mudar externamente
  useEffect(() => {
    if (fpRef.current && fpRef.current.input.value !== value) {
      fpRef.current.setDate(value || '', false);
    }
  }, [value]);

  return (
    <div className={`flatpickr-wrapper ${type} ${className}`}>
      <span className="flatpickr-icon">
        {type === 'time' ? <IconClock /> : <IconCalendar />}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder || (type === 'time' ? '00:00' : 'dd/mm/aaaa')}
        disabled={disabled}
        className={`form-input flatpickr-custom-input ${disabled ? 'disabled' : ''}`}
        autoComplete="off"
      />
    </div>
  );
}
