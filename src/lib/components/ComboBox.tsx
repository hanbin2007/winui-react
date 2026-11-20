import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { Popup, type PopupPosition } from '../Popup';
import { clamp, cx, useControllable } from '../utils';
import { Field } from './TextBox';

export interface ComboBoxItem {
  value: string;
  /** What to show. Defaults to `value`. */
  label?: ReactNode;
  /** Plain text used for type-to-select when `label` is not a string. */
  text?: string;
  icon?: IconSource;
  disabled?: boolean;
}

export interface ComboBoxProps {
  items: Array<ComboBoxItem | string>;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: ReactNode;
  header?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

const normalize = (item: ComboBoxItem | string): ComboBoxItem =>
  typeof item === 'string' ? { value: item } : item;
const textOf = (item: ComboBoxItem) =>
  item.text ?? (typeof item.label === 'string' ? item.label : item.value);

/**
 * A drop-down list. Like the WinUI ComboBox, the list opens over the box with the
 * selected item aligned to it, expanding outward from that row.
 */
export function ComboBox({
  items: rawItems,
  value,
  defaultValue = null,
  onValueChange,
  placeholder,
  header,
  description,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
}: ComboBoxProps) {
  const items = rawItems.map(normalize);
  const [val, setVal] = useControllable<string | null>(
    value,
    defaultValue,
    onValueChange as (v: string | null) => void,
  );
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const typed = useRef({ text: '', at: 0 });
  const selected = items.find((it) => it.value === val);

  const select = (item: ComboBoxItem) => {
    if (item.value !== val) setVal(item.value);
  };
  const move = (delta: number) => {
    const enabled = items.filter((it) => !it.disabled);
    if (enabled.length === 0) return;
    const idx = enabled.findIndex((it) => it.value === val);
    const next = enabled[clamp(idx + delta, 0, enabled.length - 1)];
    if (next) select(next);
  };
  const typeAhead = (key: string): ComboBoxItem | undefined => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 700 ? key : t.text + key;
    t.at = now;
    const needle = t.text.toLowerCase();
    return items.find((it) => !it.disabled && textOf(it).toLowerCase().startsWith(needle));
  };

  // Place the list so the selected row sits exactly over the box.
  const position = (a: DOMRect, size: { width: number; height: number }): PopupPosition => {
    const list = document.getElementById(listId);
    const sel =
      list?.querySelector<HTMLElement>('[aria-selected="true"]') ??
      list?.querySelector<HTMLElement>('.wui-option');
    let rowTop = 0;
    let rowH = 36;
    if (list && sel) {
      rowH = sel.offsetHeight;
      if (list.scrollHeight > list.clientHeight && list.dataset.scrolled !== 'true') {
        list.scrollTop = sel.offsetTop - (list.clientHeight - rowH) / 2;
        list.dataset.scrolled = 'true';
      }
      rowTop = sel.offsetTop - list.scrollTop + 1;
    }
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const top = Math.round(
      clamp(a.top + a.height / 2 - (rowTop + rowH / 2), 4, Math.max(4, vh - size.height - 4)),
    );
    const left = Math.round(clamp(a.left, 4, Math.max(4, vw - size.width - 4)));
    return {
      left,
      top,
      side: 'bottom',
      style: {
        '--wui-split-top': `${clamp(a.top - top, 0, size.height)}px`,
        '--wui-split-bottom': `${clamp(top + size.height - a.bottom, 0, size.height)}px`,
      } as CSSProperties,
    };
  };

  const focusOption = (from: HTMLElement, delta: number | 'first' | 'last') => {
    const list = document.getElementById(listId);
    if (!list) return;
    const opts = Array.from(list.querySelectorAll<HTMLElement>('.wui-option:not([aria-disabled="true"])'));
    if (opts.length === 0) return;
    const i = opts.indexOf(from);
    const next =
      delta === 'first' ? opts[0] : delta === 'last' ? opts[opts.length - 1] : opts[clamp(i + delta, 0, opts.length - 1)];
    next?.focus();
  };

  const control = (
    <>
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cx('wui-combobox wui-elev wui-focusable', header == null && description == null && className)}
        style={header == null && description == null ? style : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (e.altKey) setOpen(true);
            else move(e.key === 'ArrowDown' ? 1 : -1);
          } else if (e.key === 'F4') {
            setOpen(true);
          } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            move(e.key === 'Home' ? -items.length : items.length);
          } else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey) {
            const hit = typeAhead(e.key);
            if (hit) select(hit);
          }
        }}
      >
        <span className="wui-combobox__value" data-placeholder={selected ? undefined : true}>
          {selected ? (
            <>
              {selected.icon != null && <span className="wui-option__icon">{renderIcon(selected.icon)}</span>}
              {selected.label ?? selected.value}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className="wui-combobox__chevron">
          <Icon name="chevronDown" size={12} />
        </span>
      </button>
      <Popup
        open={open}
        anchor={button}
        animation="split"
        matchAnchorWidth="min"
        position={position}
        onDismiss={() => setOpen(false)}
        className="wui-dropdown wui-acrylic"
        id={listId}
        role="listbox"
      >
        {items.map((item) => {
          const isSel = item.value === val;
          return (
            <div
              key={item.value}
              role="option"
              tabIndex={-1}
              aria-selected={isSel}
              aria-disabled={item.disabled || undefined}
              data-autofocus={isSel || undefined}
              className="wui-option"
              onClick={() => {
                select(item);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') (e.preventDefault(), focusOption(e.currentTarget, 1));
                else if (e.key === 'ArrowUp') (e.preventDefault(), focusOption(e.currentTarget, -1));
                else if (e.key === 'Home') (e.preventDefault(), focusOption(e.currentTarget, 'first'));
                else if (e.key === 'End') (e.preventDefault(), focusOption(e.currentTarget, 'last'));
                else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
                  e.preventDefault();
                  select(item);
                  setOpen(false);
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                  const hit = typeAhead(e.key);
                  if (hit) {
                    const list = document.getElementById(listId);
                    const idx = items.indexOf(hit);
                    (list?.querySelectorAll<HTMLElement>('.wui-option')[idx])?.focus();
                  }
                }
              }}
            >
              {item.icon != null && <span className="wui-option__icon">{renderIcon(item.icon)}</span>}
              {item.label ?? item.value}
            </div>
          );
        })}
      </Popup>
    </>
  );

  if (header == null && description == null) return control;
  return (
    <Field header={header} description={description} disabled={disabled} className={className} style={style}>
      {control}
    </Field>
  );
}
