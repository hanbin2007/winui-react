import { useState } from 'react';
import { Icon, iconNames, Text, TextBox, ThemeProvider, type TextVariant } from '../../lib';
import { Example, Page, Section } from '../Example';

const RAMP: Array<[TextVariant, string]> = [
  ['caption', '12 / 16, regular'],
  ['body', '14 / 20, regular'],
  ['bodyStrong', '14 / 20, semibold'],
  ['bodyLarge', '18 / 24, regular'],
  ['subtitle', '20 / 28, semibold'],
  ['title', '28 / 36, semibold'],
  ['titleLarge', '40 / 52, semibold'],
  ['display', '68 / 92, semibold'],
];

export function TypographyPage() {
  return (
    <Page
      title="Typography"
      description="The WinUI type ramp. Text uses Segoe UI Variable where it is installed and falls back to the system UI font elsewhere."
    >
      <Example title="Type ramp" code={`<Text variant="title">Title</Text>`} fill>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {RAMP.map(([variant, spec]) => (
              <tr key={variant} style={{ borderBottom: '1px solid var(--wui-divider-stroke-default)' }}>
                <td style={{ padding: '10px 16px 10px 0' }}>
                  <Text variant={variant} as="span">
                    {variant[0].toUpperCase() + variant.slice(1).replace(/[A-Z]/g, (c) => ` ${c}`)}
                  </Text>
                </td>
                <td style={{ padding: '10px 0', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
                  <Text variant="caption" tone="secondary">
                    variant="{variant}" · {spec}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Example>
      <Example title="Text colours" code={`<Text tone="secondary">Secondary</Text>`}>
        <Text>Primary</Text>
        <Text tone="secondary">Secondary</Text>
        <Text tone="tertiary">Tertiary</Text>
        <Text tone="disabled">Disabled</Text>
        <Text tone="accent">Accent</Text>
      </Example>
    </Page>
  );
}

const TOKEN_GROUPS: Array<[string, string[]]> = [
  ['Text', ['text-primary', 'text-secondary', 'text-tertiary', 'text-disabled', 'accent-text-primary']],
  ['Accent', ['accent-default', 'accent-secondary', 'accent-tertiary', 'accent-disabled']],
  [
    'Control fill',
    ['control-fill-default', 'control-fill-secondary', 'control-fill-tertiary', 'control-fill-input-active', 'control-strong-fill-default', 'control-solid-fill-default'],
  ],
  ['Subtle and alt fill', ['subtle-fill-secondary', 'subtle-fill-tertiary', 'control-alt-fill-secondary', 'control-alt-fill-tertiary', 'control-alt-fill-quarternary']],
  ['Stroke', ['control-stroke-default', 'control-stroke-secondary', 'control-strong-stroke-default', 'card-stroke-default', 'divider-stroke-default', 'surface-stroke-flyout']],
  ['Background', ['solid-bg-base', 'solid-bg-secondary', 'solid-bg-tertiary', 'card-bg-default', 'card-bg-secondary', 'layer-fill-default', 'smoke-fill-default']],
  ['System', ['system-success', 'system-caution', 'system-critical', 'system-success-bg', 'system-caution-bg', 'system-critical-bg']],
];

function Tokens() {
  return (
    <>
      {TOKEN_GROUPS.map(([group, tokens]) => (
        <div key={group} style={{ width: '100%', marginBottom: 16 }}>
          <Text variant="bodyStrong" block style={{ marginBottom: 8 }}>
            {group}
          </Text>
          <div className="g-tokens">
            {tokens.map((t) => (
              <div key={t} className="g-token">
                <span className="g-token__chip">
                  <span style={{ background: `var(--wui-${t})` }} />
                </span>
                <span style={{ fontFamily: 'var(--wui-font-mono)' }}>--wui-{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function ColorPage() {
  return (
    <Page
      title="Color"
      description="Every colour is a CSS variable named after its WinUI theme resource. The same tokens resolve differently in light and dark."
    >
      <Section>Light</Section>
      <ThemeProvider theme="light" backdrop="solid" style={{ padding: 24, borderRadius: 8, minHeight: 0 }}>
        <Tokens />
      </ThemeProvider>
      <Section>Dark</Section>
      <ThemeProvider theme="dark" backdrop="solid" style={{ padding: 24, borderRadius: 8, minHeight: 0 }}>
        <Tokens />
      </ThemeProvider>
    </Page>
  );
}

export function IconsPage() {
  const [q, setQ] = useState('');
  const shown = iconNames.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Page
      title="Icons"
      description="A built-in set drawn on a 16px grid with 1px strokes, in the style of Segoe Fluent Icons. Any SVG works too: pass it as children of Icon."
    >
      <Example title={`${shown.length} icons`} code={`<Icon name="settings" />\n<Icon name="heart" size={24} />`} stack>
        <TextBox style={{ width: 260 }} placeholder="Filter icons" prefix="search" value={q} onValueChange={setQ} />
        <div className="g-icons">
          {shown.map((name) => (
            <div key={name} className="g-icon">
              <Icon name={name} size={20} />
              {name}
            </div>
          ))}
        </div>
      </Example>
      <Example title="Sizes">
        {[12, 16, 20, 24, 32, 48].map((s) => (
          <Icon key={s} name="settings" size={s} />
        ))}
        {[12, 16, 20, 24, 32, 48].map((s) => (
          <Icon key={s} name="heart" size={s} style={{ color: 'var(--wui-system-critical)' }} />
        ))}
      </Example>
    </Page>
  );
}

export function MaterialsPage() {
  return (
    <Page
      title="Materials"
      description="Mica tints the window with the (blurred) desktop wallpaper. Acrylic is the frosted, translucent surface behind menus and flyouts."
    >
      <Example
        title="Acrylic"
        description="Blurs whatever is behind it, then adds a tint and a little noise."
        code={`<div className="wui-acrylic">...</div>`}
        fill
      >
        <div className="g-materials">
          <div className="g-material wui-acrylic">Acrylic</div>
          <ThemeProvider theme="dark" style={{ borderRadius: 8 }}>
            <div className="g-material wui-acrylic">Acrylic, dark</div>
          </ThemeProvider>
          <ThemeProvider theme="light" style={{ borderRadius: 8 }}>
            <div className="g-material wui-acrylic">Acrylic, light</div>
          </ThemeProvider>
        </div>
      </Example>
      <Example
        title="Mica and Mica Alt"
        description="Set on ThemeProvider with the backdrop prop. The wallpaper prop supplies the image Mica samples."
        code={`<ThemeProvider backdrop="mica" wallpaper="url(wallpaper.jpg)">\n  <App />\n</ThemeProvider>`}
      >
        <ThemeProvider backdrop="mica" theme="light" className="g-material" style={{ minHeight: 0 }}>
          Mica
        </ThemeProvider>
        <ThemeProvider backdrop="micaAlt" theme="light" className="g-material" style={{ minHeight: 0 }}>
          Mica Alt
        </ThemeProvider>
        <ThemeProvider backdrop="mica" theme="dark" className="g-material" style={{ minHeight: 0 }}>
          Mica, dark
        </ThemeProvider>
        <ThemeProvider backdrop="micaAlt" theme="dark" className="g-material" style={{ minHeight: 0 }}>
          Mica Alt, dark
        </ThemeProvider>
      </Example>
    </Page>
  );
}
