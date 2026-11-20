import {
  Children,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { clamp, cx, useControllable } from '../utils';

export type SelectionMode = 'none' | 'single' | 'multiple';

interface CollectionProps<T> {
  items: T[];
  /** Unique key per item. Defaults to the item itself (strings) or its index. */
  getKey?: (item: T, index: number) => string;
  renderItem?: (item: T, index: number) => ReactNode;
  selectionMode?: SelectionMode;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Click, Enter or double-click on an item. */
  onItemInvoked?: (item: T, index: number) => void;
  isItemDisabled?: (item: T, index: number) => boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

function useSelection<T>(p: CollectionProps<T>) {
  const { items, getKey, selectionMode = 'single' } = p;
  const keyOf = (item: T, i: number) =>
    getKey ? getKey(item, i) : typeof item === 'string' ? item : String(i);
  const [selected, setSelected] = useControllable(
    p.selectedKeys,
    p.defaultSelectedKeys ?? [],
    p.onSelectionChange,
  );
  const select = (key: string) => {
    if (selectionMode === 'none') return;
    if (selectionMode === 'single') {
      if (!(selected.length === 1 && selected[0] === key)) setSelected([key]);
    } else {
      setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
    }
  };
  const onKeyNav = (e: KeyboardEvent<HTMLElement>, selector: string, columns = 1) => {
    const list = e.currentTarget.parentElement;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>(selector));
    const i = rows.indexOf(e.currentTarget);
    let next = -1;
    if (e.key === 'ArrowDown') next = i + columns;
    else if (e.key === 'ArrowUp') next = i - columns;
    else if (e.key === 'ArrowRight' && columns > 1) next = i + 1;
    else if (e.key === 'ArrowLeft' && columns > 1) next = i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = rows.length - 1;
    if (next < 0) return;
    e.preventDefault();
    rows[clamp(next, 0, rows.length - 1)]?.focus();
  };
  return { items, keyOf, selected, select, selectionMode, onKeyNav };
}

/* ---------------- ListView ---------------- */

export type ListViewProps<T> = CollectionProps<T>;

/** A vertical list with single, multiple or no selection. */
export function ListView<T>(props: ListViewProps<T>) {
  const { items, keyOf, selected, select, selectionMode, onKeyNav } = useSelection(props);
  const { renderItem, onItemInvoked, isItemDisabled, className, style } = props;
  const firstFocusable = selected[0] ?? (items.length ? keyOf(items[0], 0) : undefined);
  return (
    <div
      role="listbox"
      aria-label={props['aria-label']}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cx('wui-listview', className)}
      style={style}
    >
      {items.map((item, i) => {
        const key = keyOf(item, i);
        const isSel = selected.includes(key);
        const disabled = isItemDisabled?.(item, i);
        return (
          <div
            key={key}
            role="option"
            tabIndex={key === firstFocusable ? 0 : -1}
            aria-selected={selectionMode === 'none' ? undefined : isSel}
            aria-disabled={disabled || undefined}
            className="wui-listview__item"
            onClick={() => {
              select(key);
              onItemInvoked?.(item, i);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                select(key);
                if (e.key === 'Enter') onItemInvoked?.(item, i);
              } else onKeyNav(e, '.wui-listview__item:not([aria-disabled="true"])');
            }}
          >
            {selectionMode === 'single' && isSel && <span className="wui-listview__pill" />}
            {selectionMode === 'multiple' && (
              <span
                className="wui-checkbox wui-listview__check"
                data-state={isSel ? 'checked' : 'unchecked'}
                style={{ minHeight: 0, padding: 0 }}
              >
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
                  </svg>
                </span>
              </span>
            )}
            <div className="wui-listview__content">{renderItem ? renderItem(item, i) : String(item)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- GridView ---------------- */

export interface GridViewProps<T> extends CollectionProps<T> {
  /** Used for arrow-key movement between rows. Default 1 (left/right only). */
  columns?: number;
}

/** A wrapping grid of tiles with selection. */
export function GridView<T>(props: GridViewProps<T>) {
  const { items, keyOf, selected, select, selectionMode, onKeyNav } = useSelection(props);
  const { renderItem, onItemInvoked, isItemDisabled, className, style, columns = 1 } = props;
  const firstFocusable = selected[0] ?? (items.length ? keyOf(items[0], 0) : undefined);
  return (
    <div
      role="listbox"
      aria-label={props['aria-label']}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cx('wui-gridview', className)}
      style={style}
    >
      {items.map((item, i) => {
        const key = keyOf(item, i);
        const isSel = selected.includes(key);
        const disabled = isItemDisabled?.(item, i);
        return (
          <div
            key={key}
            role="option"
            tabIndex={key === firstFocusable ? 0 : -1}
            aria-selected={selectionMode === 'none' ? undefined : isSel}
            aria-disabled={disabled || undefined}
            className="wui-gridview__item"
            onClick={() => {
              select(key);
              onItemInvoked?.(item, i);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                select(key);
                if (e.key === 'Enter') onItemInvoked?.(item, i);
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const list = e.currentTarget.parentElement!;
                const tiles = Array.from(list.querySelectorAll<HTMLElement>('.wui-gridview__item'));
                const at = tiles.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : -1);
                e.preventDefault();
                tiles[clamp(at, 0, tiles.length - 1)]?.focus();
              } else onKeyNav(e, '.wui-gridview__item', columns);
            }}
          >
            {selectionMode === 'multiple' && isSel && (
              <span className="wui-gridview__tick">
                <Icon name="check" size={12} />
              </span>
            )}
            {renderItem ? renderItem(item, i) : String(item)}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- TreeView ---------------- */

export interface TreeViewNode {
  key: string;
  label: ReactNode;
  icon?: IconSource;
  children?: TreeViewNode[];
}

export interface TreeViewProps {
  items: TreeViewNode[];
  selectionMode?: 'none' | 'single';
  selectedKey?: string | null;
  defaultSelectedKey?: string | null;
  onSelectionChange?: (key: string) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  onItemInvoked?: (node: TreeViewNode) => void;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function TreeView({
  items,
  selectionMode = 'single',
  selectedKey,
  defaultSelectedKey = null,
  onSelectionChange,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  onItemInvoked,
  className,
  style,
  'aria-label': ariaLabel,
}: TreeViewProps) {
  const [selected, setSelected] = useControllable<string | null>(
    selectedKey,
    defaultSelectedKey,
    onSelectionChange as (k: string | null) => void,
  );
  const [expanded, setExpanded] = useControllable(expandedKeys, defaultExpandedKeys, onExpandedChange);
  const root = useRef<HTMLUListElement>(null);
  const setOpen = (key: string, open: boolean) =>
    setExpanded(open ? [...expanded.filter((k) => k !== key), key] : expanded.filter((k) => k !== key));

  const move = (from: HTMLElement, delta: number) => {
    const rows = Array.from(
      root.current?.querySelectorAll<HTMLElement>('.wui-treeview__row') ?? [],
    ).filter((r) => !r.closest('.wui-treeview__group:not([data-open="true"])'));
    rows[clamp(rows.indexOf(from) + delta, 0, rows.length - 1)]?.focus();
  };

  const render = (nodes: TreeViewNode[], depth: number): ReactNode =>
    nodes.map((node) => {
      const hasKids = !!node.children?.length;
      const open = hasKids && expanded.includes(node.key);
      const isSel = selectionMode === 'single' && selected === node.key;
      return (
        <li key={node.key} role="none">
          <div
            role="treeitem"
            tabIndex={isSel || (selected === null && node === items[0]) ? 0 : -1}
            aria-expanded={hasKids ? open : undefined}
            aria-selected={selectionMode === 'single' ? isSel : undefined}
            data-selected={isSel || undefined}
            className="wui-treeview__row"
            style={{ paddingLeft: depth * 16 }}
            onClick={() => {
              if (selectionMode === 'single') setSelected(node.key);
              if (hasKids) setOpen(node.key, !open);
              onItemInvoked?.(node);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') (e.preventDefault(), move(e.currentTarget, 1));
              else if (e.key === 'ArrowUp') (e.preventDefault(), move(e.currentTarget, -1));
              else if (e.key === 'ArrowRight' && hasKids) {
                e.preventDefault();
                if (open) move(e.currentTarget, 1);
                else setOpen(node.key, true);
              } else if (e.key === 'ArrowLeft' && open) (e.preventDefault(), setOpen(node.key, false));
              else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
          >
            {isSel && <span className="wui-listview__pill" />}
            <span className="wui-treeview__chevron">
              {hasKids && <Icon name="chevronRight" size={12} />}
            </span>
            {node.icon != null && <span className="wui-treeview__icon">{renderIcon(node.icon)}</span>}
            {node.label}
          </div>
          {hasKids && (
            <div className="wui-treeview__group" data-open={open || undefined}>
              <ul role="group">{render(node.children!, depth + 1)}</ul>
            </div>
          )}
        </li>
      );
    });

  return (
    <ul ref={root} role="tree" aria-label={ariaLabel} className={cx('wui-treeview', className)} style={style}>
      {render(items, 0)}
    </ul>
  );
}

/* ---------------- FlipView ---------------- */

export interface FlipViewProps {
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  /** One child per page. */
  children?: ReactNode;
}

/** Shows one item at a time and flips between them. */
export function FlipView({
  index,
  defaultIndex = 0,
  onIndexChange,
  orientation = 'horizontal',
  className,
  style,
  'aria-label': ariaLabel,
  children,
}: FlipViewProps) {
  const slides = Children.toArray(children);
  const [raw, setIndex] = useControllable(index, defaultIndex, onIndexChange);
  const i = clamp(raw, 0, Math.max(0, slides.length - 1));
  const vertical = orientation === 'vertical';
  const go = (d: number) => setIndex(clamp(i + d, 0, slides.length - 1));
  return (
    <div
      className={cx('wui-flipview', className)}
      style={style}
      data-orientation={orientation}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        const next = vertical ? 'ArrowDown' : 'ArrowRight';
        if (e.key === prev) (e.preventDefault(), go(-1));
        else if (e.key === next) (e.preventDefault(), go(1));
      }}
    >
      <div
        className="wui-flipview__track"
        style={{ transform: vertical ? `translateY(${-i * 100}%)` : `translateX(${-i * 100}%)` }}
      >
        {slides.map((s, n) => (
          <div key={n} className="wui-flipview__slide" aria-hidden={n !== i}>
            {s}
          </div>
        ))}
      </div>
      {i > 0 && (
        <button type="button" tabIndex={-1} aria-label="Previous" className="wui-flipview__nav wui-flipview__nav--prev wui-acrylic" onClick={() => go(-1)}>
          <Icon size={12} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} name="caretUp" />
        </button>
      )}
      {i < slides.length - 1 && (
        <button type="button" tabIndex={-1} aria-label="Next" className="wui-flipview__nav wui-flipview__nav--next wui-acrylic" onClick={() => go(1)}>
          <Icon size={12} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} name="caretDown" />
        </button>
      )}
    </div>
  );
}

/* ---------------- PipsPager ---------------- */

export interface PipsPagerProps {
  numberOfPages: number;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  /** Show previous / next buttons. */
  buttons?: boolean;
  className?: string;
}

/** Dots for paging through a small number of pages. */
export function PipsPager({
  numberOfPages,
  selectedIndex,
  defaultSelectedIndex = 0,
  onSelectedIndexChange,
  orientation = 'horizontal',
  buttons,
  className,
}: PipsPagerProps) {
  const [i, setI] = useControllable(selectedIndex, defaultSelectedIndex, onSelectedIndexChange);
  const vertical = orientation === 'vertical';
  const go = (n: number) => setI(clamp(n, 0, numberOfPages - 1));
  return (
    <div
      className={cx('wui-pips', className)}
      data-orientation={orientation}
      role="tablist"
      onKeyDown={(e) => {
        if (e.key === (vertical ? 'ArrowDown' : 'ArrowRight')) (e.preventDefault(), go(i + 1));
        else if (e.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) (e.preventDefault(), go(i - 1));
      }}
    >
      {buttons && (
        <button type="button" className="wui-pips__nav" aria-label="Previous page" disabled={i === 0} onClick={() => go(i - 1)}>
          <Icon name="caretUp" size={12} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} />
        </button>
      )}
      {Array.from({ length: numberOfPages }, (_, n) => (
        <button
          key={n}
          type="button"
          role="tab"
          aria-selected={n === i}
          aria-label={`Page ${n + 1}`}
          tabIndex={n === i ? 0 : -1}
          className="wui-pips__pip wui-focusable"
          onClick={() => go(n)}
        />
      ))}
      {buttons && (
        <button type="button" className="wui-pips__nav" aria-label="Next page" disabled={i === numberOfPages - 1} onClick={() => go(i + 1)}>
          <Icon name="caretDown" size={12} style={{ transform: vertical ? undefined : 'rotate(-90deg)' }} />
        </button>
      )}
    </div>
  );
}
