import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { cx, useControllable, useStretchIndicator } from '../utils';
import { ToolTip } from './Flyout';
import { ScrollView } from './Layout';
import { MenuFlyout, MenuFlyoutItem, MenuFlyoutSubItem } from './MenuFlyout';

export interface NavigationViewItem {
  key: string;
  label?: ReactNode;
  icon?: IconSource;
  /** 'item' (default), a non-interactive group 'header', or a 'separator' line. */
  type?: 'item' | 'header' | 'separator';
  children?: NavigationViewItem[];
  /** Usually an <InfoBadge />. */
  infoBadge?: ReactNode;
  disabled?: boolean;
  /** Set false for items that act (or only expand) without becoming selected. */
  selectable?: boolean;
}

export type PaneDisplayMode = 'auto' | 'left' | 'leftCompact' | 'leftMinimal' | 'top';

export interface NavigationViewProps {
  items: NavigationViewItem[];
  footerItems?: NavigationViewItem[];
  /** Show the Settings item at the bottom (key 'settings'). Pass a string to relabel it. */
  settings?: boolean | string;
  selectedKey?: string | null;
  defaultSelectedKey?: string | null;
  onSelectionChange?: (key: string, item: NavigationViewItem) => void;
  /** Called for every click on an item, selectable or not. */
  onItemInvoked?: (key: string, item: NavigationViewItem) => void;
  /**
   * 'auto' (default) picks by width: expanded at 1008px and up, compact from 641px,
   * minimal below that.
   */
  paneDisplayMode?: PaneDisplayMode;
  paneOpen?: boolean;
  defaultPaneOpen?: boolean;
  onPaneOpenChange?: (open: boolean) => void;
  paneTitle?: ReactNode;
  /** Show the hamburger button. Default true. */
  paneToggleButton?: boolean;
  /** Show the back button; 'disabled' shows it greyed out. */
  backButton?: boolean | 'disabled';
  onBack?: () => void;
  /** Search box shown at the top of the pane. */
  autoSuggestBox?: ReactNode;
  /** Extra content above the footer items. */
  paneFooter?: ReactNode;
  /** Title above the content. */
  header?: ReactNode;
  openPaneWidth?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface NavContextValue {
  selectedKey: string | null;
  paneOpen: boolean;
  top: boolean;
  expanded: Set<string>;
  toggle: (key: string) => void;
  invoke: (item: NavigationViewItem) => void;
}
const NavContext = createContext<NavContextValue | null>(null);

function contains(item: NavigationViewItem, key: string | null): boolean {
  if (key === null || !item.children) return false;
  return item.children.some((c) => c.key === key || contains(c, key));
}

function FlyoutItems({ items, onPick }: { items: NavigationViewItem[]; onPick: (i: NavigationViewItem) => void }) {
  return (
    <>
      {items.map((c) =>
        c.type === 'separator' || c.type === 'header' ? null : c.children?.length ? (
          <MenuFlyoutSubItem key={c.key} text={c.label} icon={c.icon} disabled={c.disabled}>
            <FlyoutItems items={c.children} onPick={onPick} />
          </MenuFlyoutSubItem>
        ) : (
          <MenuFlyoutItem key={c.key} icon={c.icon} disabled={c.disabled} onClick={() => onPick(c)}>
            {c.label}
          </MenuFlyoutItem>
        ),
      )}
    </>
  );
}

function NavItem({ item, depth, settings }: { item: NavigationViewItem; depth: number; settings?: boolean }) {
  const ctx = useContext(NavContext)!;
  const ref = useRef<HTMLButtonElement>(null);
  const [flyout, setFlyout] = useState(false);

  if (item.type === 'separator') return <div className="wui-nav__separator" role="separator" />;
  if (item.type === 'header') {
    return ctx.top ? null : <div className="wui-nav__group-header">{item.label}</div>;
  }

  const hasChildren = !!item.children?.length;
  const inline = hasChildren && ctx.paneOpen && !ctx.top;
  const isExpanded = inline && ctx.expanded.has(item.key);
  const selected =
    item.key === ctx.selectedKey || (contains(item, ctx.selectedKey) && !isExpanded);

  const button = (
    <button
      ref={ref}
      type="button"
      className="wui-nav__item"
      data-wui-indicator-host=""
      data-selected={selected || undefined}
      data-settings={settings || undefined}
      data-noicon={item.icon == null || undefined}
      data-nolabel={item.label == null || undefined}
      aria-current={item.key === ctx.selectedKey ? 'page' : undefined}
      aria-expanded={hasChildren ? (inline ? isExpanded : flyout) : undefined}
      disabled={item.disabled}
      onClick={() => {
        if (hasChildren) {
          if (inline) ctx.toggle(item.key);
          else setFlyout((f) => !f);
        }
        if (!hasChildren || inline) ctx.invoke(item);
      }}
    >
      {selected && <span className="wui-nav__indicator" data-wui-indicator="" />}
      {depth > 0 && !ctx.top && <span style={{ flex: 'none', width: depth * 28 }} />}
      {item.icon != null && <span className="wui-nav__icon">{renderIcon(item.icon)}</span>}
      {item.label != null && <span className="wui-nav__label">{item.label}</span>}
      {item.infoBadge != null && <span className="wui-nav__badge">{item.infoBadge}</span>}
      {hasChildren && (
        <span className="wui-nav__expander">
          <Icon name="chevronDown" size={12} />
        </span>
      )}
    </button>
  );

  const showTip = !ctx.paneOpen && !ctx.top && !flyout && typeof item.label === 'string';
  return (
    <>
      {showTip ? (
        <ToolTip content={item.label} placement="right">
          {button}
        </ToolTip>
      ) : (
        button
      )}
      {hasChildren && !inline && (
        <MenuFlyout
          anchor={ref}
          open={flyout}
          onOpenChange={setFlyout}
          placement={ctx.top ? 'bottom-start' : 'right-start'}
        >
          <FlyoutItems items={item.children!} onPick={ctx.invoke} />
        </MenuFlyout>
      )}
      {hasChildren && !ctx.top && (
        <div className="wui-nav__children" data-open={isExpanded || undefined}>
          <div>
            {item.children!.map((c) => (
              <NavItem key={c.key} item={c} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ChromeButton({
  glyph,
  label,
  disabled,
  onClick,
}: {
  glyph: 'menu' | 'back';
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="wui-nav__chrome-button wui-focusable"
      data-glyph={glyph}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={glyph} />
    </button>
  );
}

/**
 * App-level navigation: a collapsible left pane (or a top bar) plus a content area.
 * The selection pill stretches between items the way it does in WinUI.
 */
export function NavigationView({
  items,
  footerItems = [],
  settings,
  selectedKey,
  defaultSelectedKey = null,
  onSelectionChange,
  onItemInvoked,
  paneDisplayMode = 'auto',
  paneOpen,
  defaultPaneOpen,
  onPaneOpenChange,
  paneTitle,
  paneToggleButton = true,
  backButton = false,
  onBack,
  autoSuggestBox,
  paneFooter,
  header,
  openPaneWidth = 320,
  className,
  style,
  children,
}: NavigationViewProps) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    const el = root.current;
    if (!el || paneDisplayMode !== 'auto' || typeof ResizeObserver === 'undefined') return;
    // A width of 0 means the page is not laid out (hidden tab); keep the last real width.
    const measure = () => {
      if (el.clientWidth > 0) setWidth(el.clientWidth);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [paneDisplayMode]);

  const top = paneDisplayMode === 'top';
  const display: 'expanded' | 'compact' | 'minimal' =
    paneDisplayMode === 'left'
      ? 'expanded'
      : paneDisplayMode === 'leftCompact'
        ? 'compact'
        : paneDisplayMode === 'leftMinimal'
          ? 'minimal'
          : width >= 1008
            ? 'expanded'
            : width > 640
              ? 'compact'
              : 'minimal';

  // The expanded pane remembers the user's choice; an overlay pane always starts closed.
  const [inlineOpen, setInlineOpen] = useState(defaultPaneOpen ?? true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => setOverlayOpen(false), [display]);
  const overlay = display !== 'expanded';
  const isOpen = top ? true : (paneOpen ?? (overlay ? overlayOpen : inlineOpen));
  const setOpen = (next: boolean) => {
    if (overlay) setOverlayOpen(next);
    else setInlineOpen(next);
    onPaneOpenChange?.(next);
  };

  const [selected, setSelected] = useControllable<string | null>(selectedKey, defaultSelectedKey);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const settingsItem: NavigationViewItem | null = settings
    ? { key: 'settings', label: typeof settings === 'string' ? settings : 'Settings', icon: 'settings' }
    : null;

  const invoke = (item: NavigationViewItem) => {
    onItemInvoked?.(item.key, item);
    if (item.selectable !== false && item.key !== selected) {
      setSelected(item.key);
      onSelectionChange?.(item.key, item);
    }
    if (overlay && isOpen && !top) setOpen(false);
  };

  const paneRef = useRef<HTMLElement>(null);
  useStretchIndicator(paneRef, selected, top ? 'horizontal' : 'vertical');

  const ctx: NavContextValue = { selectedKey: selected, paneOpen: isOpen, top, expanded, toggle, invoke };
  const back =
    backButton !== false ? (
      <ChromeButton glyph="back" label="Back" disabled={backButton === 'disabled'} onClick={onBack} />
    ) : null;
  const toggleButton = paneToggleButton ? (
    <ChromeButton
      glyph="menu"
      label={isOpen ? 'Close navigation' : 'Open navigation'}
      onClick={() => setOpen(!isOpen)}
    />
  ) : null;

  const content = (
    <div className="wui-nav__content">
      {!top && display === 'minimal' && (back || toggleButton) && (
        <div className="wui-nav__minimal-bar">
          {back}
          {toggleButton}
        </div>
      )}
      {header != null && <h1 className="wui-nav__header">{header}</h1>}
      <div className="wui-nav__body">{children}</div>
    </div>
  );

  if (top) {
    return (
      <NavContext.Provider value={ctx}>
        <div ref={root} className={cx('wui-nav', className)} style={style} data-mode="top" data-open="true">
          <nav ref={paneRef} className="wui-nav__topbar" aria-label="Main">
            {back}
            <div className="wui-nav__items">
              {items.map((it) => (
                <NavItem key={it.key} item={it} depth={0} />
              ))}
            </div>
            {autoSuggestBox != null && <div style={{ width: 240, margin: '0 8px' }}>{autoSuggestBox}</div>}
            {paneFooter}
            {footerItems.map((it) => (
              <NavItem key={it.key} item={it} depth={0} />
            ))}
            {settingsItem && <NavItem item={{ ...settingsItem, label: undefined }} depth={0} settings />}
          </nav>
          {content}
        </div>
      </NavContext.Provider>
    );
  }

  return (
    <NavContext.Provider value={ctx}>
      <div
        ref={root}
        className={cx('wui-nav', className)}
        style={{ '--wui-nav-open-width': `${openPaneWidth}px`, ...style } as CSSProperties}
        data-mode="left"
        data-display={display}
        data-open={isOpen ? 'true' : 'false'}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && overlay && isOpen) setOpen(false);
        }}
      >
        {overlay && isOpen && <div className="wui-nav__scrim" onPointerDown={() => setOpen(false)} />}
        <div className="wui-nav__pane-slot">
          <nav
            ref={paneRef}
            className="wui-nav__pane"
            aria-label="Main"
            data-display={display}
            data-open={isOpen ? 'true' : 'false'}
          >
            <div className="wui-nav__pane-inner">
              {back && <div className="wui-nav__top">{back}</div>}
              {(toggleButton || paneTitle != null) && (
                <div className="wui-nav__top">
                  {toggleButton}
                  {paneTitle != null && (
                    <span className="wui-nav__pane-title" style={toggleButton ? undefined : { marginLeft: 16 }}>
                      {paneTitle}
                    </span>
                  )}
                </div>
              )}
              {autoSuggestBox != null && (
                <div className="wui-nav__search">
                  {autoSuggestBox}
                  <button
                    type="button"
                    className="wui-nav__chrome-button wui-nav__search-compact wui-focusable"
                    aria-label="Search"
                    onClick={() => setOpen(true)}
                  >
                    <Icon name="search" />
                  </button>
                </div>
              )}
              <ScrollView className="wui-nav__scroll">
                {items.map((it) => (
                  <NavItem key={it.key} item={it} depth={0} />
                ))}
              </ScrollView>
              <div className="wui-nav__footer">
                {paneFooter}
                {footerItems.map((it) => (
                  <NavItem key={it.key} item={it} depth={0} />
                ))}
                {settingsItem && <NavItem item={settingsItem} depth={0} settings />}
              </div>
            </div>
          </nav>
        </div>
        {content}
      </div>
    </NavContext.Provider>
  );
}

/* ---------------- Frame ---------------- */

export type PageTransition = 'entrance' | 'drillIn' | 'slideFromRight' | 'slideFromLeft' | 'suppress';

export interface FrameProps {
  /** Changing this replays the transition (use the route or page id). */
  pageKey: string | number;
  /** NavigationTransitionInfo. Default 'entrance' (slide up and fade in). */
  transition?: PageTransition;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Hosts a page and animates it in whenever `pageKey` changes. */
export function Frame({ pageKey, transition = 'entrance', className, style, children }: FrameProps) {
  return (
    <div key={pageKey} className={cx('wui-frame', className)} style={style} data-transition={transition}>
      {children}
    </div>
  );
}
