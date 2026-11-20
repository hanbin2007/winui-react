import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { cx, useControllable } from '../utils';
import { Button } from './Button';
import { Field } from './TextBox';

const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

type CalView = 'month' | 'year' | 'decade';
type CalAnim = 'next' | 'prev' | 'zoomIn' | 'zoomOut' | undefined;

export interface CalendarViewProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  /** 0 = Sunday (default), 1 = Monday, and so on. */
  firstDayOfWeek?: number;
  /** BCP 47 locale for month and weekday names. Defaults to the browser's. */
  locale?: string;
  className?: string;
  style?: CSSProperties;
  /** Internal: borderless variant for use inside a flyout. */
  flyout?: boolean;
}

/** A month calendar. Click the title to zoom out to months, then years. */
export function CalendarView({
  value,
  defaultValue = null,
  onValueChange,
  minDate,
  maxDate,
  firstDayOfWeek = 0,
  locale,
  className,
  style,
  flyout,
}: CalendarViewProps) {
  const [selected, setSelected] = useControllable<Date | null>(value, defaultValue, onValueChange);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState<CalView>('month');
  const [cursor, setCursor] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [anim, setAnim] = useState<{ kind: CalAnim; n: number }>({ kind: undefined, n: 0 });
  const wheelAt = useRef(0);
  const play = (kind: CalAnim) => setAnim((a) => ({ kind, n: a.n + 1 }));

  const fmt = useMemo(
    () => ({
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      full: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    }),
    [locale],
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const decadeStart = Math.floor(year / 10) * 10;

  const step = (dir: 1 | -1) => {
    if (view === 'month') setCursor(new Date(year, month + dir, 1));
    else if (view === 'year') setCursor(new Date(year + dir, month, 1));
    else setCursor(new Date(year + dir * 10, month, 1));
    play(dir === 1 ? 'next' : 'prev');
  };
  const outOfRange = (d: Date) =>
    (!!minDate && d < startOfDay(minDate)) || (!!maxDate && d > startOfDay(maxDate));

  const title =
    view === 'month'
      ? fmt.monthYear.format(cursor)
      : view === 'year'
        ? String(year)
        : `${decadeStart} - ${decadeStart + 9}`;

  let body: ReactNode;
  if (view === 'month') {
    const first = new Date(year, month, 1);
    const lead = (first.getDay() - firstDayOfWeek + 7) % 7;
    const days = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - lead + i));
    // 2023-01-01 was a Sunday; use it to name the weekdays.
    const names = Array.from({ length: 7 }, (_, i) =>
      fmt.weekday.format(new Date(2023, 0, 1 + ((i + firstDayOfWeek) % 7))).slice(0, 2),
    );
    body = (
      <>
        <div className="wui-calendar__weekdays" aria-hidden="true">
          {names.map((n, i) => (
            <span key={i} className="wui-calendar__weekday">
              {n}
            </span>
          ))}
        </div>
        <div className="wui-calendar__days" role="grid">
          {days.map((d) => {
            const outside = d.getMonth() !== month;
            return (
              <button
                key={d.getTime()}
                type="button"
                tabIndex={sameDay(d, selected ?? today) ? 0 : -1}
                className="wui-calendar__cell"
                aria-label={fmt.full.format(d)}
                aria-selected={sameDay(d, selected)}
                data-today={sameDay(d, today) || undefined}
                data-outside={outside || undefined}
                disabled={outOfRange(d)}
                onClick={() => {
                  setSelected(d);
                  if (outside) {
                    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                    play(d < first ? 'prev' : 'next');
                  }
                }}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (view === 'year') {
    body = (
      <div className="wui-calendar__grid4" role="grid">
        {Array.from({ length: 16 }, (_, i) => {
          const d = new Date(year, i, 1);
          return (
            <button
              key={i}
              type="button"
              className="wui-calendar__cell"
              data-outside={i > 11 || undefined}
              data-today={(d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) || undefined}
              onClick={() => {
                setCursor(d);
                setView('month');
                play('zoomIn');
              }}
            >
              {fmt.monthShort.format(d)}
            </button>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div className="wui-calendar__grid4" role="grid">
        {Array.from({ length: 16 }, (_, i) => {
          const y = decadeStart + i;
          return (
            <button
              key={y}
              type="button"
              className="wui-calendar__cell"
              data-outside={i > 9 || undefined}
              data-today={y === today.getFullYear() || undefined}
              onClick={() => {
                setCursor(new Date(y, month, 1));
                setView('year');
                play('zoomIn');
              }}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cx('wui-calendar', flyout && 'wui-calendar--flyout', className)} style={style}>
      <div className="wui-calendar__header">
        <Button
          appearance="subtle"
          className="wui-calendar__title"
          disabled={view === 'decade'}
          onClick={() => {
            setView(view === 'month' ? 'year' : 'decade');
            play('zoomOut');
          }}
        >
          {title}
        </Button>
        <Button appearance="subtle" className="wui-calendar__nav" aria-label="Previous" icon={<Icon name="caretUp" size={12} />} onClick={() => step(-1)} />
        <Button appearance="subtle" className="wui-calendar__nav" aria-label="Next" icon={<Icon name="caretDown" size={12} />} onClick={() => step(1)} />
      </div>
      <div
        className="wui-calendar__body"
        onWheel={(e) => {
          const now = Date.now();
          if (now - wheelAt.current < 220 || Math.abs(e.deltaY) < 4) return;
          wheelAt.current = now;
          step(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <div key={`${view}-${anim.n}`} className="wui-calendar__view" data-anim={anim.kind}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CalendarDatePicker ---------------- */

export interface CalendarDatePickerProps
  extends Pick<CalendarViewProps, 'minDate' | 'maxDate' | 'firstDayOfWeek' | 'locale'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: ReactNode;
  header?: ReactNode;
  formatDate?: (date: Date) => string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** A button that opens a calendar in a flyout to pick one date. */
export function CalendarDatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = 'Pick a date',
  header,
  formatDate,
  disabled,
  className,
  style,
  locale,
  ...calendar
}: CalendarDatePickerProps) {
  const [date, setDate] = useControllable<Date | null>(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const text = date ? (formatDate ? formatDate(date) : date.toLocaleDateString(locale)) : placeholder;
  return (
    <Field header={header} disabled={disabled} className={className} style={style}>
      <button
        ref={ref}
        type="button"
        className="wui-picker wui-picker--calendar wui-elev wui-focusable"
        data-empty={!date || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{text}</span>
        <span className="wui-picker__glyph">
          <Icon name="calendar" />
        </span>
      </button>
      <Popup
        open={open}
        anchor={ref}
        placement="bottom-start"
        onDismiss={() => setOpen(false)}
        className="wui-flyout wui-acrylic wui-calendar-flyout"
        role="dialog"
      >
        <CalendarView
          {...calendar}
          locale={locale}
          flyout
          value={date}
          onValueChange={(d) => {
            setDate(d);
            setOpen(false);
          }}
        />
      </Popup>
    </Field>
  );
}
