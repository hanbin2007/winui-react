import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AutoSuggestBox,
  Button,
  Frame,
  InfoBadge,
  InfoBar,
  NavigationView,
  PersonPicture,
  ScrollView,
  ThemeProvider,
  TitleBar,
  ToolTip,
  useTheme,
  type NavigationViewItem,
} from '../lib';
import { AppContext, type Settings } from './context';
import { SEGOE_DOWNLOAD_URL, hasSegoe, isReminderDismissed, setReminderDismissed } from './font';
import { BasicInputPage } from './pages/BasicInput';
import { CollectionsPage } from './pages/Collections';
import { DateTimePage } from './pages/DateTime';
import { ColorPage, IconsPage, MaterialsPage, TypographyPage } from './pages/Design';
import { DialogsPage } from './pages/Dialogs';
import { HomePage } from './pages/Home';
import { LayoutPage } from './pages/Layout';
import { MotionPage } from './pages/Motion';
import { NavigationPage } from './pages/Navigation';
import { SettingsPage } from './pages/Settings';
import { StatusPage } from './pages/Status';
import { TextPage } from './pages/Text';

const WALLPAPER =
  'radial-gradient(60% 80% at 10% 5%, #7fb2ff 0%, transparent 62%), radial-gradient(50% 70% at 92% 12%, #ff9fd0 0%, transparent 60%), radial-gradient(70% 80% at 60% 105%, #8be8c8 0%, transparent 62%), radial-gradient(50% 60% at 0% 100%, #ffd27f 0%, transparent 60%), linear-gradient(#dfe9f7, #dfe9f7)';

const PAGES: Record<string, () => ReactNode> = {
  home: () => <HomePage />,
  input: () => <BasicInputPage />,
  text: () => <TextPage />,
  collections: () => <CollectionsPage />,
  dialogs: () => <DialogsPage />,
  navigation: () => <NavigationPage />,
  status: () => <StatusPage />,
  datetime: () => <DateTimePage />,
  layout: () => <LayoutPage />,
  motion: () => <MotionPage />,
  typography: () => <TypographyPage />,
  color: () => <ColorPage />,
  icons: () => <IconsPage />,
  materials: () => <MaterialsPage />,
  settings: () => <SettingsPage />,
};

const NAV: NavigationViewItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  {
    key: 'design',
    label: 'Design',
    icon: 'color',
    selectable: false,
    children: [
      { key: 'typography', label: 'Typography', icon: 'font' },
      { key: 'color', label: 'Color', icon: 'brightness' },
      { key: 'icons', label: 'Icons', icon: 'apps' },
      { key: 'materials', label: 'Materials', icon: 'image' },
    ],
  },
  { key: 'sep', type: 'separator' },
  { key: 'input', label: 'Basic input', icon: 'accept' },
  { key: 'text', label: 'Text', icon: 'edit' },
  { key: 'collections', label: 'Collections', icon: 'list' },
  { key: 'dialogs', label: 'Dialogs & flyouts', icon: 'comment' },
  { key: 'navigation', label: 'Navigation', icon: 'menu' },
  { key: 'status', label: 'Status & info', icon: 'info', infoBadge: <InfoBadge value={4} /> },
  { key: 'datetime', label: 'Date & time', icon: 'calendar' },
  { key: 'layout', label: 'Layout', icon: 'grid' },
  { key: 'motion', label: 'Motion', icon: 'play' },
];

const SEARCH: Array<{ name: string; page: string }> = [
  ['Button', 'input'], ['ToggleButton', 'input'], ['DropDownButton', 'input'], ['SplitButton', 'input'],
  ['HyperlinkButton', 'input'], ['RepeatButton', 'input'], ['CheckBox', 'input'], ['RadioButtons', 'input'],
  ['ToggleSwitch', 'input'], ['Slider', 'input'], ['RatingControl', 'input'], ['ComboBox', 'input'],
  ['ColorPicker', 'input'], ['TextBox', 'text'], ['PasswordBox', 'text'], ['NumberBox', 'text'],
  ['AutoSuggestBox', 'text'], ['ListView', 'collections'], ['GridView', 'collections'], ['TreeView', 'collections'],
  ['FlipView', 'collections'], ['PipsPager', 'collections'], ['ContentDialog', 'dialogs'], ['Flyout', 'dialogs'],
  ['MenuFlyout', 'dialogs'], ['ContextMenu', 'dialogs'], ['TeachingTip', 'dialogs'], ['ToolTip', 'dialogs'],
  ['NavigationView', 'navigation'], ['TabView', 'navigation'], ['BreadcrumbBar', 'navigation'],
  ['SelectorBar', 'navigation'], ['CommandBar', 'navigation'], ['MenuBar', 'navigation'], ['TitleBar', 'navigation'],
  ['ProgressBar', 'status'], ['ProgressRing', 'status'], ['InfoBar', 'status'], ['InfoBadge', 'status'],
  ['CalendarView', 'datetime'], ['CalendarDatePicker', 'datetime'], ['DatePicker', 'datetime'], ['TimePicker', 'datetime'],
  ['Expander', 'layout'], ['Card', 'layout'], ['SettingsCard', 'layout'], ['SettingsExpander', 'layout'],
  ['ScrollView', 'layout'], ['PersonPicture', 'layout'], ['Page transitions', 'motion'], ['Typography', 'typography'],
  ['Color', 'color'], ['Icons', 'icons'], ['Acrylic', 'materials'], ['Mica', 'materials'],
].map(([name, page]) => ({ name, page }));

