import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Popup, type Placement } from '../Popup';
import { Portal } from '../theme';
import { withTrigger } from '../trigger';
import { cx, getFocusable, useControllable, usePresence } from '../utils';
import { Button } from './Button';

/* ---------------- Flyout ---------------- */

export interface FlyoutProps {
  /** Element that opens the flyout when clicked. */
  trigger?: ReactElement;
  /** Or: an element to place the flyout against, with `open` controlled by you. */
  anchor?: RefObject<HTMLElement | null> | HTMLElement | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default 'top', like WinUI. Flips when there is no room. */
  placement?: Placement;
  offset?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** A light-dismiss popup holding arbitrary content. */
export function Flyout({
  trigger,
  anchor,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  offset = 8,
  className,
  style,
  children,
}: FlyoutProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const ref = useRef<HTMLElement>(null);
  return (
    <>
      {trigger &&
        withTrigger(trigger, ref, {
          onClick: () => setOpen(!isOpen),
          'aria-expanded': isOpen,
          'aria-haspopup': 'dialog',
        })}
      <Popup
        open={isOpen}
        anchor={trigger ? ref : anchor}
        placement={placement}
        offset={offset}
        onDismiss={() => setOpen(false)}
        className={cx('wui-flyout wui-acrylic', className)}
        style={style}
        role="dialog"
      >
        {children}
      </Popup>
    </>
  );
}

/* ---------------- ToolTip ---------------- */

export interface ToolTipProps {
  /** Tooltip text or content. */
  content: ReactNode;
  placement?: Placement;
  /** Hover delay in ms before showing. Default 500. */
  delay?: number;
  /** The element the tooltip describes. */
  children: ReactElement;
}

export function ToolTip({ content, placement = 'top', delay = 500, children }: ToolTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const show = (ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), ms);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  if (content == null || content === '') return children;
  return (
    <>
      {withTrigger(children, ref, {
        onPointerEnter: (e: { pointerType?: string }) => {
          if (e.pointerType !== 'touch') show(delay);
        },
        onPointerLeave: hide,
        onPointerDown: hide,
        onFocus: (e: { currentTarget: Element }) => {
          if (e.currentTarget.matches(':focus-visible')) show(0);
        },
        onBlur: hide,
        onKeyDown: (e: { key: string }) => {
          if (e.key === 'Escape') hide();
        },
        'aria-describedby': open ? id : undefined,
      })}
      <Popup
        open={open}
        anchor={ref}
        placement={placement}
        offset={8}
        animation="fade"
        lightDismiss={false}
        autoFocus={false}
        className="wui-tooltip wui-acrylic"
        role="tooltip"
        id={id}
      >
        {content}
      </Popup>
    </>
  );
}

/* ---------------- ContentDialog ---------------- */

