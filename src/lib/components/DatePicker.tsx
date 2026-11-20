import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Icon } from '../Icon';
import { Popup, type PopupPosition } from '../Popup';
import { clamp, useControllable, useEvent } from '../utils';
import { Button } from './Button';
import { Field } from './TextBox';

const mod = (n: number, m: number) => ((n % m) + m) % m;
const ROW = 40;
const WINDOW = 8;

/* ---------------- LoopingSelector ---------------- */

interface LoopingSelectorProps {
  items: string[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Wrap around endlessly. Default true. */
  loop?: boolean;
  label: string;
  flex?: number;
  autoFocus?: boolean;
}

/** One scrolling column of a date/time picker flyout. */
export function LoopingSelector({
  items,
  index,
  onIndexChange,
  loop = true,
  label,
  flex = 1,
  autoFocus,
}: LoopingSelectorProps) {
  const n = items.length;
  // `k` is an unbounded position; the shown item is items[k mod n].
  const [k, setK] = useState(index);
  const ref = useRef<HTMLDivElement>(null);
  const wheelAt = useRef(0);

  // Follow outside changes by the shortest path.
  useEffect(() => {
    setK((cur) => {
      if (!loop) return clamp(index, 0, n - 1);
      if (mod(cur, n) === index) return cur;
      let d = index - mod(cur, n);
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      return cur + d;
    });
  }, [index, n, loop]);

  const go = useEvent((next: number) => {
    const target = loop ? next : clamp(next, 0, n - 1);
    if (target === k) return;
    setK(target);
    onIndexChange(mod(target, n));
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelAt.current < 45 || Math.abs(e.deltaY) < 2) return;
      wheelAt.current = now;
      go(kRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [go]);
  const kRef = useRef(k);
  kRef.current = k;

  const rows: number[] = [];
  for (let abs = k - WINDOW; abs <= k + WINDOW; abs++) {
    if (!loop && (abs < 0 || abs >= n)) continue;
    rows.push(abs);
  }

  return (
    <div
      ref={ref}
      className="wui-loop"
      style={{ flexGrow: flex }}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      data-autofocus={autoFocus || undefined}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') (e.preventDefault(), go(k + 1));
        else if (e.key === 'ArrowUp') (e.preventDefault(), go(k - 1));
        else if (e.key === 'PageDown') (e.preventDefault(), go(k + 4));
        else if (e.key === 'PageUp') (e.preventDefault(), go(k - 4));
        else if (e.key === 'Home' && !loop) (e.preventDefault(), go(0));
        else if (e.key === 'End' && !loop) (e.preventDefault(), go(n - 1));
      }}
    >
      {rows.map((abs) => (
        <div
          key={abs}
          role="option"
          aria-selected={abs === k}
          className="wui-loop__item"
          data-current={abs === k || undefined}
          style={{ transform: `translateY(${(abs - k) * ROW}px)` }}
          onClick={() => go(abs)}
        >
          {items[mod(abs, n)]}
        </div>
      ))}
      <button type="button" tabIndex={-1} aria-hidden="true" className="wui-loop__nudge wui-loop__nudge--up" onClick={() => go(k - 1)}>
        <Icon name="caretUp" size={12} />
      </button>
      <button type="button" tabIndex={-1} aria-hidden="true" className="wui-loop__nudge wui-loop__nudge--down" onClick={() => go(k + 1)}>
        <Icon name="caretDown" size={12} />
      </button>
    </div>
  );
}

/* ---------------- Shared flyout ---------------- */

interface PickerFlyoutProps {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  onAccept: () => void;
  onDismiss: () => void;
  children: ReactNode;
}

