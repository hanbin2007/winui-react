import {
  forwardRef,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import { renderIcon, type IconSource } from '../Icon';
import { Popup } from '../Popup';
import { clamp, cx, mergeRefs, useControllable } from '../utils';

/* ---------------- Field wrapper ---------------- */

interface FieldProps {
  header?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  htmlFor?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Header above and description below a control. */
export function Field({ header, description, disabled, htmlFor, className, style, children }: FieldProps) {
  return (
    <div className={cx('wui-field', className)} style={style}>
      {header != null && (
        <label className="wui-header" htmlFor={htmlFor} data-disabled={disabled || undefined}>
          {header}
        </label>
      )}
      {children}
      {description != null && <div className="wui-field__description">{description}</div>}
    </div>
  );
}

/* ---------------- TextBox ---------------- */

type NativeInput = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'prefix' | 'style' | 'className'
>;

export interface TextBoxProps extends NativeInput {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  header?: ReactNode;
  description?: ReactNode;
  /** Render a multi-line text area. */
  multiline?: boolean;
  rows?: number;
  /** Show the clear (x) button while focused with text. Default true for single-line. */
  clearButton?: boolean;
  /** Icon or node shown before the text. */
  prefix?: IconSource;
  /** Extra buttons after the text (use TextBoxButton). */
  buttons?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Ref to the outer bordered box (useful as a popup anchor). */
  boxRef?: Ref<HTMLDivElement>;
}

export interface TextBoxButtonProps {
  icon: IconSource;
  label: string;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  className?: string;
}

/** A small button that lives inside a TextBox (clear, reveal, search...). */
export function TextBoxButton({ icon, label, onClick, onPointerDown, onPointerUp, className }: TextBoxButtonProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      className={cx('wui-textbox__btn', className)}
      // Keep focus in the text field.
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
    >
      {renderIcon(icon, 12)}
    </button>
  );
}

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(function TextBox(
  {
    value,
    defaultValue = '',
    onValueChange,
    onChange,
    header,
    description,
    multiline,
    rows,
    clearButton,
    prefix,
    buttons,
    className,
    style,
    boxRef,
    disabled,
    readOnly,
    id,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [focused, setFocused] = useState(false);
  const inner = useRef<HTMLInputElement>(null);
  const showClear = (clearButton ?? !multiline) && focused && text.length > 0 && !readOnly && !disabled;

  const box = (
    <div
      ref={boxRef}
      className={cx('wui-textbox wui-elev', header == null && description == null && className)}
      style={header == null && description == null ? style : undefined}
      data-disabled={disabled || undefined}
      onMouseDown={(e) => {
        // Clicking the padding focuses the input.
        if (e.target === e.currentTarget) {
          e.preventDefault();
          inner.current?.focus();
        }
      }}
    >
      {prefix != null && <span className="wui-textbox__prefix">{renderIcon(prefix)}</span>}
      {multiline ? (
        <textarea
          {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          ref={mergeRefs(ref as unknown as Ref<HTMLTextAreaElement>, inner as unknown as Ref<HTMLTextAreaElement>)}
          id={inputId}
          rows={rows ?? 3}
          className="wui-textbox__input"
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            setText(e.target.value);
            onChange?.(e as never);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e as never);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e as never);
          }}
        />
      ) : (
        <input
          type="text"
          {...rest}
          ref={mergeRefs(ref, inner)}
          id={inputId}
          className="wui-textbox__input"
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            setText(e.target.value);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      )}
      {(showClear || buttons) && (
        <span className="wui-textbox__buttons">
          {showClear && (
            <TextBoxButton
              icon="close"
              label="Clear"
              onClick={() => {
                setText('');
                inner.current?.focus();
              }}
            />
          )}
          {buttons}
        </span>
      )}
    </div>
  );

  if (header == null && description == null) return box;
  return (
    <Field header={header} description={description} disabled={disabled} htmlFor={inputId} className={className} style={style}>
      {box}
    </Field>
  );
});

/* ---------------- PasswordBox ---------------- */

export interface PasswordBoxProps extends Omit<TextBoxProps, 'multiline' | 'rows' | 'type'> {
  /** 'peek' reveals while the eye button is held (default); 'hidden' and 'visible' are fixed. */
  revealMode?: 'peek' | 'hidden' | 'visible';
}

