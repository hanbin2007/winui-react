import {
  forwardRef,
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { cx, useControllable, useEvent } from '../utils';

export type ButtonAppearance = 'standard' | 'accent' | 'subtle' | 'hyperlink';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** standard (default), accent (AccentButtonStyle), subtle, or hyperlink. */
  appearance?: ButtonAppearance;
  /** Icon shown before the content. With no children the button becomes icon-only. */
  icon?: IconSource;
  /** Adds the drop-down chevron (used by DropDownButton). */
  chevron?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { appearance = 'standard', icon, chevron, className, children, type = 'button', ...rest },
  ref,
) {
  const iconOnly = icon != null && (children == null || children === false) && !chevron;
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cx(
        'wui-button wui-elev wui-focusable',
        appearance !== 'standard' && `wui-button--${appearance}`,
        iconOnly && 'wui-button--icon',
        className,
      )}
    >
      {icon != null && renderIcon(icon)}
      {children}
      {chevron && <Icon name="chevronDown" size={12} className="wui-button__chevron" />}
    </button>
  );
});

export interface ToggleButtonProps extends Omit<ButtonProps, 'appearance'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** A button that stays checked (accent-filled) until pressed again. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { checked, defaultChecked = false, onCheckedChange, onClick, ...rest },
  ref,
) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return (
    <Button
      ref={ref}
      {...rest}
      appearance={on ? 'accent' : 'standard'}
      aria-pressed={on}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
    />
  );
});

export interface HyperlinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  disabled?: boolean;
  icon?: IconSource;
}

/** A button that looks like a link. Renders an <a>; give it `href` to navigate. */
export const HyperlinkButton = forwardRef<HTMLAnchorElement, HyperlinkButtonProps>(
  function HyperlinkButton({ className, disabled, icon, children, href, onClick, ...rest }, ref) {
    return (
      <a
        ref={ref}
        role={href ? undefined : 'button'}
        tabIndex={disabled ? -1 : 0}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        {...rest}
        className={cx('wui-button wui-elev wui-focusable wui-button--hyperlink', className)}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        onKeyDown={(e) => {
          rest.onKeyDown?.(e);
          if (!href && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
      >
        {icon != null && renderIcon(icon)}
        {children}
      </a>
    );
  },
);

export interface RepeatButtonProps extends ButtonProps {
  /** Milliseconds before repeating starts. Default 400. */
  delay?: number;
  /** Milliseconds between repeats. Default 60. */
  interval?: number;
}

/** Raises onClick again and again while it is held down. */
export const RepeatButton = forwardRef<HTMLButtonElement, RepeatButtonProps>(function RepeatButton(
  { delay = 400, interval = 60, onClick, onPointerDown, ...rest },
  ref,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const repeated = useRef(false);
  const fire = useEvent(onClick as ((e: unknown) => void) | undefined);
  const stop = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  useEffect(() => stop, []);
  return (
    <Button
      ref={ref}
      {...rest}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (e.button !== 0) return;
        repeated.current = false;
        const event = e;
        const tick = () => {
          repeated.current = true;
          fire(event);
          timer.current = setTimeout(tick, interval);
        };
        timer.current = setTimeout(tick, delay);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        // The click at release is skipped when repeats already fired.
        if (repeated.current) {
          repeated.current = false;
          return;
        }
        onClick?.(e);
      }}
    />
  );
});
