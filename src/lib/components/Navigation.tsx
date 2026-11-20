import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { cx, useControllable, useStretchIndicator } from '../utils';
import { Button } from './Button';
import { Flyout } from './Flyout';
import { MenuFlyout } from './MenuFlyout';

/* ---------------- TitleBar ---------------- */

export interface TitleBarProps {
  /** App icon (16px). */
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 48px tall instead of 32px; use it when the bar holds a search box. */
  tall?: boolean;
  backButton?: boolean | 'disabled';
  onBack?: () => void;
  paneToggleButton?: boolean;
  onPaneToggle?: () => void;
  /** Centre content, typically an AutoSuggestBox. */
  children?: ReactNode;
  /** Content before the caption buttons, such as a PersonPicture. */
  rightContent?: ReactNode;
  /** Draw minimize / maximize / close buttons. */
  captionButtons?: boolean;
  maximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

const captionGlyph = {
  minimize: <path d="M0.5 5h9" />,
  maximize: <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" />,
  restore: (
    <>
      <rect x="0.5" y="2.5" width="7" height="7" rx="1.5" />
      <path d="M2.6 2.5V2A1.5 1.5 0 0 1 4.1.5H8A1.5 1.5 0 0 1 9.5 2v3.9a1.5 1.5 0 0 1-1.5 1.5h-.5" />
    </>
  ),
  close: <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" />,
};

function Caption({
  kind,
  label,
  onClick,
}: {
  kind: keyof typeof captionGlyph;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cx('wui-caption', kind === 'close' && 'wui-caption--close')}
      aria-label={label}
      tabIndex={-1}
      onClick={onClick}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        {captionGlyph[kind]}
      </svg>
    </button>
  );
}

/** The window title bar: icon, title, optional search, and caption buttons. */
export function TitleBar({
  icon,
  title,
  subtitle,
  tall,
  backButton = false,
  onBack,
  paneToggleButton,
  onPaneToggle,
  children,
  rightContent,
  captionButtons,
  maximized,
  onMinimize,
  onMaximize,
  onClose,
  className,
  style,
}: TitleBarProps) {
  return (
    <header className={cx('wui-titlebar', className)} style={style} data-tall={tall || undefined}>
      {backButton !== false && (
        <button
          type="button"
          className="wui-nav__chrome-button wui-focusable"
          data-glyph="back"
          aria-label="Back"
          style={{ margin: 0, height: tall ? 36 : 28 }}
          disabled={backButton === 'disabled'}
          onClick={onBack}
        >
          <Icon name="back" />
        </button>
      )}
      {paneToggleButton && (
        <button
          type="button"
          className="wui-nav__chrome-button wui-focusable"
          data-glyph="menu"
          aria-label="Toggle navigation"
          style={{ margin: 0, height: tall ? 36 : 28 }}
          onClick={onPaneToggle}
        >
          <Icon name="menu" />
        </button>
      )}
      {icon != null && <span className="wui-titlebar__icon">{icon}</span>}
      {title != null && (
        <span className="wui-titlebar__title" style={icon == null ? { marginLeft: 12 } : undefined}>
          {title}
        </span>
      )}
      {subtitle != null && <span className="wui-titlebar__subtitle">{subtitle}</span>}
      {children != null ? (
        <div className="wui-titlebar__content">{children}</div>
      ) : (
        <span className="wui-titlebar__spacer" />
      )}
      {rightContent != null && <div className="wui-titlebar__right">{rightContent}</div>}
      {captionButtons && (
        <div className="wui-titlebar__captions">
          <Caption kind="minimize" label="Minimize" onClick={onMinimize} />
          <Caption kind={maximized ? 'restore' : 'maximize'} label={maximized ? 'Restore' : 'Maximize'} onClick={onMaximize} />
          <Caption kind="close" label="Close" onClick={onClose} />
        </div>
      )}
    </header>
  );
}

/* ---------------- TabView ---------------- */

export interface TabViewItem {
  key: string;
  header: ReactNode;
  icon?: IconSource;
  /** Show the close button. Default true. */
  closable?: boolean;
  /** Content shown when this tab is selected (unless TabView has children). */
  content?: ReactNode;
}

export interface TabViewProps {
  tabs: TabViewItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  onTabClose?: (key: string) => void;
  /** Shows the + button when set. */
  onAddTab?: () => void;
  /** Content at the right end of the tab strip. */
  stripFooter?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Replaces the selected tab's own `content`. */
  children?: ReactNode;
}

