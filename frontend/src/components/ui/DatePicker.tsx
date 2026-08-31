import { useState, useRef, useEffect } from 'react';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const DIAS_SEMANA_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

interface Props {
  id?: string;
  value: string; // 'YYYY-MM-DD' ou ''
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function formatDisplay(value: string) {
  if (!value) return '';
  const [y, m, d] = value.split('-');
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
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return parseInt(value.split('-')[1]) - 1;
    return today.getMonth();
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  function goToday() {
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate();
    setViewYear(y); setViewMonth(m);
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${y}-${mm}-${dd}`);
    setOpen(false);
  }

  function clear() {
    onChange('');
    setOpen(false);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWd = getFirstWeekday(viewYear, viewMonth);

  // Selected date parts
  let selDay = -1, selMonth = -1, selYear = -1;
  if (value) {
    const parts = value.split('-');
    selYear = parseInt(parts[0]);
    selMonth = parseInt(parts[1]) - 1;
    selDay = parseInt(parts[2]);
  }

  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (d: number) =>
    d === selDay && viewMonth === selMonth && viewYear === selYear;

  // Build calendar grid (blanks + days)
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
        <div className="datepicker-dropdown">
          {/* Header de navegação */}
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav-btn" onClick={prevMonth}>
              <IconChevronLeft />
            </button>
            <span className="datepicker-month-label">
              {MESES[viewMonth]} de {viewYear}
            </span>
            <button type="button" className="datepicker-nav-btn" onClick={nextMonth}>
              <IconChevronRight />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="datepicker-weekdays">
            {DIAS_SEMANA_CURTO.map(d => (
              <span key={d} className="datepicker-weekday">{d}</span>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="datepicker-grid">
            {cells.map((day, i) => (
              day === null
                ? <span key={`empty-${i}`} />
                : (
                  <button
                    key={day}
                    type="button"
                    className={`datepicker-day${isSelected(day) ? ' selected' : ''}${isToday(day) && !isSelected(day) ? ' today' : ''}`}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                )
            ))}
          </div>

          {/* Ações */}
          <div className="datepicker-actions">
            <button type="button" className="datepicker-action-btn" onClick={clear}>Limpar</button>
            <button type="button" className="datepicker-action-btn primary" onClick={goToday}>Hoje</button>
          </div>
        </div>
      )}
    </div>
  );
}
