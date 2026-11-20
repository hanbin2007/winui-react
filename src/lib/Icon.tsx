import type { ReactNode, SVGProps } from 'react';
import { cx } from './utils';

function gearPath(teeth = 8, ro = 6.7, ri = 5.2): string {
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const p = (r: number, a: number) =>
    `${(8 + r * Math.cos(a)).toFixed(2)} ${(8 + r * Math.sin(a)).toFixed(2)}`;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    pts.push(p(ri, a - step * 0.28), p(ro, a - step * 0.15), p(ro, a + step * 0.15), p(ri, a + step * 0.28));
  }
  return `M${pts.join('L')}Z`;
}

function starPath(R = 6.6, r = 2.9, cy = 8.5): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(8 + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

const dot = (cx_: number, cy: number, r = 0.9) => (
  <circle cx={cx_} cy={cy} r={r} fill="currentColor" stroke="none" />
);

/**
 * Built-in glyphs, drawn on a 16px grid with 1px strokes in the style of
 * Segoe Fluent Icons. Pass any other SVG content as children of <Icon>.
 */
const glyphs = {
  chevronDown: <path d="M3 5.75 8 10.75l5-5" />,
  chevronUp: <path d="M3 10.25 8 5.25l5 5" />,
  chevronRight: <path d="M5.75 3 10.75 8l-5 5" />,
  chevronLeft: <path d="M10.25 3 5.25 8l5 5" />,
  caretDown: <path d="M4 6.5h8L8 10.5Z" fill="currentColor" />,
  caretUp: <path d="M4 9.5h8L8 5.5Z" fill="currentColor" />,
  check: <path d="M2.5 8.5 6 12l7.5-7.5" />,
  close: <path d="M3 3l10 10M13 3 3 13" />,
  add: <path d="M8 2.5v11M2.5 8h11" />,
  subtract: <path d="M2.5 8h11" />,
  more: (
    <>
      {dot(3, 8, 1)}
      {dot(8, 8, 1)}
      {dot(13, 8, 1)}
    </>
  ),
  menu: <path d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13" />,
  back: <path d="M13.5 8h-11M7 3.5 2.5 8 7 12.5" />,
  forward: <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />,
  arrowUp: <path d="M8 13.5v-11M3.5 7 8 2.5 12.5 7" />,
  arrowDown: <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" />,
  search: (
    <>
      <circle cx="9.5" cy="6.5" r="4.5" />
      <path d="M6.3 9.7 2 14" />
    </>
  ),
  home: <path d="M2.5 7.5 8 2.5l5.5 5v6h-4v-4h-3v4h-4Z" />,
  settings: (
    <>
      <path d={gearPath()} />
      <circle cx="8" cy="8" r="2.2" />
    </>
  ),
  person: (
    <>
      <circle cx="8" cy="5" r="2.75" />
      <path d="M2.75 13.75c0-2.6 2.1-4 5.25-4s5.25 1.4 5.25 4" />
    </>
  ),
  people: (
    <>
      <circle cx="5.75" cy="5.5" r="2.25" />
      <path d="M1.5 13.25c0-2.2 1.7-3.5 4.25-3.5S10 11.05 10 13.25" />
      <circle cx="11.5" cy="6" r="1.75" />
      <path d="M11.75 9.75c1.7.1 2.75 1.1 2.75 2.75" />
    </>
  ),
  mail: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="m2 4.5 6 4.5 6-4.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.75" />
      <path d="M2.5 6h11" />
      {dot(5.5, 8.5, 0.7)}
      {dot(8, 8.5, 0.7)}
      {dot(10.5, 8.5, 0.7)}
      {dot(5.5, 11, 0.7)}
      {dot(8, 11, 0.7)}
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </>
  ),
  star: <path d={starPath()} />,
  starFilled: <path d={starPath()} fill="currentColor" />,
  heart: (
    <path d="M8 13.5S2 10 2 5.9C2 4 3.5 2.5 5.2 2.5c1.2 0 2.2.7 2.8 1.7.6-1 1.6-1.7 2.8-1.7C12.5 2.5 14 4 14 5.9 14 10 8 13.5 8 13.5Z" />
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.25v4" />
      {dot(8, 4.9, 0.75)}
    </>
  ),
  help: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M6.2 6.4a1.85 1.85 0 1 1 2.7 1.6c-.6.35-.9.75-.9 1.4" />
      {dot(8, 11.4, 0.75)}
    </>
  ),
  warning: (
    <>
      <path d="M8 2 14.5 13.5h-13Z" />
      <path d="M8 6.5v3.5" />
      {dot(8, 11.75, 0.7)}
    </>
  ),
  edit: (
    <path d="m2.5 13.5.8-3.1 7.6-7.6a1.63 1.63 0 0 1 2.3 2.3l-7.6 7.6ZM9.8 3.9l2.3 2.3" />
  ),
  delete: (
    <path d="M2.5 4.5h11M6 4.5V3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1.5M4 4.5l.6 8.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L12 4.5M6.75 7v4M9.25 7v4" />
  ),
  copy: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M3.5 10.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
    </>
  ),
  cut: (
    <>
      <circle cx="4.5" cy="11.75" r="1.75" />
      <circle cx="11.5" cy="11.75" r="1.75" />
      <path d="M5.6 10.4 11.5 2M10.4 10.4 4.5 2" />
    </>
  ),
  paste: (
    <>
      <path d="M5.5 3.5h-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
      <rect x="5.5" y="2" width="5" height="2.5" rx=".75" />
    </>
  ),
  save: (
    <path d="M2.5 3.5a1 1 0 0 1 1-1h7.6l2.4 2.4v7.6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1ZM5 2.5v3h5v-3M4.5 13.5V9h7v4.5" />
  ),
  share: <path d="M9 2.5 14 7l-5 4.5V8.8c-3.5 0-5.6 1.2-7 4.2.3-4.5 2.7-7.4 7-7.7Z" />,
  folder: (
    <path d="M1.5 4a1 1 0 0 1 1-1h3.3l1.7 1.5h6a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" />
  ),
  document: (
    <path d="M3.5 2.5a1 1 0 0 1 1-1H9l3.5 3.5v8.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1ZM9 1.5V5h3.5" />
  ),
  image: (
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <circle cx="10.5" cy="6" r="1.1" />
      <path d="m2 12 3.8-4L9 11l1.8-1.5 3.2 2.8" />
    </>
  ),
  play: <path d="M4.5 2.5 13 8l-8.5 5.5Z" />,
  pause: <path d="M5 3v10M11 3v10" />,
  refresh: <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" />,
  sync: <path d="M13.5 6.5A5.5 5.5 0 0 0 3.6 4.9M2.5 2.5v3h3M2.5 9.5a5.5 5.5 0 0 0 9.9 1.6M13.5 13.5v-3h-3" />,
  download: <path d="M8 2v8.5M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11" />,
  upload: <path d="M8 11V2.5M4.5 6 8 2.5 11.5 6M2.5 13.5h11" />,
  filter: <path d="M2 3.5h12M4.5 8h7M6.5 12.5h3" />,
  sort: <path d="M4.5 2.5v11M2 5 4.5 2.5 7 5M11.5 13.5v-11M9 11l2.5 2.5L14 11" />,
  lock: (
    <>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.25" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </>
  ),
  eye: (
    <>
      <path d="M1.5 8C3 5 5.3 3.5 8 3.5S13 5 14.5 8c-1.5 3-3.8 4.5-6.5 4.5S3 11 1.5 8Z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  bell: <path d="M4 11.5V7a4 4 0 0 1 8 0v4.5l1 1H3ZM6.5 13.5a1.5 1.5 0 0 0 3 0" />,
  globe: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <ellipse cx="8" cy="8" rx="2.7" ry="6.25" />
      <path d="M1.75 8h12.5" />
    </>
  ),
  code: <path d="M5.5 4 1.5 8l4 4M10.5 4l4 4-4 4" />,
  grid: (
    <>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </>
  ),
  list: (
    <>
      <path d="M5.5 4h8.5M5.5 8h8.5M5.5 12h8.5" />
      {dot(2.5, 4, 0.8)}
      {dot(2.5, 8, 0.8)}
      {dot(2.5, 12, 0.8)}
    </>
  ),
  openExternal: (
    <path d="M9 2.5h4.5V7M13.5 2.5l-6 6M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3" />
  ),
  undo: <path d="M2.5 3v4h4M2.5 7C4 4.7 6 3.5 8.5 3.5a5 5 0 0 1 0 10H6" />,
  redo: <path d="M13.5 3v4h-4M13.5 7C12 4.7 10 3.5 7.5 3.5a5 5 0 0 0 0 10H10" />,
  send: <path d="M2 2.5 14.5 8 2 13.5 3.8 8ZM3.8 8h5.7" />,
  attach: (
    <path d="M13 7.5 8 12.5a3 3 0 0 1-4.3-4.2l5.4-5.4a2 2 0 0 1 2.9 2.8L6.7 11a1 1 0 0 1-1.5-1.4l4.6-4.6" />
  ),
  pin: <path d="M9.5 2 14 6.5l-2 .5-2.5 2.5-.2 3.3L3.2 6.7l3.3-.2L9 4ZM6 10l-3.5 3.5" />,
  flag: <path d="M3.5 14V2.5M3.5 3h9l-2 3 2 3h-9" />,
  tag: (
    <>
      <path d="M2.5 2.5h5l6 6-5 5-6-6Z" />
      {dot(5.25, 5.25, 0.8)}
    </>
  ),
  comment: (
    <path d="M2.5 3.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 3v-3h-.5a1 1 0 0 1-1-1Z" />
  ),
  like: (
    <path d="M5 7 7.5 2c1.2 0 1.9 1 1.6 2.2L8.6 6.5H12a1.3 1.3 0 0 1 1.3 1.6l-1 4.3a1.5 1.5 0 0 1-1.5 1.1H5ZM5 7H2.5v6.5H5" />
  ),
  print: (
    <>
      <path d="M4.5 5.5v-3h7v3M4.5 11.5h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1" />
      <rect x="4.5" y="9.5" width="7" height="4" />
    </>
  ),
  fullScreen: <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />,
  zoomIn: (
    <>
      <circle cx="9.5" cy="6.5" r="4.5" />
      <path d="M6.3 9.7 2 14M9.5 4.5v4M7.5 6.5h4" />
    </>
  ),
  library: <path d="M3 2.5v11M6 2.5v11M9 3.5l3.5 9.5" />,
  music: (
    <>
      <path d="M6 11.5V3.5l7-1.5v8" />
      <circle cx="4.25" cy="11.75" r="1.75" />
      <circle cx="11.25" cy="10.25" r="1.75" />
    </>
  ),
  video: (
    <>
      <rect x="1.5" y="4" width="9" height="8" rx="1.5" />
      <path d="m10.5 7 4-2.5v7l-4-2.5" />
    </>
  ),
  camera: (
    <>
      <path d="M1.5 5.5a1 1 0 0 1 1-1h2l1-1.5h5l1 1.5h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" />
      <circle cx="8" cy="8.25" r="2.5" />
    </>
  ),
  mic: (
    <>
      <rect x="6" y="1.5" width="4" height="8" rx="2" />
      <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5" />
    </>
  ),
  volume: <path d="M2.5 6.25h2.25L8 3.5v9L4.75 9.75H2.5ZM10.5 6a3 3 0 0 1 0 4M12.25 4a5.6 5.6 0 0 1 0 8" />,
  wifi: (
    <>
      <path d="M1.5 6.5a9.5 9.5 0 0 1 13 0M3.75 9a6.2 6.2 0 0 1 8.5 0M6 11.25a3 3 0 0 1 4 0" />
      {dot(8, 13, 0.8)}
    </>
  ),
  brightness: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
    </>
  ),
  moon: <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" />,
  color: (
    <>
      <path d="M8 1.75a6.25 6.25 0 0 0 0 12.5c1 0 1.5-.6 1.5-1.3 0-.9-.8-1.2-.8-2 0-.7.6-1.2 1.4-1.2h1.6c1.5 0 2.55-1 2.55-2.5 0-3-2.8-5.5-6.25-5.5Z" />
      {dot(5, 7, 0.8)}
      {dot(7, 4.6, 0.8)}
      {dot(10, 5, 0.8)}
    </>
  ),
  font: <path d="M2.5 13 7 2.5h.5L12 13M4.2 9.5h6.1" />,
  keyboard: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="M5 10.5h6M4 6h.01M6.7 6h.01M9.3 6h.01M12 6h.01M4 8.25h.01M6.7 8.25h.01M9.3 8.25h.01M12 8.25h.01" />
    </>
  ),
  apps: (
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
      <path d="M2.5 8h11M8 2.5v11" />
    </>
  ),
  shield: <path d="M8 1.75 13.25 3.5v4.25c0 3.2-2.2 5.3-5.25 6.5-3.05-1.2-5.25-3.3-5.25-6.5V3.5Z" />,
  power: <path d="M8 2v6M4.6 4.2a5.5 5.5 0 1 0 6.8 0" />,
  link: (
    <path d="M6.75 9.25a2.6 2.6 0 0 0 3.7 0l2.3-2.3a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.25 6.75a2.6 2.6 0 0 0-3.7 0l-2.3 2.3a2.6 2.6 0 0 0 3.7 3.7l.8-.8" />
  ),
  accept: <path d="M2.5 8.5 6 12l7.5-7.5" />,
  dismiss: <path d="M3 3l10 10M13 3 3 13" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof glyphs;
export const iconNames = Object.keys(glyphs) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** A built-in glyph. Omit it and pass SVG children to draw your own. */
  name?: IconName;
  /** Rendered size in px. Default 16. */
  size?: number;
}

export function Icon({ name, size = 16, className, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={size < 16 ? 16 / size : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
      className={cx('wui-icon', className)}
    >
      {name ? glyphs[name] : children}
    </svg>
  );
}

/** Accepts an icon name or any node, for `icon` props across the library. */
export type IconSource = IconName | ReactNode;

export function renderIcon(icon: IconSource, size = 16): ReactNode {
  if (typeof icon === 'string' && icon in glyphs) return <Icon name={icon as IconName} size={size} />;
  return icon as ReactNode;
}
