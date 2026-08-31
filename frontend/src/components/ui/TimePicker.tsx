import { useState, useRef, useEffect } from 'react';

interface Props {
  id?: string;
  value: string; // 'HH:MM'
  onChange: (value: string) => void;
  disabled?: boolean;
}

function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '10', '15', '20', '30', '40', '45', '50'];

export function TimePicker({ id, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [inputH, inputM] = value && value.includes(':') ? value.split(':') : ['18', '00'];
  const ref = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && hourRef.current) {
      const selected = hourRef.current.querySelector('.timepicker-item.selected');
      if (selected) {
        (selected as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [open]);

  function setHour(h: string) {
    onChange(`${h}:${inputM}`);
  }

  function setMinute(m: string) {
    onChange(`${inputH}:${m}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`timepicker-wrap${disabled ? ' disabled' : ''}`} id={id}>
      <button
        type="button"
        className={`timepicker-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className="timepicker-value">{value || '18:00'}</span>
        <IconClock />
      </button>

      {open && (
        <div className="timepicker-dropdown" onClick={e => e.stopPropagation()}>
          <div className="timepicker-header">
            <IconClock />
            <span className="timepicker-header-label">Horário de Entrega</span>
          </div>

          <div className="timepicker-cols">
            {/* Hour column */}
            <div className="timepicker-col" ref={hourRef}>
              <div className="timepicker-col-label">Horas</div>
              <div className="timepicker-col-scroll">
                {HOURS.map(h => (
                  <button
                    key={h}
                    type="button"
                    className={`timepicker-item${h === inputH ? ' selected' : ''}`}
                    onClick={() => setHour(h)}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div className="timepicker-divider" />

            {/* Minute column */}
            <div className="timepicker-col">
              <div className="timepicker-col-label">Minutos</div>
              <div className="timepicker-col-scroll">
                {MINUTES.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`timepicker-item${m === inputM ? ' selected' : ''}`}
                    onClick={() => setMinute(m)}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
