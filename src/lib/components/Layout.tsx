import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { clamp, cx, mergeRefs, useControllable, useEvent, usePresence } from '../utils';

/* ---------------- Expander ---------------- */

export interface ExpanderProps {
  header: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Which way the content opens. Default 'down'. */
  direction?: 'down' | 'up';
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** A header that shows or hides a content area; the content slides out from under it. */
export function Expander({
  header,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  direction = 'down',
  disabled,
  className,
  style,
  children,
}: ExpanderProps) {
  const [open, setOpen] = useControllable(expanded, defaultExpanded, onExpandedChange);
  const { mounted, state } = usePresence(open, 170);
  return (
    <div className={cx('wui-expander', className)} style={style} data-open={open || undefined} data-direction={direction}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        className="wui-expander__header wui-focusable"
        onClick={(e) => {
          // Clicks on controls placed in the header should not toggle it.
          if ((e.target as HTMLElement).closest('[data-wui-noexpand]')) return;
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <div className="wui-expander__header-content">{header}</div>
        <span className="wui-expander__chevron">
          <Icon name={direction === 'up' ? 'chevronUp' : 'chevronDown'} size={12} />
        </span>
      </div>
      {mounted && (
        <div className="wui-expander__clip" data-state={state}>
          <div className="wui-expander__content">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Card ---------------- */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover and pressed fills. */
  clickable?: boolean;
}

/** A plain card surface (CardBackgroundFillColorDefault with a card stroke). */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { clickable, className, ...rest },
  ref,
) {
  return <div ref={ref} {...rest} className={cx('wui-card', className)} data-clickable={clickable || undefined} />;
});

/* ---------------- SettingsCard ---------------- */

export interface SettingsCardProps {
  header: ReactNode;
  description?: ReactNode;
  icon?: IconSource;
  /** Makes the whole card a button with a chevron. */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** The control on the right (ToggleSwitch, ComboBox, Button...). */
  children?: ReactNode;
}

/** A row from a Settings page: icon, title, description, and a control on the right. */
export function SettingsCard({
  header,
  description,
  icon,
  onClick,
  disabled,
  className,
  style,
  children,
}: SettingsCardProps) {
  const inner = (
    <>
      {icon != null && <span className="wui-settingscard__icon">{renderIcon(icon, 20)}</span>}
      <span className="wui-settingscard__text">
        <span>{header}</span>
        {description != null && <span className="wui-settingscard__description">{description}</span>}
      </span>
      {children != null && (
        <span className="wui-settingscard__content" data-wui-noexpand="">
          {children}
        </span>
      )}
      {onClick && <Icon name="chevronRight" size={12} className="wui-settingscard__chevron" />}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={cx('wui-settingscard wui-focusable', className)}
        style={style}
        disabled={disabled}
        data-disabled={disabled || undefined}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={cx('wui-settingscard', className)} style={style} data-disabled={disabled || undefined}>
      {inner}
    </div>
  );
}

export interface SettingsExpanderProps extends Omit<SettingsCardProps, 'onClick' | 'children'> {
  /** The control shown in the header row. */
  content?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** SettingsCard rows shown when expanded. */
  children?: ReactNode;
}

/** A SettingsCard that expands to show more settings rows. */
export function SettingsExpander({
  header,
  description,
  icon,
  content,
  disabled,
  className,
  style,
  expanded,
  defaultExpanded,
  onExpandedChange,
  children,
}: SettingsExpanderProps) {
  return (
    <Expander
      className={cx('wui-settingsexpander', className)}
      style={style}
      disabled={disabled}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      header={
        <SettingsCard header={header} description={description} icon={icon} disabled={disabled}>
          {content}
        </SettingsCard>
      }
    >
      {children}
    </Expander>
  );
}

/* ---------------- ScrollView ---------------- */

interface BarProps {
  axis: 'v' | 'h';
  pos: number;
  size: number;
  view: number;
  visible: boolean;
  scrollTo: (pos: number) => void;
}

function ScrollBar({ axis, pos, size, view, visible, scrollTo }: BarProps) {
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef({ start: 0, pos: 0, travel: 1 });
  useEffect(() => () => clearTimeout(timer.current), []);

  const range = size - view;
  if (range <= 1) return null;
  const ratio = clamp(pos / range, 0, 1);
  const len = `max(30px, ${(view / size) * 100}%)`;
  const vertical = axis === 'v';
  const thumbStyle: CSSProperties = vertical
    ? { height: len, top: `calc((100% - ${len}) * ${ratio})` }
    : { width: len, left: `calc((100% - ${len}) * ${ratio})` };
  const coord = (e: { clientX: number; clientY: number }) => (vertical ? e.clientY : e.clientX);
  const setExpandLater = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setExpanded(next), ms);
  };

  return (
    <div
      className={cx('wui-scrollbar', vertical ? 'wui-scrollbar--v' : 'wui-scrollbar--h')}
      data-visible={visible || expanded || dragging || undefined}
      data-expanded={expanded || dragging || undefined}
      onPointerEnter={() => setExpandLater(true, 250)}
      onPointerLeave={() => setExpandLater(false, 700)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="wui-scrollbar__arrow"
        onClick={() => scrollTo(pos - 48)}
      >
        <Icon name="caretUp" size={8} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} />
      </button>
      <div
        ref={track}
        className="wui-scrollbar__track"
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const r = e.currentTarget.getBoundingClientRect();
          const at = (coord(e) - (vertical ? r.top : r.left)) / (vertical ? r.height : r.width);
          scrollTo(pos + (at > ratio ? view : -view) * 0.9);
        }}
      >
        <div
          className="wui-scrollbar__thumb"
          style={thumbStyle}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const t = track.current!.getBoundingClientRect();
            const th = e.currentTarget.getBoundingClientRect();
            drag.current = {
              start: coord(e),
              pos,
              travel: Math.max(1, (vertical ? t.height - th.height : t.width - th.width)),
            };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            const d = drag.current;
            scrollTo(d.pos + ((coord(e) - d.start) / d.travel) * range);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        />
      </div>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="wui-scrollbar__arrow"
        onClick={() => scrollTo(pos + 48)}
      >
        <Icon name="caretDown" size={8} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} />
      </button>
    </div>
  );
}

