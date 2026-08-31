import { useState, useRef, useEffect } from 'react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface Props {
  id?: string;
  value: string; // 'YYYY-MM-DD' ou ''
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function formatDisplay(value: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ id, value, onChange, placeholder = 'dd/mm/aaaa', disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{ up: boolean; right: boolean }>({ up: false, right: false });
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (value && value.includes('-')) return parseInt(value.split('-')[0], 10);
    return today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value && value.includes('-')) return parseInt(value.split('-')[1], 10) - 1;
    return today.getMonth();
  });

  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m] = value.split('-');
      setViewYear(parseInt(y, 10));
      setViewMonth(parseInt(m, 10) - 1);
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Detecta dinamicamente a melhor posição para não ser cortado
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;
      const up = spaceBelow < 310 && rect.top > 310;
      const right = spaceRight < 290;
      setPlacement({ up, right });
    }
  }, [open]);

  function prevMonth(e: React.MouseEvent) {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  }

  function nextMonth(e: React.MouseEvent) {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  function goToday(e: React.MouseEvent) {
    e.stopPropagation();
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate();
    setViewYear(y);
    setViewMonth(m);
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${y}-${mm}-${dd}`);
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWd = getFirstWeekday(viewYear, viewMonth);

  let selDay = -1, selMonth = -1, selYear = -1;
  if (value && value.includes('-')) {
    const parts = value.split('-');
    selYear = parseInt(parts[0], 10);
    selMonth = parseInt(parts[1], 10) - 1;
    selDay = parseInt(parts[2], 10);
  }

  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (d: number) =>
    d === selDay && viewMonth === selMonth && viewYear === selYear;

  const cells: (number | null)[] = [
    ...Array(firstWd).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div ref={ref} className={`datepicker-wrap${disabled ? ' disabled' : ''}`} id={id}>
      <button
        type="button"
        className={`datepicker-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className={value ? 'datepicker-value' : 'datepicker-placeholder'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <IconCalendar />
      </button>

      {open && (
        <div
          className={`datepicker-dropdown${placement.up ? ' open-up' : ' open-down'}${placement.right ? ' align-right' : ' align-left'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Top header navigation */}
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav-btn" onClick={prevMonth} title="Mês anterior">
              <IconChevronLeft />
            </button>
            <div className="datepicker-month-label">
              <span>{MESES[viewMonth]}</span>
              <span className="datepicker-year-badge">{viewYear}</span>
            </div>
            <button type="button" className="datepicker-nav-btn" onClick={nextMonth} title="Próximo mês">
              <IconChevronRight />
            </button>
          </div>

          <div className="datepicker-body">
            {/* Weekdays */}
            <div className="datepicker-weekdays">
              {DIAS_SEMANA.map((d, i) => (
                <span key={`wd-${i}`} className="datepicker-weekday">{d}</span>
              ))}
            </div>

            {/* Day grid */}
            <div className="datepicker-grid">
              {cells.map((day, i) =>
                day === null ? (
                  <span key={`empty-${i}`} className="datepicker-empty" />
                ) : (
                  <button
                    key={`day-${day}`}
                    type="button"
                    className={`datepicker-day${isSelected(day) ? ' selected' : ''}${isToday(day) ? ' today' : ''}`}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="datepicker-actions">
            <button type="button" className="datepicker-action-btn clear" onClick={clear}>
              Limpar
            </button>
            <button type="button" className="datepicker-action-btn primary" onClick={goToday}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
