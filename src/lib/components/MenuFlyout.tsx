import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Icon, renderIcon, type IconSource } from '../Icon';
import { Popup, type Placement } from '../Popup';
import { withTrigger } from '../trigger';
import { cx, useControllable } from '../utils';

interface MenuContextValue {
  closeAll: () => void;
  hasChecks: boolean;
  hasIcons: boolean;
  openSub: string | null;
  setOpenSub: (id: string | null) => void;
}
const MenuContext = createContext<MenuContextValue | null>(null);

type MenuRole = 'item' | 'check' | 'sub' | 'separator';
type WithRole = { wuiMenuRole?: MenuRole };

function flatten(children: ReactNode): ReactElement[] {
  const out: ReactElement[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) out.push(...flatten((child.props as { children?: ReactNode }).children));
    else out.push(child);
  });
  return out;
}

interface MenuSurfaceProps {
  open: boolean;
  anchor?: RefObject<HTMLElement | null> | HTMLElement | null;
  point?: { x: number; y: number } | null;
  placement: Placement;
  offset?: number;
  onDismiss: () => void;
  closeAll: () => void;
  isSub?: boolean;
  className?: string;
  children?: ReactNode;
}

function MenuSurface({
  open,
  anchor,
  point,
  placement,
  offset = 4,
  onDismiss,
  closeAll,
  isSub,
  className,
  children,
}: MenuSurfaceProps) {
  const [openSub, setOpenSub] = useState<string | null>(null);
  useEffect(() => {
    if (!open) setOpenSub(null);
  }, [open]);
  const kids = flatten(children);
  const hasChecks = kids.some((k) => (k.type as WithRole).wuiMenuRole === 'check');
  const hasIcons = kids.some((k) => (k.props as { icon?: unknown }).icon != null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const surface = e.currentTarget;
    // Keys from a nested submenu bubble here through the React tree; ignore them.
    if (!(e.target instanceof Node) || !surface.contains(e.target)) return;
    const items = Array.from(
      surface.querySelectorAll<HTMLElement>(':scope > .wui-menu__item:not([aria-disabled="true"])'),
    );
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (e.key === 'ArrowLeft' && isSub) {
      e.preventDefault();
      e.stopPropagation();
      onDismiss();
      return;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }
    if (next) {
      e.preventDefault();
      e.stopPropagation();
      next.focus();
    }
  };

  return (
    <MenuContext.Provider value={{ closeAll, hasChecks, hasIcons, openSub, setOpenSub }}>
      <Popup
        open={open}
        anchor={anchor}
        point={point}
        placement={placement}
        offset={offset}
        onDismiss={onDismiss}
        className={cx('wui-menu wui-acrylic', className)}
        role="menu"
        onKeyDown={onKeyDown}
      >
        {children}
      </Popup>
    </MenuContext.Provider>
  );
}

/* ---------------- MenuFlyout ---------------- */

export interface MenuFlyoutProps {
  /** Element that opens the menu when clicked. */
  trigger?: ReactElement;
  /** Or: an element to place the menu against, with `open` controlled by you. */
  anchor?: RefObject<HTMLElement | null> | HTMLElement | null;
  /** Or: a viewport point (for context menus). */
  point?: { x: number; y: number } | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  className?: string;
  /** MenuFlyoutItem, ToggleMenuFlyoutItem, RadioMenuFlyoutItem, MenuFlyoutSubItem, MenuFlyoutSeparator. */
  children?: ReactNode;
}

export function MenuFlyout({
  trigger,
  anchor,
  point,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  className,
  children,
}: MenuFlyoutProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const ref = useRef<HTMLElement>(null);
  const close = () => setOpen(false);
  return (
    <>
      {trigger &&
        withTrigger(trigger, ref, {
          onClick: () => setOpen(!isOpen),
          'aria-expanded': isOpen,
          'aria-haspopup': 'menu',
          'data-pressed': isOpen || undefined,
        })}
      <MenuSurface
        open={isOpen}
        anchor={trigger ? ref : anchor}
        point={point}
        placement={placement}
        offset={point ? 0 : 4}
        onDismiss={close}
        closeAll={close}
        className={className}
      >
        {children}
      </MenuSurface>
    </>
  );
}

/* ---------------- Items ---------------- */

interface ItemShellProps {
  role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
  icon?: IconSource;
  check?: ReactNode;
  checked?: boolean;
  accelerator?: ReactNode;
  disabled?: boolean;
  trailing?: ReactNode;
  onInvoke?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  itemRef?: RefObject<HTMLDivElement | null>;
  dataOpen?: boolean;
  hasPopup?: boolean;
  children?: ReactNode;
}

function ItemShell({
  role,
  icon,
  check,
  checked,
  accelerator,
  disabled,
  trailing,
  onInvoke,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  itemRef,
  dataOpen,
  hasPopup,
  children,
}: ItemShellProps) {
  const ctx = useContext(MenuContext);
  return (
    <div
      ref={itemRef}
      role={role}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      aria-checked={role === 'menuitem' ? undefined : !!checked}
      aria-haspopup={hasPopup ? 'menu' : undefined}
      aria-expanded={hasPopup ? !!dataOpen : undefined}
      data-open={dataOpen || undefined}
      className="wui-menu__item"
      onClick={() => !disabled && onInvoke?.()}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) onInvoke?.();
        }
      }}
    >
      {ctx?.hasChecks && <span className="wui-menu__check">{check}</span>}
      {ctx?.hasIcons && <span className="wui-menu__icon">{icon != null && renderIcon(icon)}</span>}
      <span className="wui-menu__text">{children}</span>
      {accelerator != null && <span className="wui-menu__accel">{accelerator}</span>}
      {trailing}
    </div>
  );
}