export interface ContentDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  primaryButtonText?: ReactNode;
  secondaryButtonText?: ReactNode;
  closeButtonText?: ReactNode;
  /** Which button gets the accent style and Enter. Default 'primary'. */
  defaultButton?: 'primary' | 'secondary' | 'close' | 'none';
  primaryButtonDisabled?: boolean;
  secondaryButtonDisabled?: boolean;
  /** Return false to keep the dialog open. */
  onPrimaryClick?: () => void | boolean;
  onSecondaryClick?: () => void | boolean;
  onCloseClick?: () => void | boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function DialogSurface({
  open,
  onOpenChange,
  title,
  primaryButtonText,
  secondaryButtonText,
  closeButtonText,
  defaultButton = 'primary',
  primaryButtonDisabled,
  secondaryButtonDisabled,
  onPrimaryClick,
  onSecondaryClick,
  onCloseClick,
  className,
  style,
  children,
}: ContentDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    if (el) {
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? getFocusable(el)[0] ?? el;
      target.focus({ preventScroll: true });
    }
    return () => prev?.focus?.({ preventScroll: true });
  }, []);

  const run = (handler?: () => void | boolean) => {
    if (handler?.() === false) return;
    onOpenChange?.(false);
  };
  const buttons = [
    primaryButtonText != null && {
      key: 'primary' as const,
      text: primaryButtonText,
      disabled: primaryButtonDisabled,
      handler: onPrimaryClick,
    },
    secondaryButtonText != null && {
      key: 'secondary' as const,
      text: secondaryButtonText,
      disabled: secondaryButtonDisabled,
      handler: onSecondaryClick,
    },
    closeButtonText != null && {
      key: 'close' as const,
      text: closeButtonText,
      disabled: false,
      handler: onCloseClick,
    },
  ].filter(Boolean) as Array<{
    key: 'primary' | 'secondary' | 'close';
    text: ReactNode;
    disabled?: boolean;
    handler?: () => void | boolean;
  }>;

  return (
    <div className="wui-smoke" data-state={open ? 'open' : 'closed'}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        tabIndex={-1}
        className={cx('wui-dialog', className)}
        style={style}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            run(onCloseClick);
          } else if (e.key === 'Tab' && ref.current) {
            const items = getFocusable(ref.current);
            if (items.length === 0) return e.preventDefault();
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="wui-dialog__body">
          {title != null && (
            <h2 id={titleId} className="wui-dialog__title">
              {title}
            </h2>
          )}
          {children}
        </div>
        {buttons.length > 0 && (
          <div className="wui-dialog__commands" data-count={buttons.length}>
            {buttons.map((b) => (
              <Button
                key={b.key}
                appearance={defaultButton === b.key ? 'accent' : 'standard'}
                data-autofocus={defaultButton === b.key || undefined}
                disabled={b.disabled}
                onClick={() => run(b.handler)}
              >
                {b.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** A modal dialog over a smoke layer, with up to three buttons. */
export function ContentDialog(props: ContentDialogProps) {
  const { mounted } = usePresence(props.open, 90);
  if (!mounted) return null;
  return (
    <Portal>
      <DialogSurface {...props} />
    </Portal>
  );
}

/* ---------------- TeachingTip ---------------- */

export interface TeachingTipProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element the tip points at. Without it the tip sits at the bottom of the window. */
  target?: RefObject<HTMLElement | null> | HTMLElement | null;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Image or other content across the top. */
  hero?: ReactNode;
  placement?: Placement;
  /** Close when the user presses outside. Default false. */
  lightDismiss?: boolean;
  actionButtonText?: ReactNode;
  onActionClick?: () => void;
  closeButtonText?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** A non-modal tip that points at an element to teach or announce something. */
export function TeachingTip({
  open,
  onOpenChange,
  target,
  title,
  subtitle,
  hero,
  placement = 'top',
  lightDismiss = false,
  actionButtonText,
  onActionClick,
  closeButtonText,
  className,
  children,
}: TeachingTipProps) {
  const close = () => onOpenChange?.(false);
  const hasTarget = !!target;
  return (
    <Popup
      open={open}
      anchor={target}
      placement={placement}
      offset={hasTarget ? 12 : 0}
      animation="none"
      lightDismiss={lightDismiss}
      autoFocus={false}
      onDismiss={close}
      position={
        hasTarget
          ? undefined
          : (_a, size) => ({
              left: Math.round((document.documentElement.clientWidth - size.width) / 2),
              top: document.documentElement.clientHeight - size.height - 24,
              side: 'top',
            })
      }
      className={cx('wui-teachingtip wui-acrylic', className)}
      role="dialog"
    >
      {hasTarget && <span className="wui-teachingtip__tail" />}
      {hero != null && <div className="wui-teachingtip__hero">{hero}</div>}
      <div className="wui-teachingtip__content">
        {title != null && <p className="wui-teachingtip__title">{title}</p>}
        {subtitle != null && <p className="wui-teachingtip__subtitle">{subtitle}</p>}
        {closeButtonText == null && (
          <Button
            appearance="subtle"
            icon="close"
            aria-label="Close"
            className="wui-teachingtip__close"
            onClick={close}
          />
        )}
        {children != null && <div className="wui-teachingtip__body">{children}</div>}
        {(actionButtonText != null || closeButtonText != null) && (
          <div className="wui-teachingtip__actions">
            {actionButtonText != null && (
              <Button appearance="accent" onClick={onActionClick}>
                {actionButtonText}
              </Button>
            )}
            {closeButtonText != null && <Button onClick={close}>{closeButtonText}</Button>}
          </div>
        )}
      </div>
    </Popup>
  );
}
