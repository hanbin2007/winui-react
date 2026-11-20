# WinUI React

An unofficial React UI framework that recreates the look, feel and motion of
WinUI 3 in the browser. It has about 60 components, light and dark themes, a
custom accent colour, Mica and Acrylic materials, and no runtime dependencies
other than React.

It is not affiliated with Microsoft. It only mimics the public design language.

**Live gallery:** https://hanbin2007.github.io/winui-react/

## Run the gallery

The gallery is a demo app (like the WinUI 3 Gallery) that shows every control.

```sh
npm install
npm run dev
```

Other scripts:

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run typecheck` | Type-checks the library and the gallery                   |
| `npm run build`     | Builds the gallery into `dist-gallery/`                   |
| `npm run build:lib` | Builds the library into `dist/` (ESM, CJS, CSS and types) |

## Use it

```tsx
import { ThemeProvider, NavigationView, Button } from 'winui-react';
import 'winui-react/styles.css';

export function App() {
  return (
    <ThemeProvider theme="system" accentColor="#0078D4" backdrop="mica">
      <NavigationView
        items={[
          { key: 'home', label: 'Home', icon: 'home' },
          { key: 'mail', label: 'Mail', icon: 'mail' },
        ]}
        settings
        defaultSelectedKey="home"
      >
        <Button appearance="accent">Hello</Button>
      </NavigationView>
    </ThemeProvider>
  );
}
```

Everything must sit inside a `ThemeProvider`. Providers can be nested to give a
subtree its own theme.

## Components

| Group            | Components                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Basic input      | Button, ToggleButton, DropDownButton, SplitButton, HyperlinkButton, RepeatButton, CheckBox, RadioButtons, ToggleSwitch, Slider, RatingControl, ComboBox, ColorPicker |
| Text             | Text, TextBox, PasswordBox, NumberBox, AutoSuggestBox                                                                           |
| Collections      | ListView, GridView, TreeView, FlipView, PipsPager                                                                               |
| Dialogs, flyouts | ContentDialog, Flyout, MenuFlyout (toggle, radio and sub items), ContextMenu, TeachingTip, ToolTip                              |
| Navigation       | NavigationView, Frame, TitleBar, TabView, BreadcrumbBar, SelectorBar, CommandBar, MenuBar                                       |
| Status           | ProgressBar, ProgressRing, InfoBar, InfoBadge                                                                                   |
| Date and time    | CalendarView, CalendarDatePicker, DatePicker, TimePicker                                                                        |
| Layout           | Expander, Card, SettingsCard, SettingsExpander, ScrollView, PersonPicture                                                       |
| Primitives       | ThemeProvider, Popup, Portal, Icon                                                                                              |

## Theming

All colours are CSS variables named after the WinUI theme resources, for
example `TextFillColorPrimary` is `--wui-text-primary` and
`ControlFillColorDefault` is `--wui-control-fill-default`. They are defined in
`src/lib/styles/tokens.css` for light and dark.

`ThemeProvider` props:

- `theme`: `'light'`, `'dark'` or `'system'`
- `accentColor`: a hex colour; the three lighter and three darker shades are derived from it
- `backdrop`: `'mica'`, `'micaAlt'`, `'solid'` or `'none'`
- `wallpaper`: a CSS background that Mica samples, standing in for the desktop wallpaper

## Motion

The timings and curves follow WinUI:

| What                                 | Duration        | Easing                                         |
| ------------------------------------ | --------------- | ---------------------------------------------- |
| Fill and text colour changes         | 83 ms           | linear                                         |
| Control state (knob, dot, chevron)   | 167 ms          | `cubic-bezier(0, 0, 0, 1)`                     |
| Popup open (menu, flyout, ComboBox)  | 250 ms          | `cubic-bezier(0, 0, 0, 1)`                     |
| Popup close                          | 83 ms           | linear fade                                    |
| Expander open / close                | 333 ms / 167 ms | `(0, 0, 0, 1)` / `(1, 1, 0, 1)`                |
| Selection pill stretch               | 600 ms          | `(0.9, 0.1, 1, 0.2)` then `(0.1, 0.9, 0.2, 1)` |
| Page entrance                        | 600 ms          | `cubic-bezier(0.1, 0.9, 0.2, 1)`               |
| Indeterminate progress loop          | 2 s             | `cubic-bezier(0.4, 0, 0.6, 1)`                 |

Menus and flyouts unroll from the edge of the element that opened them.
ComboBox and the date and time pickers open over the control and expand outward
from it. The NavigationView and SelectorBar selection pill stretches to the new
item and then its tail catches up. Animations are turned off when the system
asks for reduced motion.

## Project layout

```
src/lib/            the framework
  index.ts          public exports
  theme.tsx         ThemeProvider, Portal, accent palette
  Popup.tsx         positioning, light dismiss, focus and popup motion
  Icon.tsx          built-in icon set (16px grid, 1px strokes)
  components/       the controls
  styles/           tokens.css plus one stylesheet per control group
src/gallery/        the demo app
```

## Limits

- Mica is simulated: a web page cannot read the real desktop wallpaper, so it
  blurs the `wallpaper` you pass in.
- The icons are an original set drawn in the style of Segoe Fluent Icons, not
  the real font.
- Not included: DataGrid, drag-to-reorder tabs, Pivot, SplitView, MediaPlayer,
  touch dragging on ToggleSwitch and the looping selectors, and the
  NavigationView overflow ("More") menu in top mode.
- The package is not published to npm. Build it with `npm run build:lib`.
