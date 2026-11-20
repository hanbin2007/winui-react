import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { Portal } from './theme';
import { clamp, cx, getFocusable, useEvent, useIsoLayoutEffect, usePresence } from './utils';

export type PopupSide = 'top' | 'bottom' | 'left' | 'right';
export type Placement = PopupSide | `${PopupSide}-start` | `${PopupSide}-end`;
export type PopupAnimation = 'slide' | 'fade' | 'scale' | 'split' | 'none';

export interface PopupPosition {
  left: number;
  top: number;
  side?: PopupSide;
  /** Extra CSS variables/styles for the surface (used by the split-open motion). */
  style?: CSSProperties;
}

export interface PopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  open: boolean;
  /** Element the popup is placed against. */
  anchor?: RefObject<HTMLElement | null> | HTMLElement | null;
  /** Viewport point to place against instead of an element (context menus). */
  point?: { x: number; y: number } | null;
  placement?: Placement;
  /** Gap between anchor and popup in px. */
  offset?: number;
  /** Make the popup at least ('min') or exactly (true) as wide as the anchor. */
  matchAnchorWidth?: boolean | 'min';
  animation?: PopupAnimation;
  /** Called on outside press or Escape. */
  onDismiss?: () => void;
  lightDismiss?: boolean;
  /** Move focus into the popup when it opens, and back when it closes. */
  autoFocus?: boolean;
  /** Custom placement. Receives the anchor rect and the popup size. */
  position?: (anchor: DOMRect, size: { width: number; height: number }) => PopupPosition;
  children?: ReactNode;
}

const OPPOSITE: Record<PopupSide, PopupSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
const MARGIN = 4;

function place(
  a: DOMRect,
  w: number,
  h: number,
  placement: Placement,
  offset: number,
): PopupPosition {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const [rawSide, align = 'center'] = placement.split('-') as [PopupSide, string?];
  let side = rawSide;
  const space: Record<PopupSide, number> = {
    top: a.top,
    bottom: vh - a.bottom,
    left: a.left,
    right: vw - a.right,
  };
  const vertical = side === 'top' || side === 'bottom';
  const need = (vertical ? h : w) + offset + MARGIN;
  if (space[side] < need && space[OPPOSITE[side]] > space[side]) side = OPPOSITE[side];

  let left: number;
  let top: number;
  if (vertical) {
    top = side === 'bottom' ? a.bottom + offset : a.top - offset - h;
    left =
      align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + a.width / 2 - w / 2;
  } else {
    left = side === 'right' ? a.right + offset : a.left - offset - w;
    top =
      align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + a.height / 2 - h / 2;
  }
  left = clamp(left, MARGIN, Math.max(MARGIN, vw - w - MARGIN));
  top = clamp(top, MARGIN, Math.max(MARGIN, vh - h - MARGIN));
  return { left: Math.round(left), top: Math.round(top), side };
}

function resolveAnchor(anchor: PopupProps['anchor']): HTMLElement | null {
  if (!anchor) return null;
  return anchor instanceof HTMLElement ? anchor : anchor.current;
}

function PopupSurface({
  open,
  anchor,
  point,
  placement = 'bottom',
  offset = 4,
  matchAnchorWidth,
  animation = 'slide',
  onDismiss,
  lightDismiss = true,
  autoFocus = true,
  position,
  className,
  style,
  children,
  onKeyDown,
  ...rest
}: PopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const insideRef = useRef(false);
  const [pos, setPos] = useState<PopupPosition | null>(null);
  const [anchorWidth, setAnchorWidth] = useState<number | undefined>();
  const dismiss = useEvent(onDismiss);
  const customPosition = useEvent(position);
  const hasCustom = !!position;

  const update = useEvent(() => {
    const el = ref.current;
    if (!el) return;
    const anchorEl = resolveAnchor(anchor);
    const rect = point
      ? new DOMRect(point.x, point.y, 0, 0)
      : anchorEl
        ? anchorEl.getBoundingClientRect()
        : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
    if (matchAnchorWidth) setAnchorWidth(rect.width);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const next = hasCustom
      ? customPosition(rect, { width: w, height: h })
      : place(rect, w, h, placement, offset);
    setPos((prev) =>
      prev &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.side === next.side &&
      JSON.stringify(prev.style) === JSON.stringify(next.style)
        ? prev
        : next,
    );
  });

  useIsoLayoutEffect(() => {
    update();
    // A second pass picks up the width set by matchAnchorWidth.
    const raf = requestAnimationFrame(update);
    const el = ref.current;
    const ro = typeof ResizeObserver !== 'undefined' && el ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [update, placement, offset, point?.x, point?.y]);

  // Light dismiss: a press anywhere outside this popup (and its child popups) closes it.
  useEffect(() => {
    if (!open || !lightDismiss) return;
    const onDown = (e: PointerEvent) => {
      const inside = insideRef.current;
      insideRef.current = false;
      if (inside) return;
      const anchorEl = resolveAnchor(anchor);
      if (anchorEl && e.target instanceof Node && anchorEl.contains(e.target)) return;
      dismiss();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, lightDismiss, anchor, dismiss]);

  // Focus in on open, back out on close.
  useEffect(() => {
    if (!autoFocus) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    if (el) {
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? el;
      target.focus({ preventScroll: true });
    }
    return () => {
      const active = document.activeElement;
      if (prev && (active === document.body || (el && active && el.contains(active)))) {
        prev.focus?.({ preventScroll: true });
      }
    };
  }, [autoFocus]);

  return (
    <div
      {...rest}
      ref={ref}
      tabIndex={-1}
      className={cx('wui-popup', className)}
      data-state={open ? 'open' : 'closed'}
      data-anim={animation}
      data-side={pos?.side ?? placement.split('-')[0]}
      data-positioned={pos ? 'true' : 'false'}
      style={{
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        ...(matchAnchorWidth === true ? { width: anchorWidth } : null),
        ...(matchAnchorWidth === 'min' ? { minWidth: anchorWidth } : null),
        ...pos?.style,
        ...style,
      }}
      onPointerDownCapture={() => {
        insideRef.current = true;
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Escape') {
          e.stopPropagation();
          dismiss();
        } else if (e.key === 'Tab' && autoFocus && ref.current) {
          // Keep Tab inside the popup while it is open.
          const items = getFocusable(ref.current);
          if (items.length === 0) {
            e.preventDefault();
            return;
          }
          const first = items[0];
          const last = items[items.length - 1];
          const active = document.activeElement;
          if (e.shiftKey && (active === first || active === ref.current)) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * The positioned, light-dismissable layer under every flyout, menu, tooltip and
 * picker. Handles placement with flipping, outside-press dismissal, focus, and
 * the open/close motion.
 */
export function Popup(props: PopupProps) {
  const { mounted } = usePresence(props.open, 90);
  if (!mounted) return null;
  return (
    <Portal>
      <PopupSurface {...props} />
    </Portal>
  );
}
