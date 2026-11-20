import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { clamp, cx, useEvent } from '../utils';
import { ComboBox } from './ComboBox';
import { NumberBox, TextBox } from './TextBox';

interface Hsva {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
  a: number; // 0..1
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

const hex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0').toUpperCase();

function toHex(c: Hsva, withAlpha: boolean) {
  const [r, g, b] = hsvToRgb(c.h, c.s, c.v);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${withAlpha ? hex2(c.a * 255) : ''}`;
}

function parseHex(src: string): Hsva | null {
  let h = src.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3,4}$/i.test(h)) h = h.replace(/./g, (ch) => ch + ch);
  if (!/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) return null;
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  const [hh, s, v] = rgbToHsv(n(0), n(2), n(4));
  return { h: hh, s, v, a: h.length === 8 ? n(6) / 255 : 1 };
}

export interface ColorPickerProps {
  /** Colour as #RRGGBB, or #RRGGBBAA when alpha is enabled. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** Show the opacity slider and field. */
  alphaEnabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function useDrag(onMove: (x: number, y: number) => void) {
  const active = useRef(false);
  const at = (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onMove(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
  };
  return {
    onPointerDown: (e: RPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      active.current = true;
      at(e);
    },
    onPointerMove: (e: RPointerEvent<HTMLElement>) => {
      if (active.current) at(e);
    },
    onPointerUp: () => {
      active.current = false;
    },
    onPointerCancel: () => {
      active.current = false;
    },
  };
}

/** A hue/saturation spectrum with value (and optional alpha) sliders and text fields. */
export function ColorPicker({
  value,
  defaultValue = '#FFFFFF',
  onValueChange,
  alphaEnabled,
  className,
  style,
}: ColorPickerProps) {
  const [c, setC] = useState<Hsva>(() => parseHex(value ?? defaultValue) ?? { h: 0, s: 0, v: 1, a: 1 });
  const [mode, setMode] = useState('RGB');
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const emit = useEvent(onValueChange);
  const hex = toHex(c, !!alphaEnabled);

  // Follow a controlled value, but keep our own hue/saturation when the colour is the same.
  useEffect(() => {
    if (value === undefined) return;
    const next = parseHex(value);
    if (next && toHex(next, !!alphaEnabled) !== toHex(c, !!alphaEnabled)) setC(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (patch: Partial<Hsva>) => {
    const next = { ...c, ...patch };
    setC(next);
    const out = toHex(next, !!alphaEnabled);
    if (out !== hex) emit(out);
  };

  const [r, g, b] = hsvToRgb(c.h, c.s, c.v);
  const full = hsvToRgb(c.h, c.s, 1);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const rgbCss = `rgb(${r} ${g} ${b})`;

  const spectrum = useDrag((x, y) => update({ h: x * 359.99, s: 1 - y }));
  const valueDrag = useDrag((x) => update({ v: x }));
  const alphaDrag = useDrag((x) => update({ a: x }));

  const setRgb = (i: number, n: number | null) => {
    if (n === null) return;
    const rgb: [number, number, number] = [r, g, b];
    rgb[i] = clamp(Math.round(n), 0, 255);
    const [h, s, v] = rgbToHsv(...rgb);
    // Greys carry no hue; keep the current one so the cursor does not jump.
    update(s === 0 ? { s, v } : { h, s, v });
  };

  const channels =
    mode === 'RGB'
      ? [
          { label: 'Red', val: r, max: 255, set: (n: number | null) => setRgb(0, n) },
          { label: 'Green', val: g, max: 255, set: (n: number | null) => setRgb(1, n) },
          { label: 'Blue', val: b, max: 255, set: (n: number | null) => setRgb(2, n) },
        ]
      : [
          { label: 'Hue', val: Math.round(c.h), max: 359, set: (n: number | null) => n !== null && update({ h: clamp(n, 0, 359) }) },
          { label: 'Saturation', val: Math.round(c.s * 100), max: 100, set: (n: number | null) => n !== null && update({ s: clamp(n, 0, 100) / 100 }) },
          { label: 'Value', val: Math.round(c.v * 100), max: 100, set: (n: number | null) => n !== null && update({ v: clamp(n, 0, 100) / 100 }) },
        ];

  return (
    <div className={cx('wui-colorpicker', className)} style={style}>
      <div className="wui-colorpicker__top">
        <div
          className="wui-colorpicker__spectrum"
          tabIndex={0}
          role="application"
          aria-label="Colour spectrum: arrow keys change hue and saturation"
          style={{
            background: `linear-gradient(rgba(0,0,0,${1 - c.v}), rgba(0,0,0,${1 - c.v})), linear-gradient(to bottom, rgba(255,255,255,0), #fff), linear-gradient(to right, #f00 0%, #ff0 16.67%, #0f0 33.33%, #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00 100%)`,
          }}
          {...spectrum}
          onKeyDown={(e) => {
            const big = e.ctrlKey ? 10 : 1;
            if (e.key === 'ArrowRight') (e.preventDefault(), update({ h: clamp(c.h + big, 0, 359.99) }));
            else if (e.key === 'ArrowLeft') (e.preventDefault(), update({ h: clamp(c.h - big, 0, 359.99) }));
            else if (e.key === 'ArrowUp') (e.preventDefault(), update({ s: clamp(c.s + big / 100, 0, 1) }));
            else if (e.key === 'ArrowDown') (e.preventDefault(), update({ s: clamp(c.s - big / 100, 0, 1) }));
          }}
        >
          <span
            className="wui-colorpicker__cursor"
            data-dark={luminance > 0.6 || undefined}
            style={{ left: `${(c.h / 360) * 100}%`, top: `${(1 - c.s) * 100}%` }}
          />
        </div>
        <div
          className="wui-colorpicker__preview"
          style={{ '--wui-cp-color': `rgb(${r} ${g} ${b} / ${alphaEnabled ? c.a : 1})` } as CSSProperties}
        />
      </div>