export interface ScrollViewProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref to the scrolling element. */
  viewportRef?: Ref<HTMLDivElement>;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
}

/**
 * A scroll container with WinUI's scroll bars: a thin line that appears while you
 * scroll or hover, and widens into a full bar with arrows when you point at it.
 */
export function ScrollView({
  viewportRef,
  viewportClassName,
  viewportStyle,
  className,
  children,
  ...rest
}: ScrollViewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ top: 0, left: 0, h: 0, w: 0, vh: 0, vw: 0 });
  const [hover, setHover] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const measure = useEvent(() => {
    const el = viewport.current;
    if (!el) return;
    setM((prev) => {
      const next = {
        top: el.scrollTop,
        left: el.scrollLeft,
        h: el.scrollHeight,
        w: el.scrollWidth,
        vh: el.clientHeight,
        vw: el.clientWidth,
      };
      return (Object.keys(next) as Array<keyof typeof next>).every((k) => prev[k] === next[k]) ? prev : next;
    });
  });

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    const mo = new MutationObserver(() => {
      for (const child of Array.from(el.children)) ro.observe(child);
      measure();
    });
    mo.observe(el, { childList: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      clearTimeout(idle.current);
    };
  }, [measure]);

  const visible = hover || scrolling;
  return (
    <div
      {...rest}
      className={cx('wui-scrollview', className)}
      onPointerEnter={(e) => {
        setHover(true);
        rest.onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHover(false);
        rest.onPointerLeave?.(e);
      }}
    >
      <div
        ref={mergeRefs(viewport, viewportRef)}
        className={cx('wui-scrollview__viewport', viewportClassName)}
        style={viewportStyle}
        onScroll={() => {
          measure();
          setScrolling(true);
          clearTimeout(idle.current);
          idle.current = setTimeout(() => setScrolling(false), 900);
        }}
      >
        {children}
      </div>
      <ScrollBar
        axis="v"
        pos={m.top}
        size={m.h}
        view={m.vh}
        visible={visible}
        scrollTo={(top) => viewport.current?.scrollTo({ top })}
      />
      <ScrollBar
        axis="h"
        pos={m.left}
        size={m.w}
        view={m.vw}
        visible={visible}
        scrollTo={(left) => viewport.current?.scrollTo({ left })}
      />
    </div>
  );
}

/* ---------------- PersonPicture ---------------- */

export interface PersonPictureProps {
  displayName?: string;
  /** Overrides the initials derived from displayName. */
  initials?: string;
  /** Profile photo URL. */
  src?: string;
  /** Diameter in px. Default 48. */
  size?: number;
  /** Usually an <InfoBadge />. */
  badge?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function initialsOf(name?: string) {
  if (!name) return '';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** A round avatar: photo, initials, or a generic person glyph. */
export function PersonPicture({ displayName, initials, src, size = 48, badge, className, style }: PersonPictureProps) {
  const text = initials ?? initialsOf(displayName);
  return (
    <span
      className={cx('wui-person', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), lineHeight: 1, ...style }}
      role="img"
      aria-label={displayName}
    >
      {src ? <img src={src} alt="" /> : text ? text : <Icon name="person" size={Math.round(size * 0.5)} />}
      {badge != null && <span className="wui-person__badge" style={{ display: 'inline-flex', borderRadius: 8 }}>{badge}</span>}
    </span>
  );
}