function PickerFlyout({ open, anchor, onAccept, onDismiss, children }: PickerFlyoutProps) {
  // Centre the highlighted row over the button, like WinUI.
  const position = (a: DOMRect, size: { width: number; height: number }): PopupPosition => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const top = Math.round(clamp(a.top + a.height / 2 - 181, 4, Math.max(4, vh - size.height - 4)));
    const left = Math.round(clamp(a.left, 4, Math.max(4, vw - size.width - 4)));
    return {
      left,
      top,
      side: 'bottom',
      style: {
        '--wui-split-top': `${clamp(a.top - top, 0, size.height)}px`,
        '--wui-split-bottom': `${clamp(top + size.height - a.bottom, 0, size.height)}px`,
      } as CSSProperties,
    };
  };
  return (
    <Popup
      open={open}
      anchor={anchor}
      animation="split"
      matchAnchorWidth
      position={position}
      onDismiss={onDismiss}
      className="wui-pickerflyout wui-acrylic"
      role="dialog"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onAccept();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const cols = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.wui-loop'));
          const i = cols.indexOf(document.activeElement as HTMLElement);
          if (i < 0) return;
          e.preventDefault();
          cols[clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, cols.length - 1)]?.focus();
        }
      }}
    >
      <div className="wui-pickerflyout__columns">
        <div className="wui-pickerflyout__highlight" />
        {children}
      </div>
      <div className="wui-pickerflyout__commands">
        <Button appearance="subtle" icon="accept" aria-label="Accept" onClick={onAccept} />
        <Button appearance="subtle" icon="dismiss" aria-label="Cancel" onClick={onDismiss} />
      </div>
    </Popup>
  );
}

/* ---------------- DatePicker ---------------- */

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date) => void;
  header?: ReactNode;
  /** First and last selectable year. Default: 100 years either side of today. */
  minYear?: number;
  maxYear?: number;
  locale?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** Month / day / year columns in a flyout that opens over the control. */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  header,
  minYear,
  maxYear,
  locale,
  disabled,
  className,
  style,
}: DatePickerProps) {
  const [date, setDate] = useControllable<Date | null>(
    value,
    defaultValue,
    onValueChange as (d: Date | null) => void,
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const thisYear = new Date().getFullYear();
  const y0 = minYear ?? thisYear - 100;
  const y1 = maxYear ?? thisYear + 100;
  const [draft, setDraft] = useState({ y: thisYear, m: 0, d: 1 });

  const months = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => f.format(new Date(2024, i, 1)));
  }, [locale]);
  const years = useMemo(() => Array.from({ length: y1 - y0 + 1 }, (_, i) => String(y0 + i)), [y0, y1]);
  const dayCount = daysIn(draft.y, draft.m);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => String(i + 1)), [dayCount]);

  const openFlyout = () => {
    const base = date ?? new Date();
    setDraft({ y: clamp(base.getFullYear(), y0, y1), m: base.getMonth(), d: base.getDate() });
    setOpen(true);
  };
  const patch = (p: Partial<typeof draft>) =>
    setDraft((cur) => {
      const next = { ...cur, ...p };
      next.d = Math.min(next.d, daysIn(next.y, next.m));
      return next;
    });

  return (
    <Field header={header} disabled={disabled} className={className} style={style}>
      <button
        ref={ref}
        type="button"
        className="wui-picker wui-elev wui-focusable"
        data-empty={!date || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openFlyout())}
      >
        <span className="wui-picker__seg" style={{ flexGrow: 138 }}>
          {date ? months[date.getMonth()] : 'month'}
        </span>
        <span className="wui-picker__seg" style={{ flexGrow: 78 }}>
          {date ? date.getDate() : 'day'}
        </span>
        <span className="wui-picker__seg" style={{ flexGrow: 78 }}>
          {date ? date.getFullYear() : 'year'}
        </span>
      </button>
      <PickerFlyout
        open={open}
        anchor={ref}
        onDismiss={() => setOpen(false)}
        onAccept={() => {
          setDate(new Date(draft.y, draft.m, draft.d));
          setOpen(false);
        }}
      >
        <LoopingSelector label="Month" flex={138} items={months} index={draft.m} onIndexChange={(m) => patch({ m })} autoFocus />
        <LoopingSelector label="Day" flex={78} items={days} index={draft.d - 1} onIndexChange={(i) => patch({ d: i + 1 })} />
        <LoopingSelector label="Year" flex={78} items={years} index={draft.y - y0} onIndexChange={(i) => patch({ y: y0 + i })} loop={false} />
      </PickerFlyout>
    </Field>
  );
}

