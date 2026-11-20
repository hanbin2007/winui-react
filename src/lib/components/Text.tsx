import { createElement, type HTMLAttributes } from 'react';
import { cx } from '../utils';

export type TextVariant =
  | 'caption'
  | 'body'
  | 'bodyStrong'
  | 'bodyLarge'
  | 'subtitle'
  | 'title'
  | 'titleLarge'
  | 'display';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** A step on the WinUI type ramp. Default 'body'. */
  variant?: TextVariant;
  /** Foreground: primary (default), secondary, tertiary, disabled or accent. */
  tone?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent';
  /** Element to render. Defaults to a heading for title styles, otherwise span. */
  as?: keyof HTMLElementTagNameMap;
  block?: boolean;
}

const DEFAULT_TAG: Partial<Record<TextVariant, keyof HTMLElementTagNameMap>> = {
  subtitle: 'h3',
  title: 'h2',
  titleLarge: 'h1',
  display: 'h1',
};

/** TextBlock: text styled with the WinUI type ramp. */
export function Text({
  variant = 'body',
  tone = 'primary',
  as,
  block,
  className,
  style,
  ...rest
}: TextProps) {
  return createElement(as ?? DEFAULT_TAG[variant] ?? 'span', {
    ...rest,
    className: cx(
      'wui-text',
      `wui-text--${variant}`,
      tone !== 'primary' && `wui-text--${tone}`,
      className,
    ),
    style: block ? { display: 'block', ...style } : style,
  });
}
