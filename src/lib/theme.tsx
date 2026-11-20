import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from './utils';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Backdrop = 'none' | 'solid' | 'mica' | 'micaAlt';

interface ThemeContextValue {
  theme: ResolvedTheme;
  vars: CSSProperties;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', vars: {} });

/** The resolved theme ('light' | 'dark') of the nearest ThemeProvider. */
export function useTheme(): ResolvedTheme {
  return useContext(ThemeContext).theme;
}

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let hue = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, s * 100, l * 100];
}

/** Derive the six accent shades Windows generates from one accent colour. */
export function accentPalette(accent: string): Record<string, string> | null {
  const hsl = hexToHsl(accent);
  if (!hsl) return null;
  const [h, s, l] = hsl;
  const shade = (dl: number, ds = 0, dh = 0) =>
    `hsl(${(h + dh + 360) % 360} ${Math.min(100, Math.max(0, s + ds))}% ${Math.min(96, Math.max(4, l + dl))}%)`;
  return {
    '--wui-accent-base': accent,
    '--wui-accent-light1': shade(9),
    '--wui-accent-light2': shade(27, 10, -6),
    '--wui-accent-light3': shade(38, 10, -12),
    '--wui-accent-dark1': shade(-5.5, 0, 2),
    '--wui-accent-dark2': shade(-18.5),
    '--wui-accent-dark3': shade(-28.5),
  };
}

function useSystemTheme(enabled: boolean): ResolvedTheme {
  const [sys, setSys] = useState<ResolvedTheme>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );
  useEffect(() => {
    if (!enabled || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSys(mq.matches ? 'dark' : 'light');
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [enabled]);
  return sys;
}

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** 'light', 'dark', or 'system' (follows the OS). Default 'system'. */
  theme?: ThemeMode;
  /** Accent colour as hex. The light/dark shades are derived from it. */
  accentColor?: string;
  /** Window material painted behind the content. */
  backdrop?: Backdrop;
  /** CSS background (image or gradient) that Mica samples, standing in for the desktop wallpaper. */
  wallpaper?: string;
  children?: ReactNode;
}

/**
 * Provides theme tokens to everything inside it. Can be nested to restyle a
 * subtree (like RequestedTheme on a XAML element).
 */
export function ThemeProvider({
  theme = 'system',
  accentColor,
  backdrop = 'none',
  wallpaper,
  className,
  style,
  children,
  ...rest
}: ThemeProviderProps) {
  const system = useSystemTheme(theme === 'system');
  const resolved: ResolvedTheme = theme === 'system' ? system : theme;
  const parentVars = useContext(ThemeContext).vars;
  const vars = useMemo(() => {
    // A nested provider keeps the accent and wallpaper of the one around it.
    const v: Record<string, string> = { ...(parentVars as Record<string, string>) };
    if (accentColor) Object.assign(v, accentPalette(accentColor) ?? {});
    if (wallpaper) v['--wui-wallpaper'] = wallpaper;
    return v as CSSProperties;
  }, [accentColor, wallpaper, parentVars]);
  const ctx = useMemo(() => ({ theme: resolved, vars }), [resolved, vars]);
  return (
    <ThemeContext.Provider value={ctx}>
      <div
        {...rest}
        className={cx(
          'wui-root',
          backdrop !== 'none' && 'wui-app',
          backdrop === 'mica' && 'wui-mica',
          backdrop === 'micaAlt' && 'wui-mica-alt',
          className,
        )}
        data-theme={resolved}
        style={{
          ...(backdrop === 'solid' ? { background: 'var(--wui-solid-bg-base)' } : null),
          ...vars,
          ...style,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Renders children into document.body, carrying the current theme with them. */
export function Portal({ children }: { children: ReactNode }) {
  const ctx = useContext(ThemeContext);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return createPortal(
    <div className="wui-root wui-portal-root" data-theme={ctx.theme} style={ctx.vars}>
      {children}
    </div>,
    document.body,
  );
}