/* ---------------- TimePicker ---------------- */

export interface TimePickerProps {
  /** Time as "HH:mm" (24-hour), or null when unset. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  header?: ReactNode;
  /** '12' shows an AM/PM column (default); '24' does not. */
  clock?: '12' | '24';
  /** Step between minute choices. Default 1. */
  minuteIncrement?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parseTime(v: string | null | undefined): { h: number; m: number } | null {
  const hit = v ? /^(\d{1,2}):(\d{2})/.exec(v) : null;
  if (!hit) return null;
  return { h: clamp(Number(hit[1]), 0, 23), m: clamp(Number(hit[2]), 0, 59) };
}

/** Hour / minute / AM-PM columns in a flyout that opens over the control. */
export function TimePicker({
  value,
  defaultValue = null,
  onValueChange,
  header,
  clock = '12',
  minuteIncrement = 1,
  disabled,
  className,
  style,
}: TimePickerProps) {
  const [time, setTime] = useControllable<string | null>(
    value,
    defaultValue,
    onValueChange as (v: string | null) => void,
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState({ h: 0, m: 0 });
  const parsed = parseTime(time);
  const twelve = clock === '12';
  const inc = Math.max(1, Math.round(minuteIncrement));

  const hours = useMemo(
    () => (twelve ? Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i)) : Array.from({ length: 24 }, (_, i) => String(i))),
    [twelve],
  );
  const minutes = useMemo(
    () => Array.from({ length: Math.ceil(60 / inc) }, (_, i) => pad(i * inc)),
    [inc],
  );
  const hourText = (h: number) => (twelve ? String(h % 12 === 0 ? 12 : h % 12) : String(h));

  return (
    <Field header={header} disabled={disabled} className={className} style={style}>
      <button
        ref={ref}
        type="button"
        className="wui-picker wui-elev wui-focusable"
        data-empty={!parsed || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (open) return setOpen(false);
          const now = new Date();
          const base = parsed ?? { h: now.getHours(), m: now.getMinutes() };
          setDraft({ h: base.h, m: Math.floor(base.m / inc) * inc });
          setOpen(true);
        }}
      >
        <span className="wui-picker__seg">{parsed ? hourText(parsed.h) : 'hour'}</span>
        <span className="wui-picker__seg">{parsed ? pad(parsed.m) : 'minute'}</span>
        {twelve && <span className="wui-picker__seg">{parsed ? (parsed.h < 12 ? 'AM' : 'PM') : 'AM'}</span>}
      </button>
      <PickerFlyout
        open={open}
        anchor={ref}
        onDismiss={() => setOpen(false)}
        onAccept={() => {
          setTime(`${pad(draft.h)}:${pad(draft.m)}`);
          setOpen(false);
        }}
      >
        <LoopingSelector
          label="Hour"
          items={hours}
          index={twelve ? draft.h % 12 : draft.h}
          onIndexChange={(i) => setDraft((d) => ({ ...d, h: twelve ? (d.h >= 12 ? 12 : 0) + i : i }))}
          autoFocus
        />
        <LoopingSelector
          label="Minute"
          items={minutes}
          index={Math.floor(draft.m / inc)}
          onIndexChange={(i) => setDraft((d) => ({ ...d, m: i * inc }))}
        />
        {twelve && (
          <LoopingSelector
            label="AM or PM"
            items={['AM', 'PM']}
            index={draft.h < 12 ? 0 : 1}
            onIndexChange={(i) => setDraft((d) => ({ ...d, h: (d.h % 12) + (i === 1 ? 12 : 0) }))}
            loop={false}
          />
        )}
      </PickerFlyout>
    </Field>
  );
}
