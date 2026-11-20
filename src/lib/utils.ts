import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
  type Ref,
} from 'react';

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  let out = '';
  for (const p of parts) {
    if (p) out = out ? `${out} ${p}` : p;
  }
  return out;
}

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** A stable function identity that always calls the latest callback. */
export function useEvent<A extends unknown[], R>(fn: ((...args: A) => R) | undefined) {
  const ref = useRef(fn);
  useIsoLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current?.(...args) as R, []);
}

/** State that can be controlled (value) or uncontrolled (defaultValue). */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const change = useEvent(onChange);
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      change(next);
    },
    [controlled, change],
  );
  return [current, set];
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as MutableRefObject<T | null>).current = node;
    }
  };
}

/** Keeps a node mounted for `exitMs` after `open` turns false so it can animate out. */
export function usePresence(open: boolean, exitMs = 100) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(t);
  }, [open, exitMs]);
  return { mounted: open || mounted, state: open ? ('open' as const) : ('closed' as const) };
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  );
}

/**
 * The WinUI selection-indicator motion: the pill stretches from the old item to the
 * new one (accelerating), then its trailing edge catches up (decelerating).
 *
 * Render one element with `data-wui-indicator` inside the selected item, mark each
 * item with `data-wui-indicator-host`, and call this with the container and the key.
 */
export function useStretchIndicator(
  containerRef: { current: HTMLElement | null },
  selectedKey: unknown,
  orientation: 'vertical' | 'horizontal' = 'vertical',
) {
  const prevHost = useRef<HTMLElement | null>(null);
  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ind = container.querySelector<HTMLElement>('[data-wui-indicator]');
    const host = ind?.closest<HTMLElement>('[data-wui-indicator-host]') ?? null;
    const old = prevHost.current;
    prevHost.current = host;
    if (!ind || !host || !old || old === host || !old.isConnected) return;
    if (typeof ind.animate !== 'function') return;
    const a = old.getBoundingClientRect();
    const b = host.getBoundingClientRect();
    const vertical = orientation === 'vertical';
    const d = vertical ? a.top - b.top : a.left - b.left;
    const size = vertical ? ind.offsetHeight : ind.offsetWidth;
    if (Math.abs(d) < 1 || size === 0) return;
    const T = vertical ? 'translateY' : 'translateX';
    const S = vertical ? 'scaleY' : 'scaleX';
    const stretch = (Math.abs(d) + size) / size;
    ind.animate(
      [
        { transform: `${T}(${d}px) ${S}(1)`, easing: 'cubic-bezier(0.9, 0.1, 1, 0.2)', offset: 0 },
        {
          transform: `${T}(${d < 0 ? d : 0}px) ${S}(${stretch})`,
          easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
          offset: 0.333,
        },
        { transform: `${T}(0px) ${S}(1)`, offset: 1 },
      ],
      { duration: 600 },
    );
  }, [selectedKey]);
}
