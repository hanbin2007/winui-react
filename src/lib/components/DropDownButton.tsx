import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { cx } from '../utils';
import { Button, type ButtonProps } from './Button';
import { Flyout } from './Flyout';
import { MenuFlyout } from './MenuFlyout';

export interface DropDownButtonProps extends Omit<ButtonProps, 'chevron'> {
  /** Menu items to show (MenuFlyoutItem and friends). */
  menu?: ReactNode;
  /** Or arbitrary flyout content. */
  flyout?: ReactNode;
}

/** A button with a chevron that opens a menu or flyout. */
export function DropDownButton({ menu, flyout, children, ...rest }: DropDownButtonProps) {
  const button = (
    <Button {...rest} chevron>
      {children}
    </Button>
  );
  if (menu != null) return <MenuFlyout trigger={button}>{menu}</MenuFlyout>;
  return (
    <Flyout trigger={button} placement="bottom">
      {flyout}
    </Flyout>
  );
}

export interface SplitButtonProps extends Omit<ButtonProps, 'chevron'> {
  menu?: ReactNode;
  flyout?: ReactNode;
  /** Accessible name of the drop-down half. */
  dropDownLabel?: string;
}

/** Two joined buttons: the main action, and a drop-down for more options. */
export function SplitButton({
  menu,
  flyout,
  dropDownLabel = 'More options',
  appearance,
  disabled,
  className,
  children,
  ...rest
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  return (
    <div ref={root} className={cx('wui-splitbutton', className)}>
      <Button {...rest} appearance={appearance} disabled={disabled}>
        {children}
      </Button>
      <Button
        appearance={appearance}
        disabled={disabled}
        aria-label={dropDownLabel}
        aria-haspopup={menu != null ? 'menu' : 'dialog'}
        aria-expanded={open}
        data-pressed={open || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="chevronDown" size={12} className="wui-button__chevron" />
      </Button>
      {menu != null ? (
        <MenuFlyout anchor={root} open={open} onOpenChange={setOpen}>
          {menu}
        </MenuFlyout>
      ) : (
        <Flyout anchor={root} open={open} onOpenChange={setOpen} placement="bottom">
          {flyout}
        </Flyout>
      )}
    </div>
  );
}