export const PasswordBox = forwardRef<HTMLInputElement, PasswordBoxProps>(function PasswordBox(
  { revealMode = 'peek', buttons, value, defaultValue = '', onValueChange, ...rest },
  ref,
) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [peek, setPeek] = useState(false);
  const visible = revealMode === 'visible' || (revealMode === 'peek' && peek);
  return (
    <TextBox
      ref={ref}
      {...rest}
      value={text}
      onValueChange={setText}
      type={visible ? 'text' : 'password'}
      clearButton={false}
      autoComplete={rest.autoComplete ?? 'off'}
      buttons={
        <>
          {revealMode === 'peek' && text.length > 0 && (
            <TextBoxButton
              icon="eye"
              label="Show password"
              onPointerDown={() => setPeek(true)}
              onPointerUp={() => setPeek(false)}
            />
          )}
          {buttons}
        </>
      }
    />
  );
});

/* ---------------- NumberBox ---------------- */

/** Evaluate + - * / ^ and parentheses. Returns NaN on anything else. */
export function evaluateExpression(src: string): number {
  let i = 0;
  const s = src.replace(/\s+/g, '');
  const peek = () => s[i];
  function primary(): number {
    if (peek() === '(') {
      i++;
      const v = sum();
      if (peek() !== ')') return NaN;
      i++;
      return v;
    }
    if (peek() === '-') {
      i++;
      return -primary();
    }
    if (peek() === '+') {
      i++;
      return primary();
    }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (!m) return NaN;
    i += m[0].length;
    return parseFloat(m[0]);
  }
  function power(): number {
    const base = primary();
    if (peek() === '^') {
      i++;
      return Math.pow(base, power());
    }
    return base;
  }
  function product(): number {
    let v = power();
    while (peek() === '*' || peek() === '/') {
      const op = s[i++];
      const r = power();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function sum(): number {
    let v = product();
    while (peek() === '+' || peek() === '-') {
      const op = s[i++];
      const r = product();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  if (!s) return NaN;
  const out = sum();
  return i === s.length ? out : NaN;
}

export interface NumberBoxProps
  extends Omit<TextBoxProps, 'value' | 'defaultValue' | 'onValueChange' | 'multiline' | 'rows' | 'type' | 'min' | 'max' | 'step'> {
  /** The number, or null when empty or not a number. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Step for the spin buttons and arrow keys. Default 1. */
  smallChange?: number;
  /** Step for Page Up / Page Down. Default 10. */
  largeChange?: number;
  /** 'inline' shows up/down buttons inside the box. Default 'hidden'. */
  spinButtons?: 'hidden' | 'inline';
  /** Let the user type sums like "2 + 3 * 4"; evaluated on Enter or blur. */
  acceptsExpression?: boolean;
  formatValue?: (value: number) => string;
}

export const NumberBox = forwardRef<HTMLInputElement, NumberBoxProps>(function NumberBox(
  {
    value,
    defaultValue = null,
    onValueChange,
    min = -Infinity,
    max = Infinity,
    smallChange = 1,
    largeChange = 10,
    spinButtons = 'hidden',
    acceptsExpression,
    formatValue = (n) => String(Number(n.toFixed(10))),
    buttons,
    onKeyDown,
    onBlur,
    ...rest
  },
  ref,
) {
  const [num, setNum] = useControllable<number | null>(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? (num === null ? '' : formatValue(num));

  const commit = (raw: string) => {
    setDraft(null);
    const trimmed = raw.trim();
    if (trimmed === '') {
      if (num !== null) setNum(null);
      return;
    }
    const parsed = acceptsExpression ? evaluateExpression(trimmed) : Number(trimmed);
    const next = Number.isFinite(parsed) ? clamp(parsed, min, max) : null;
    if (next !== num) setNum(next);
  };
  const stepBy = (delta: number) => {
    const base = draft !== null ? (acceptsExpression ? evaluateExpression(draft) : Number(draft)) : num;
    const start = base !== null && Number.isFinite(base) ? (base as number) : Number.isFinite(min) ? min : 0;
    setDraft(null);
    setNum(clamp(Number((start + delta).toFixed(10)), min, max));
  };

  return (
    <TextBox
      ref={ref}
      inputMode="decimal"
      role="spinbutton"
      aria-valuenow={num ?? undefined}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      {...rest}
      value={text}
      onValueChange={setDraft}
      onBlur={(e) => {
        if (draft !== null) commit(draft);
        onBlur?.(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.key === 'Enter') commit(text);
        else if (e.key === 'ArrowUp') (e.preventDefault(), stepBy(smallChange));
        else if (e.key === 'ArrowDown') (e.preventDefault(), stepBy(-smallChange));
        else if (e.key === 'PageUp') (e.preventDefault(), stepBy(largeChange));
        else if (e.key === 'PageDown') (e.preventDefault(), stepBy(-largeChange));
        else if (e.key === 'Escape') setDraft(null);
      }}
      buttons={
        <>
          {buttons}
          {spinButtons === 'inline' && !rest.disabled && (
            <>
              <TextBoxButton icon="chevronUp" label="Increase" className="wui-numberbox__spin" onClick={() => stepBy(smallChange)} />
              <TextBoxButton icon="chevronDown" label="Decrease" className="wui-numberbox__spin" onClick={() => stepBy(-smallChange)} />
            </>
          )}
        </>
      }
    />
  );
});

/* ---------------- AutoSuggestBox ---------------- */

export interface AutoSuggestBoxProps<T = string>
  extends Omit<TextBoxProps, 'multiline' | 'rows' | 'onSubmit'> {
  /** Suggestions to offer. Filtered by the typed text unless `filter` is false. */
  items: T[];
  getItemText?: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  /** Filter items by the typed text (case-insensitive contains). Default true. */
  filter?: boolean;
  /** Row shown when nothing matches. */
  noResultsText?: ReactNode;
  /** Icon for the query button. Default 'search'. Pass null to hide it. */
  queryIcon?: IconSource | null;
  onSuggestionChosen?: (item: T) => void;
  /** Enter pressed or the query button clicked. `chosen` is set when a suggestion was picked. */
  onQuerySubmitted?: (text: string, chosen?: T) => void;
}

export function AutoSuggestBox<T = string>({
  items,
  getItemText = (item) => String(item),
  renderItem,
  filter = true,
  noResultsText,
  queryIcon = 'search',
  onSuggestionChosen,
  onQuerySubmitted,
  value,
  defaultValue = '',
  onValueChange,
  onKeyDown,
  onFocus,
  className,
  style,
  header,
  description,
  ...rest
}: AutoSuggestBoxProps<T>) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const q = text.trim().toLowerCase();
  const shown = filter && q ? items.filter((it) => getItemText(it).toLowerCase().includes(q)) : items;
  const hasRows = shown.length > 0 || (noResultsText != null && q.length > 0);
  const isOpen = open && q.length > 0 && hasRows;

  const choose = (item: T) => {
    setText(getItemText(item));
    setOpen(false);
    setActive(-1);
    onSuggestionChosen?.(item);
    onQuerySubmitted?.(getItemText(item), item);
  };

  return (
    <Field header={header} description={description} disabled={rest.disabled} className={className} style={style}>
      <TextBox
        {...rest}
        boxRef={boxRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={text}
        onValueChange={(v) => {
          setText(v);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={(e) => {
          onFocus?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!isOpen) {
              setOpen(true);
              return;
            }
            e.preventDefault();
            const n = shown.length;
            if (n === 0) return;
            setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % n : (a - 1 + n) % n));
          } else if (e.key === 'Enter') {
            if (isOpen && active >= 0 && shown[active] !== undefined) choose(shown[active]);
            else {
              setOpen(false);
              onQuerySubmitted?.(text);
            }
          } else if (e.key === 'Escape' && isOpen) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        buttons={
          queryIcon != null ? (
            <TextBoxButton icon={queryIcon} label="Search" onClick={() => onQuerySubmitted?.(text)} />
          ) : undefined
        }
      />
      <Popup
        open={isOpen}
        anchor={boxRef}
        placement="bottom-start"
        offset={2}
        matchAnchorWidth
        autoFocus={false}
        onDismiss={() => setOpen(false)}
        className="wui-dropdown wui-acrylic"
        id={listId}
        role="listbox"
      >
        {shown.map((item, i) => (
          <div
            key={i}
            role="option"
            aria-selected={false}
            className="wui-option"
            data-active={i === active || undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(item)}
          >
            {renderItem ? renderItem(item) : getItemText(item)}
          </div>
        ))}
        {shown.length === 0 && noResultsText != null && (
          <div className="wui-option" aria-disabled="true">
            {noResultsText}
          </div>
        )}
      </Popup>
    </Field>
  );
}