export function TabView({
  tabs,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  onTabClose,
  onAddTab,
  stripFooter,
  className,
  style,
  children,
}: TabViewProps) {
  const [selected, setSelected] = useControllable(
    selectedKey,
    defaultSelectedKey ?? tabs[0]?.key ?? '',
    onSelectionChange,
  );
  const list = useRef<HTMLDivElement>(null);
  const idx = tabs.findIndex((t) => t.key === selected);
  const current = tabs[idx];
  const focusTab = (i: number) => {
    const next = tabs[(i + tabs.length) % tabs.length];
    if (!next) return;
    setSelected(next.key);
    requestAnimationFrame(() =>
      list.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus(),
    );
  };
  return (
    <div className={cx('wui-tabview', className)} style={style}>
      <div className="wui-tabview__strip">
        <div className="wui-tabview__list" role="tablist" ref={list}>
          {tabs.map((tab, i) => {
            const isSel = tab.key === selected;
            const closable = tab.closable !== false && !!onTabClose;
            return (
              <div
                key={tab.key}
                role="tab"
                tabIndex={isSel ? 0 : -1}
                aria-selected={isSel}
                data-before-active={i === idx - 1 || undefined}
                className="wui-tab"
                onPointerDown={(e) => {
                  if (e.button === 0) setSelected(tab.key);
                }}
                onAuxClick={(e) => {
                  if (e.button === 1 && closable) onTabClose?.(tab.key);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') (e.preventDefault(), focusTab(i + 1));
                  else if (e.key === 'ArrowLeft') (e.preventDefault(), focusTab(i - 1));
                  else if (e.key === 'Home') (e.preventDefault(), focusTab(0));
                  else if (e.key === 'End') (e.preventDefault(), focusTab(tabs.length - 1));
                  else if (e.key === 'Delete' && closable) onTabClose?.(tab.key);
                  else if (e.key === 'Enter' || e.key === ' ') setSelected(tab.key);
                }}
              >
                {tab.icon != null && <span className="wui-tab__icon">{renderIcon(tab.icon)}</span>}
                <span className="wui-tab__header">{tab.header}</span>
                {closable && (
                  <button
                    type="button"
                    className="wui-tab__close"
                    aria-label="Close tab"
                    tabIndex={-1}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose?.(tab.key);
                    }}
                  >
                    <Icon name="close" size={10} />
                  </button>
                )}
                <span className="wui-tab__divider" />
              </div>
            );
          })}
        </div>
        {onAddTab && (
          <Button appearance="subtle" icon={<Icon name="add" size={12} />} aria-label="New tab" className="wui-tabview__add" onClick={onAddTab} />
        )}
        <div className="wui-tabview__footer">{stripFooter}</div>
      </div>
      <div className="wui-tabview__content" role="tabpanel">
        {children ?? current?.content}
      </div>
    </div>
  );
}

/* ---------------- BreadcrumbBar ---------------- */

export interface BreadcrumbItem {
  key: string;
  label: ReactNode;
}

export interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** 'large' uses the title type style, for page headers. */
  size?: 'default' | 'large';
  className?: string;
}

