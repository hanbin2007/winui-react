import type { CSSProperties, ReactNode } from 'react';
import { renderIcon, type IconSource } from '../Icon';
import { clamp, cx } from '../utils';
import { Button } from './Button';

/* ---------------- ProgressBar ---------------- */

export interface ProgressBarProps {
  /** 0..max. Leave undefined for the indeterminate animation. */
  value?: number;
  max?: number;
  /** 'paused' turns it amber, 'error' red. */
  state?: 'running' | 'paused' | 'error';
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function ProgressBar({ value, max = 100, state = 'running', className, style, ...rest }: ProgressBarProps) {
  const indeterminate = value === undefined;
  return (
    <div
      role="progressbar"
      aria-label={rest['aria-label']}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx('wui-progressbar', className)}
      style={style}
      data-indeterminate={indeterminate || undefined}
      data-state={state}
    >
      {indeterminate ? (
        <>
          <div className="wui-progressbar__bar wui-progressbar__ind1" />
          <div className="wui-progressbar__bar wui-progressbar__ind2" />
        </>
      ) : (
        <div className="wui-progressbar__bar" style={{ width: `${clamp((value / max) * 100, 0, 100)}%` }} />
      )}
    </div>
  );
}

/* ---------------- ProgressRing ---------------- */

export interface ProgressRingProps {
  /** 0..max. Leave undefined for the spinning animation. */
  value?: number;
  max?: number;
  /** Diameter in px. Default 32. */
  size?: number;
  state?: 'running' | 'paused' | 'error';
  /** Show a faint full ring behind the arc. */
  track?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

const RING_C = 2 * Math.PI * 7;

export function ProgressRing({
  value,
  max = 100,
  size = 32,
  state = 'running',
  track,
  className,
  style,
  ...rest
}: ProgressRingProps) {
  const indeterminate = value === undefined;
  const ratio = indeterminate ? 0 : clamp(value / max, 0, 1);
  return (
    <svg
      role="progressbar"
      aria-label={rest['aria-label'] ?? (indeterminate ? 'Loading' : undefined)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx('wui-progressring', className)}
      style={
        track ? ({ '--wui-progressring-track': 'var(--wui-control-strong-stroke-disabled)', ...style } as CSSProperties) : style
      }
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      data-indeterminate={indeterminate || undefined}
      data-state={state}
    >
      <circle className="wui-progressring__track" cx="8" cy="8" r="7" strokeWidth="2" />
      <circle
        className="wui-progressring__arc"
        cx="8"
        cy="8"
        r="7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={indeterminate ? undefined : `${RING_C} ${RING_C}`}
        strokeDashoffset={indeterminate ? undefined : RING_C * (1 - ratio)}
        style={!indeterminate && ratio === 0 ? { visibility: 'hidden' } : undefined}
      />
    </svg>
  );
}

/* ---------------- Status icon (shared) ---------------- */

export type Severity = 'informational' | 'success' | 'warning' | 'error';

const statusGlyph: Record<Severity, ReactNode> = {
  informational: (
    <>
      <path d="M8 7.2v4.3" />
      <circle cx="8" cy="4.7" r="0.6" fill="currentColor" />
    </>
  ),
  success: <path d="M4.6 8.3 7 10.7l4.4-4.6" />,
  warning: (
    <>
      <path d="M8 4.2v4.6" />
      <circle cx="8" cy="11.3" r="0.6" fill="currentColor" />
    </>
  ),
  error: <path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" />,
};

/** The filled round status glyph used by InfoBar. */
export function StatusIcon({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cx('wui-status-icon', className)}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {statusGlyph[severity]}
      </svg>
    </span>
  );
}

/* ---------------- InfoBar ---------------- */

export interface InfoBarProps {
  /** Default true. */
  open?: boolean;
  onClose?: () => void;
  severity?: Severity;
  title?: ReactNode;
  message?: ReactNode;
  /** Usually a Button or HyperlinkButton. */
  action?: ReactNode;
  /** Show the close (x) button. Default true. */
  closable?: boolean;
  /** Hide the severity icon. */
  iconless?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** An inline, app-level status message. */
export function InfoBar({
  open = true,
  onClose,
  severity = 'informational',
  title,
  message,
  action,
  closable = true,
  iconless,
  className,
  style,
  children,
}: InfoBarProps) {
  if (!open) return null;
  return (
    <div
      role={severity === 'error' || severity === 'warning' ? 'alert' : 'status'}
      className={cx('wui-infobar', className)}
      style={style}
      data-severity={severity}
    >
      {!iconless && <StatusIcon severity={severity} className="wui-infobar__icon" />}
      <div className="wui-infobar__body">
        {title != null && <span className="wui-infobar__title">{title}</span>}
        {message != null && <span className="wui-infobar__message">{message}</span>}
        {children}
        {action != null && <span className="wui-infobar__action">{action}</span>}
      </div>
      {closable ? (
        <Button appearance="subtle" icon="close" aria-label="Close" className="wui-infobar__close" onClick={onClose} />
      ) : (
        <span style={{ width: 16 }} />
      )}
    </div>
  );
}

/* ---------------- InfoBadge ---------------- */

export interface InfoBadgeProps {
  /** A number shows a value badge; omit both value and icon for a dot. */
  value?: number | string;
  icon?: IconSource;
  severity?: 'attention' | 'informational' | 'success' | 'caution' | 'critical';
  className?: string;
  style?: CSSProperties;
}

/** A small dot, number or icon that flags something new or needing attention. */
export function InfoBadge({ value, icon, severity = 'attention', className, style }: InfoBadgeProps) {
  const kind = icon != null ? 'icon' : value != null ? 'value' : 'dot';
  return (
    <span className={cx('wui-infobadge', className)} style={style} data-kind={kind} data-severity={severity}>
      {kind === 'icon' ? renderIcon(icon, 10) : kind === 'value' ? value : null}
    </span>
  );
}