      <div
        className="wui-colorpicker__slider"
        tabIndex={0}
        role="slider"
        aria-label="Value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(c.v * 100)}
        style={{ background: `linear-gradient(to right, #000, rgb(${full.join(' ')}))`, '--wui-cp-thumb': rgbCss } as CSSProperties}
        {...valueDrag}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') (e.preventDefault(), update({ v: clamp(c.v + 0.01, 0, 1) }));
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') (e.preventDefault(), update({ v: clamp(c.v - 0.01, 0, 1) }));
        }}
      >
        <span className="wui-colorpicker__slider-thumb" style={{ left: `calc(10px + (100% - 20px) * ${c.v})` }} />
      </div>

      {alphaEnabled && (
        <div
          className="wui-colorpicker__slider"
          tabIndex={0}
          role="slider"
          aria-label="Opacity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(c.a * 100)}
          style={
            {
              backgroundImage: `linear-gradient(to right, rgb(${r} ${g} ${b} / 0), ${rgbCss}), repeating-conic-gradient(#cfcfcf 0 25%, #fff 0 50%)`,
              backgroundSize: 'auto, 8px 8px',
              '--wui-cp-thumb': rgbCss,
            } as CSSProperties
          }
          {...alphaDrag}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') (e.preventDefault(), update({ a: clamp(c.a + 0.01, 0, 1) }));
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') (e.preventDefault(), update({ a: clamp(c.a - 0.01, 0, 1) }));
          }}
        >
          <span className="wui-colorpicker__slider-thumb" style={{ left: `calc(10px + (100% - 20px) * ${c.a})` }} />
        </div>
      )}

      <div className="wui-colorpicker__inputs">
        <ComboBox items={['RGB', 'HSV']} value={mode} onValueChange={setMode} aria-label="Colour model" />
        <TextBox
          aria-label="Hex"
          value={hexDraft ?? hex}
          clearButton={false}
          spellCheck={false}
          onValueChange={setHexDraft}
          onBlur={() => {
            const next = hexDraft !== null ? parseHex(hexDraft) : null;
            if (next) update(alphaEnabled ? next : { ...next, a: 1 });
            setHexDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </div>
      {channels.map((ch) => (
        <div key={ch.label} className="wui-colorpicker__channel">
          <NumberBox aria-label={ch.label} value={ch.val} min={0} max={ch.max} onValueChange={ch.set} clearButton={false} />
          <span>{ch.label}</span>
        </div>
      ))}
      {alphaEnabled && (
        <div className="wui-colorpicker__channel">
          <NumberBox
            aria-label="Opacity"
            value={Math.round(c.a * 100)}
            min={0}
            max={100}
            formatValue={(n) => `${n}%`}
            onValueChange={(n) => n !== null && update({ a: n / 100 })}
            clearButton={false}
          />
          <span>Opacity</span>
        </div>
      )}
    </div>
  );
}
