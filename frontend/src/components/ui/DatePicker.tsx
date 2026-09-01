import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';
import 'react-day-picker/dist/style.css';

/* ── Props ─────────────────────────────────────────────────────── */
interface Props {
  id?: string;
  value: string;           // YYYY-MM-DD ou '' quando vazio
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Desabilita datas no passado */
  disablePast?: boolean;
}

/* ── Helpers ───────────────────────────────────────────────────── */
function fromStored(val: string): Date | undefined {
  if (!val) return undefined;
  const d = parse(val, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : undefined;
}

function toStored(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function displayDate(val: string): string {
  const d = fromStored(val);
  return d ? format(d, 'dd/MM/yyyy') : '';
}

/* ── Icons ─────────────────────────────────────────────────────── */
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

function IconX() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── Popover posicionado via Portal ────────────────────────────── */
interface PopoverProps {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}

function CalendarPopover({ triggerRef, onClose, children }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden', position: 'fixed' });

  // Calcula posição ideal após montar
  useEffect(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    const tr = trigger.getBoundingClientRect();
    const pr = popover.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 6;
    const MARGIN = 8;

    // Vertical: prefere abaixo; se não cabe, abre acima
    let top: number;
    if (tr.bottom + GAP + pr.height <= vh - MARGIN) {
      top = tr.bottom + GAP;
    } else {
      top = tr.top - GAP - pr.height;
    }

    // Horizontal: alinha à esquerda do trigger; ajusta se ultrapassar
    let left = tr.left;
    if (left + pr.width > vw - MARGIN) {
      left = vw - MARGIN - pr.width;
    }
    if (left < MARGIN) left = MARGIN;

    setStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, [triggerRef]);

  // Fecha ao clicar fora, pressionar ESC ou scrollar
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [onClose, triggerRef]);

  return createPortal(
    <div
      ref={popoverRef}
      className="date-picker-popover"
      style={style}
      role="dialog"
      aria-label="Calendário"
    >
      {children}
    </div>,
    document.body
  );
}

/* ── Componente Principal ───────────────────────────────────────── */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  className = '',
  disablePast = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(fromStored(value) ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = fromStored(value);

  // Sincroniza mês exibido quando valor externo muda
  useEffect(() => {
    const d = fromStored(value);
    if (d) setMonth(d);
  }, [value]);

  const handleSelect = useCallback((day: Date | undefined) => {
    if (!day) return;
    onChange(toStored(day));
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  }, [onChange]);

  const hasValue = Boolean(value);

  return (
    <div className={`date-picker-wrap${className ? ` ${className}` : ''}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        className={`date-picker-trigger${hasValue ? ' has-value' : ''}${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="date-picker-icon">
          <IconCalendar />
        </span>
        <span className="date-picker-value">
          {hasValue ? displayDate(value) : <span className="date-picker-placeholder">{placeholder}</span>}
        </span>
        {hasValue && (
          <span
            className="date-picker-clear"
            onClick={handleClear}
            role="button"
            aria-label="Limpar data"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
          >
            <IconX />
          </span>
        )}
      </button>

      {/* Popover com calendário */}
      {open && (
        <CalendarPopover triggerRef={triggerRef} onClose={() => setOpen(false)}>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            locale={ptBR}
            disabled={disablePast ? { before: new Date() } : undefined}
            showOutsideDays
            classNames={{
              root: 'rdp-root',
              months: 'rdp-months',
              month: 'rdp-month',
              month_caption: 'rdp-caption',
              caption_label: 'rdp-caption-label',
              nav: 'rdp-nav',
              button_previous: 'rdp-nav-btn rdp-nav-prev',
              button_next: 'rdp-nav-btn rdp-nav-next',
              month_grid: 'rdp-table',
              weekdays: 'rdp-head-row',
              weekday: 'rdp-head-cell',
              week: 'rdp-row',
              day: 'rdp-cell',
              day_button: 'rdp-day',
              selected: 'rdp-day-selected',
              today: 'rdp-day-today',
              outside: 'rdp-day-outside',
              disabled: 'rdp-day-disabled',
              range_start: 'rdp-day-range-start',
              range_end: 'rdp-day-range-end',
              range_middle: 'rdp-day-range-middle',
              hidden: 'rdp-day-hidden',
            }}
            components={{
              PreviousMonthButton: (props) => (
                <button {...props} className="rdp-nav-btn rdp-nav-prev" type="button" aria-label="Mês anterior">
                  <IconChevronLeft />
                </button>
              ),
              NextMonthButton: (props) => (
                <button {...props} className="rdp-nav-btn rdp-nav-next" type="button" aria-label="Próximo mês">
                  <IconChevronRight />
                </button>
              ),
            }}
          />
        </CalendarPopover>
      )}
    </div>
  );
}
