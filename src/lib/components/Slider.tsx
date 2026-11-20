import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { clamp, cx, useControllable } from '../utils';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Snap interval. Default 1. */
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  /** Text above the slider. */
  header?: ReactNode;
  /** Draw tick marks every this many units. */
  tickFrequency?: number;
  /** Show the value bubble while dragging or focused. Default true. */
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

function snap(v: number, min: number, max: number, step: number) {
  const snapped = Math.round((v - min) / step) * step + min;
  const digits = (String(step).split('.')[1] ?? '').length;
  return clamp(Number(snapped.toFixed(digits)), min, max);
}

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  disabled,
  header,
  tickFrequency,
  showTooltip = true,
  formatValue = String,
  className,
  style,
  'aria-label': ariaLabel,
}: SliderProps) {
  const [val, setVal] = useControllable(value, defaultValue ?? min, onValueChange);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const travel = useRef<HTMLDivElement>(null);
  const vertical = orientation === 'vertical';
  const p = max > min ? (clamp(val, min, max) - min) / (max - min) : 0;

  const fromPointer = (e: { clientX: number; clientY: number }) => {
    const r = travel.current!.getBoundingClientRect();
    const ratio = vertical
      ? 1 - (e.clientY - r.top) / (r.height || 1)
      : (e.clientX - r.left) / (r.width || 1);
    const next = snap(min + clamp(ratio, 0, 1) * (max - min), min, max, step);
    if (next !== val) setVal(next);
  };

  // Position along the rail of a 0..1 ratio, keeping the thumb inside the rail.
  const along = (ratio: number) =>
    `calc(var(--wui-slider-thumb) / 2 + (100% - var(--wui-slider-thumb)) * ${ratio})`;

  const ticks: number[] = [];
  if (tickFrequency && tickFrequency > 0) {
    for (let t = min; t <= max + 1e-9; t += tickFrequency) ticks.push((t - min) / (max - min));
  }

  const slider = (
    <div
      className={cx('wui-slider', header == null && className)}
      style={header == null ? style : undefined}
      data-orientation={orientation}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging) fromPointer(e);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <div className="wui-slider__rail">
        <div
          className="wui-slider__fill"
          style={vertical ? { height: along(p) } : { width: along(p) }}
        />
      </div>
      {!vertical &&
        ticks.map((t, i) => (
          <span key={i}>
            <span className="wui-slider__tick wui-slider__tick--before" style={{ left: along(t) }} />
            <span className="wui-slider__tick wui-slider__tick--after" style={{ left: along(t) }} />
          </span>
        ))}
      <div className="wui-slider__travel" ref={travel}>
        <div
          className="wui-slider__thumb wui-elev"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-orientation={orientation}
          aria-disabled={disabled || undefined}
          style={vertical ? { bottom: `${p * 100}%` } : { left: `${p * 100}%` }}
          onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            const big = Math.max(step, (max - min) / 10);
            let next: number | null = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = val + step;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = val - step;
            else if (e.key === 'PageUp') next = val + big;
            else if (e.key === 'PageDown') next = val - big;
            else if (e.key === 'Home') next = min;
            else if (e.key === 'End') next = max;
            if (next === null) return;
            e.preventDefault();
            setFocused(true);
            setVal(snap(next, min, max, step));
          }}
        >
          <span className="wui-slider__thumb-inner" />
          {showTooltip && (dragging || focused) && (
            <span className="wui-tooltip wui-acrylic wui-slider__tip">{formatValue(val)}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (header == null) return slider;
  return (
    <div className={cx('wui-slider-wrap', className)} style={style}>
      <span className="wui-header" style={{ marginBottom: 0 }} data-disabled={disabled || undefined}>
        {header}
      </span>
      {slider}
    </div>
  );
}

export interface RatingControlProps {
  /** Current rating, 0 when unset. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  /** Shown (in the primary text colour) while no rating is set. */
  placeholderValue?: number;
  caption?: ReactNode;
  /** Clicking the current rating clears it. Default true. */
  clearable?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function RatingControl({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  placeholderValue = 0,
  caption,
  clearable = true,
  readOnly,
  disabled,
  className,
  'aria-label': ariaLabel = 'Rating',
}: RatingControlProps) {
  const [val, setVal] = useControllable(value, defaultValue, onValueChange);
  const [preview, setPreview] = useState<number | null>(null);
  const interactive = !readOnly && !disabled;
  const shown = preview ?? (val > 0 ? val : placeholderValue);
  const isPlaceholder = preview === null && val <= 0 && placeholderValue > 0;
  return (
    <div
      className={cx('wui-rating wui-focusable', className)}
      role="slider"
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={val}
      aria-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      data-previewing={preview !== null || undefined}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          setVal(clamp(val + 1, 0, max));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          setVal(clamp(val - 1, 0, max));
        }
      }}
    >
      <span className="wui-rating__stars" onPointerLeave={() => setPreview(null)}>
        {Array.from({ length: max }, (_, i) => {
          const n = i + 1;
          const on = n <= shown;
          return (
            <span
              key={n}
              className="wui-rating__star"
              data-on={(on && !isPlaceholder) || undefined}
              data-placeholder={(on && isPlaceholder) || undefined}
              onPointerEnter={() => interactive && setPreview(n)}
              onClick={() => {
                if (!interactive) return;
                setVal(clearable && val === n ? 0 : n);
                setPreview(null);
              }}
            >
              <Icon name={on ? 'starFilled' : 'star'} size={20} />
            </span>
          );
        })}
      </span>
      {caption != null && <span className="wui-rating__caption">{caption}</span>}
    </div>
  );
}
