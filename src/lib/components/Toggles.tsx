import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx, mergeRefs, useControllable } from '../utils';

/* ---------------- CheckBox ---------------- */

export type CheckState = boolean | 'indeterminate';

export interface CheckBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'type'> {
  /** true, false, or 'indeterminate' (three-state). */
  checked?: CheckState;
  defaultChecked?: CheckState;
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
}

export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(function CheckBox(
  { checked, defaultChecked = false, onCheckedChange, disabled, className, style, children, ...rest },
  ref,
) {
  const [state, setState] = useControllable<CheckState>(checked, defaultChecked, (v) =>
    onCheckedChange?.(v === true),
  );
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = state === 'indeterminate';
  }, [state]);
  const dataState = state === 'indeterminate' ? 'indeterminate' : state ? 'checked' : 'unchecked';
  return (
    <label
      className={cx('wui-checkbox', className)}
      style={style}
      data-state={dataState}
      data-disabled={disabled || undefined}
    >
      <input
        {...rest}
        ref={mergeRefs(ref, inner)}
        type="checkbox"
        className="wui-checkbox__input"
        checked={state === true}
        disabled={disabled}
        onChange={(e) => setState(e.target.checked)}
      />
      <span className="wui-checkbox__box">
        <svg className="wui-checkbox__glyph" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            className="wui-checkbox__check"
            d="M2.5 8.5 6 12l7.5-7.5"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="wui-checkbox__dash"
            d="M3.5 8h9"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      </span>
      {children != null && <span className="wui-checkbox__label">{children}</span>}
    </label>
  );
});

/* ---------------- RadioButtons ---------------- */

interface RadioContextValue {
  name: string;
  value: string | undefined;
  disabled?: boolean;
  onSelect: (value: string) => void;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioButtonsProps {
  /** Text shown above the group. */
  header?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  name?: string;
  className?: string;
  children?: ReactNode;
}

/** A group of RadioButton items with one selection. */
export function RadioButtons({
  header,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled,
  name,
  className,
  children,
}: RadioButtonsProps) {
  const auto = useId();
  const [current, setCurrent] = useControllable<string | undefined>(
    value,
    defaultValue,
    onValueChange as (v: string | undefined) => void,
  );
  return (
    <RadioContext.Provider
      value={{ name: name ?? auto, value: current, disabled, onSelect: setCurrent }}
    >
      <fieldset
        className={cx('wui-radiogroup', className)}
        data-orientation={orientation}
        role="radiogroup"
      >
        {header != null && (
          <legend className="wui-header" data-disabled={disabled || undefined}>
            {header}
          </legend>
        )}
        <div className="wui-radiogroup__items">{children}</div>
      </fieldset>
    </RadioContext.Provider>
  );
}

export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
}

/** One option. Use inside RadioButtons, or on its own with `checked`. */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { value, checked, disabled, onCheckedChange, className, style, children, name, ...rest },
  ref,
) {
  const group = useContext(RadioContext);
  const isChecked = group ? group.value === value : !!checked;
  const isDisabled = disabled ?? group?.disabled;
  return (
    <label
      className={cx('wui-radio', className)}
      style={style}
      data-checked={isChecked || undefined}
      data-disabled={isDisabled || undefined}
    >
      <input
        {...rest}
        ref={ref}
        type="radio"
        className="wui-radio__input"
        name={group?.name ?? name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={(e) => {
          if (e.target.checked) group?.onSelect(value);
          onCheckedChange?.(e.target.checked);
        }}
      />
      <span className="wui-radio__outer">
        <span className="wui-radio__dot" />
      </span>
      {children != null && <span className="wui-radio__label">{children}</span>}
    </label>
  );
});

/* ---------------- ToggleSwitch ---------------- */

export interface ToggleSwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Text above the switch. */
  header?: ReactNode;
  /** Label when on. Default "On". Pass null to hide the label. */
  onContent?: ReactNode;
  /** Label when off. Default "Off". */
  offContent?: ReactNode;
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(function ToggleSwitch(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    header,
    onContent = 'On',
    offContent = 'Off',
    disabled,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const label = on ? onContent : offContent;
  const control = (
    <label
      className={cx('wui-toggle', header == null && className)}
      style={header == null ? style : undefined}
      data-checked={on || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        role="switch"
        className="wui-toggle__input"
        checked={on}
        disabled={disabled}
        onChange={(e) => setOn(e.target.checked)}
      />
      <span className="wui-toggle__track">
        <span className="wui-toggle__knob" />
      </span>
      {label != null && <span className="wui-toggle__label">{label}</span>}
    </label>
  );
  if (header == null) return control;
  return (
    <div className={cx('wui-toggle-wrap', className)} style={style}>
      <span className="wui-header" style={{ marginBottom: 0 }} data-disabled={disabled || undefined}>
        {header}
      </span>
      {control}
    </div>
  );
});