export function BreadcrumbBar({ items, onItemClick, size = 'default', className }: BreadcrumbBarProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cx('wui-breadcrumb', className)} data-size={size}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.key} className="wui-breadcrumb__entry">
              <button
                type="button"
                className="wui-breadcrumb__item wui-focusable"
                aria-current={last ? 'page' : undefined}
                tabIndex={last ? -1 : 0}
                onClick={() => !last && onItemClick?.(item, i)}
              >
                {item.label}
              </button>
              {!last && (
                <Icon name="chevronRight" size={size === 'large' ? 16 : 12} className="wui-breadcrumb__chevron" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------------- SelectorBar ---------------- */

export interface SelectorBarItem {
  key: string;
  text?: ReactNode;
  icon?: IconSource;
  disabled?: boolean;
}

export interface SelectorBarProps {
  items: SelectorBarItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
}

/** Switches between a small number of views; the underline slides between items. */
export function SelectorBar({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  className,
}: SelectorBarProps) {
  const [selected, setSelected] = useControllable(
    selectedKey,
    defaultSelectedKey ?? items[0]?.key ?? '',
    onSelectionChange,
  );
  const ref = useRef<HTMLDivElement>(null);
  useStretchIndicator(ref, selected, 'horizontal');
  return (
    <div ref={ref} className={cx('wui-selectorbar', className)} role="tablist">
      {items.map((item) => {
        const isSel = item.key === selected;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isSel}
            disabled={item.disabled}
            className="wui-selectorbar__item wui-focusable"
            data-wui-indicator-host=""
            onClick={() => setSelected(item.key)}
          >
            {item.icon != null && renderIcon(item.icon)}
            {item.text}
            {isSel && <span className="wui-selectorbar__indicator" data-wui-indicator="" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- CommandBar ---------------- */

export interface CommandBarProps {
  /** Where button labels go. Default 'right'. */
  labelPosition?: 'right' | 'bottom' | 'collapsed';
  /** Which side the commands sit on. Default 'right'. */
  align?: 'left' | 'right';
  /** Free content on the opposite side of the commands. */
  content?: ReactNode;
  /** Menu items for the "more" (…) menu. */
  secondaryCommands?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** AppBarButton, AppBarToggleButton and AppBarSeparator. */
  children?: ReactNode;
}

export function CommandBar({
  labelPosition = 'right',
  align = 'right',
  content,
  secondaryCommands,
  className,
  style,
  children,
}: CommandBarProps) {
  return (
    <div
      className={cx('wui-commandbar', className)}
      style={style}
      role="toolbar"
      data-labels={labelPosition}
      data-align={align}
    >
      {content != null && <div className="wui-commandbar__content">{content}</div>}
      <div className="wui-commandbar__primary">
        {children}
        {secondaryCommands != null && (
          <MenuFlyout
            placement="bottom-end"
            trigger={
              <button type="button" className="wui-appbar-button wui-focusable" aria-label="More" style={{ padding: 0 }}>
                <Icon name="more" />
              </button>
            }
          >
            {secondaryCommands}
          </MenuFlyout>
        )}
      </div>
    </div>
  );
}

export interface AppBarButtonProps {
  icon?: IconSource;
  label?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  /** Menu items to open instead of acting directly. */
  menu?: ReactNode;
  /** Flyout content to open instead of acting directly. */
  flyout?: ReactNode;
  'aria-label'?: string;
}

export function AppBarButton({ icon, label, disabled, onClick, menu, flyout, ...rest }: AppBarButtonProps) {
  const button = (
    <button
      type="button"
      className="wui-appbar-button wui-focusable"
      disabled={disabled}
      aria-label={rest['aria-label'] ?? (typeof label === 'string' ? label : undefined)}
      onClick={onClick}
    >
      {icon != null && renderIcon(icon)}
      {label != null && <span className="wui-appbar-button__label">{label}</span>}
    </button>
  );
  if (menu != null) return <MenuFlyout trigger={button}>{menu}</MenuFlyout>;
  if (flyout != null) {
    return (
      <Flyout trigger={button} placement="bottom">
        {flyout}
      </Flyout>
    );
  }
  return button;
}

export interface AppBarToggleButtonProps {
  icon?: IconSource;
  label?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function AppBarToggleButton({
  icon,
  label,
  disabled,
  checked,
  defaultChecked = false,
  onCheckedChange,
}: AppBarToggleButtonProps) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return (
    <button
      type="button"
      className="wui-appbar-button wui-focusable"
      disabled={disabled}
      aria-pressed={on}
      aria-label={typeof label === 'string' ? label : undefined}
      onClick={() => setOn(!on)}
    >
      {icon != null && renderIcon(icon)}
      {label != null && <span className="wui-appbar-button__label">{label}</span>}
    </button>
  );
}

export function AppBarSeparator() {
  return <span className="wui-appbar-separator" role="separator" />;
}

/* ---------------- MenuBar ---------------- */

interface MenuBarContextValue {
  openId: string | null;
  setOpenId: (id: string | null) => void;
}
const MenuBarContext = createContext<MenuBarContextValue | null>(null);

export interface MenuBarProps {
  className?: string;
  /** MenuBarItem elements. */
  children?: ReactNode;
}

export function MenuBar({ className, children }: MenuBarProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <MenuBarContext.Provider value={{ openId, setOpenId }}>
      <div className={cx('wui-menubar', className)} role="menubar">
        {children}
      </div>
    </MenuBarContext.Provider>
  );
}

export interface MenuBarItemProps {
  title: ReactNode;
  disabled?: boolean;
  /** The menu's items. */
  children?: ReactNode;
}

export function MenuBarItem({ title, disabled, children }: MenuBarItemProps) {
  const ctx = useContext(MenuBarContext);
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const open = ctx?.openId === id;
  return (
    <>
      <button
        ref={ref}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        className="wui-menubar__item wui-focusable"
        onClick={() => ctx?.setOpenId(open ? null : id)}
        onPointerEnter={() => {
          // With one menu open, hovering a sibling switches to it.
          if (ctx?.openId && ctx.openId !== id) ctx.setOpenId(id);
        }}
      >
        {title}
      </button>
      <MenuFlyout
        anchor={ref}
        open={open}
        onOpenChange={(o) => {
          if (!o && ctx?.openId === id) ctx.setOpenId(null);
        }}
      >
        {children}
      </MenuFlyout>
    </>
  );
}