function pageFromHash(): string {
  const key = window.location.hash.replace(/^#\/?/, '');
  return PAGES[key] ? key : 'home';
}

function ThemeButton({ onToggle }: { onToggle: () => void }) {
  const theme = useTheme();
  return (
    <ToolTip content={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} placement="bottom">
      <Button
        appearance="subtle"
        icon={theme === 'dark' ? 'brightness' : 'moon'}
        aria-label="Toggle theme"
        onClick={onToggle}
      />
    </ToolTip>
  );
}

export function App() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    accent: '#0078D4',
    backdrop: 'micaAlt',
    paneMode: 'auto',
  });
  const [history, setHistory] = useState<string[]>(() => [pageFromHash()]);
  const [query, setQuery] = useState('');
  const current = history[history.length - 1];

  // Keep the page in the URL hash so pages can be linked to and reloaded.
  useEffect(() => {
    const onHash = () => {
      const key = pageFromHash();
      setHistory((h) => (h[h.length - 1] === key ? h : [...h, key]));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (pageFromHash() !== current) window.history.replaceState(null, '', `#${current}`);
  }, [current]);

  const navigate = (key: string) => {
    if (!PAGES[key]) return;
    setHistory((h) => (h[h.length - 1] === key ? h : [...h, key]));
  };
  // Remind people without the Windows UI font to install it, until they dismiss it.
  const [fontInstalled] = useState(hasSegoe);
  const [reminder, setReminder] = useState(() => !fontInstalled && !isReminderDismissed());

  const ctx = useMemo(
    () => ({
      settings,
      update: (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
      navigate,
      fontInstalled,
      showFontReminder: () => {
        setReminderDismissed(false);
        setReminder(true);
      },
    }),
    [settings, fontInstalled],
  );

  return (
    <AppContext.Provider value={ctx}>
      <ThemeProvider
        theme={settings.theme}
        accentColor={settings.accent}
        backdrop={settings.backdrop}
        wallpaper={WALLPAPER}
        className="g-app"
      >
        <TitleBar
          tall
          icon={<span className="g-logo" />}
          title="WinUI React Gallery"
          subtitle="Preview"
          backButton={history.length > 1 ? true : 'disabled'}
          onBack={() => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))}
          rightContent={
            <>
              <ThemeButton
                onToggle={() =>
                  ctx.update({
                    theme:
                      (settings.theme === 'system'
                        ? window.matchMedia('(prefers-color-scheme: dark)').matches
                          ? 'dark'
                          : 'light'
                        : settings.theme) === 'dark'
                        ? 'light'
                        : 'dark',
                  })
                }
              />
              <PersonPicture displayName="Ada Lovelace" size={32} />
            </>
          }
        >
          <AutoSuggestBox
            style={{ width: 'min(420px, 100%)' }}
            placeholder="Search controls and samples..."
            aria-label="Search"
            items={SEARCH}
            getItemText={(i) => i.name}
            value={query}
            onValueChange={setQuery}
            noResultsText="No results found"
            onSuggestionChosen={(i) => {
              navigate(i.page);
              setQuery('');
            }}
          />
        </TitleBar>
        <NavigationView
          items={NAV}
          settings
          paneDisplayMode={settings.paneMode}
          selectedKey={current}
          onSelectionChange={navigate}
        >
          <div className="g-content">
            {reminder && (
              <div className="g-banner">
                <InfoBar
                  className="g-callout"
                  title="Install Segoe UI Variable for the real look"
                  message="This device does not have the Windows UI font, so text is shown in its system font. Download the font from Microsoft, install it, then restart your browser."
                  action={
                    <Button
                      appearance="accent"
                      icon="download"
                      onClick={() => window.open(SEGOE_DOWNLOAD_URL, '_blank', 'noopener')}
                    >
                      Get the font
                    </Button>
                  }
                  onClose={() => {
                    setReminderDismissed(true);
                    setReminder(false);
                  }}
                />
              </div>
            )}
            {/* Keyed by page so each page starts at the top. */}
            <ScrollView key={current} className="g-scroll">
              <Frame pageKey={current}>{PAGES[current]?.()}</Frame>
            </ScrollView>
          </div>
        </NavigationView>
      </ThemeProvider>
    </AppContext.Provider>
  );
}