export interface MenuFlyoutItemProps {
  icon?: IconSource;
  /** Shortcut hint shown on the right, for example "Ctrl+C". */
  accelerator?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function MenuFlyoutItem({ icon, accelerator, disabled, onClick, children }: MenuFlyoutItemProps) {
  const ctx = useContext(MenuContext);
  return (
    <ItemShell
      role="menuitem"
      icon={icon}
      accelerator={accelerator}
      disabled={disabled}
      onPointerEnter={() => ctx?.setOpenSub(null)}
      onInvoke={() => {
        onClick?.();
        ctx?.closeAll();
      }}
    >
      {children}
    </ItemShell>
  );
}
(MenuFlyoutItem as WithRole).wuiMenuRole = 'item';

export interface ToggleMenuFlyoutItemProps extends Omit<MenuFlyoutItemProps, 'onClick'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function ToggleMenuFlyoutItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  icon,
  accelerator,
  disabled,
  children,
}: ToggleMenuFlyoutItemProps) {
  const ctx = useContext(MenuContext);
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return (
    <ItemShell
      role="menuitemcheckbox"
      icon={icon}
      checked={on}
      check={on ? <Icon name="check" size={12} /> : null}
      accelerator={accelerator}
      disabled={disabled}
      onPointerEnter={() => ctx?.setOpenSub(null)}
      onInvoke={() => {
        setOn(!on);
        ctx?.closeAll();
      }}
    >
      {children}
    </ItemShell>
  );
}
(ToggleMenuFlyoutItem as WithRole).wuiMenuRole = 'check';

export interface RadioMenuFlyoutItemProps extends Omit<MenuFlyoutItemProps, 'onClick'> {
  checked: boolean;
  onSelect?: () => void;
}

export function RadioMenuFlyoutItem({
  checked,
  onSelect,
  icon,
  accelerator,
  disabled,
  children,
}: RadioMenuFlyoutItemProps) {
  const ctx = useContext(MenuContext);
  return (
    <ItemShell
      role="menuitemradio"
      icon={icon}
      checked={checked}
      check={checked ? <span className="wui-menu__bullet" /> : null}
      accelerator={accelerator}
      disabled={disabled}
      onPointerEnter={() => ctx?.setOpenSub(null)}
      onInvoke={() => {
        onSelect?.();
        ctx?.closeAll();
      }}
    >
      {children}
    </ItemShell>
  );
}
(RadioMenuFlyoutItem as WithRole).wuiMenuRole = 'check';

export function MenuFlyoutSeparator() {
  return <div role="separator" className="wui-menu__sep" />;
}
(MenuFlyoutSeparator as WithRole).wuiMenuRole = 'separator';

export interface MenuFlyoutSubItemProps {
  /** Label of the item that opens the submenu. */
  text: ReactNode;
  icon?: IconSource;
  disabled?: boolean;
  /** The submenu's items. */
  children?: ReactNode;
}

export function MenuFlyoutSubItem({ text, icon, disabled, children }: MenuFlyoutSubItemProps) {
  const ctx = useContext(MenuContext);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const open = ctx?.openSub === id;
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = () => {
    clearTimeout(timer.current);
    ctx?.setOpenSub(id);
  };
  return (
    <>
      <ItemShell
        role="menuitem"
        icon={icon}
        disabled={disabled}
        itemRef={ref}
        hasPopup
        dataOpen={open}
        trailing={<Icon name="chevronRight" size={12} className="wui-menu__chevron" />}
        onInvoke={show}
        onPointerEnter={() => {
          clearTimeout(timer.current);
          timer.current = setTimeout(show, 250);
        }}
        onPointerLeave={() => clearTimeout(timer.current)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            show();
          }
        }}
      >
        {text}
      </ItemShell>
      <MenuSurface
        open={!!open}
        anchor={ref}
        placement="right-start"
        offset={-2}
        isSub
        onDismiss={() => ctx?.setOpenSub(null)}
        closeAll={() => ctx?.closeAll()}
      >
        {children}
      </MenuSurface>
    </>
  );
}
(MenuFlyoutSubItem as WithRole).wuiMenuRole = 'sub';

/* ---------------- ContextMenu ---------------- */

export interface ContextMenuProps {
  /** Menu items shown on right-click (or the menu key). */
  menu: ReactNode;
  /** The element that owns the context menu. */
  children: ReactElement;
}

/** Shows a MenuFlyout at the pointer when its child is right-clicked. */
export function ContextMenu({ menu, children }: ContextMenuProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      {withTrigger(children, ref, {
        onContextMenu: (e: { preventDefault(): void; clientX: number; clientY: number }) => {
          e.preventDefault();
          let { clientX: x, clientY: y } = e;
          if (x === 0 && y === 0 && ref.current) {
            // Opened from the keyboard: use the element's centre.
            const r = ref.current.getBoundingClientRect();
            x = r.left + r.width / 2;
            y = r.top + r.height / 2;
          }
          setPoint({ x, y });
        },
      })}
      <MenuFlyout
        open={point !== null}
        point={point}
        onOpenChange={(o) => {
          if (!o) setPoint(null);
        }}
      >
        {menu}
      </MenuFlyout>
    </>
  );
}
