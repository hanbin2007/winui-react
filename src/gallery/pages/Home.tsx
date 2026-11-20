import { Button, Card, HyperlinkButton, Icon, InfoBar, Text, type IconName } from '../../lib';
import { useApp } from '../context';
import { SEGOE_DOWNLOAD_URL } from '../font';
import { Section } from '../Example';

const TILES: Array<{ key: string; icon: IconName; title: string; text: string }> = [
  { key: 'input', icon: 'accept', title: 'Basic input', text: 'Button, CheckBox, RadioButtons, ToggleSwitch, Slider, ComboBox, RatingControl, ColorPicker.' },
  { key: 'text', icon: 'edit', title: 'Text', text: 'TextBox, PasswordBox, NumberBox and AutoSuggestBox.' },
  { key: 'collections', icon: 'list', title: 'Collections', text: 'ListView, GridView, TreeView, FlipView and PipsPager.' },
  { key: 'dialogs', icon: 'comment', title: 'Dialogs & flyouts', text: 'ContentDialog, Flyout, MenuFlyout, TeachingTip and ToolTip.' },
  { key: 'navigation', icon: 'menu', title: 'Navigation', text: 'NavigationView, TabView, BreadcrumbBar, SelectorBar, CommandBar, MenuBar.' },
  { key: 'status', icon: 'info', title: 'Status & info', text: 'ProgressBar, ProgressRing, InfoBar and InfoBadge.' },
  { key: 'datetime', icon: 'calendar', title: 'Date & time', text: 'CalendarView, CalendarDatePicker, DatePicker and TimePicker.' },
  { key: 'layout', icon: 'grid', title: 'Layout', text: 'Expander, Card, SettingsCard, ScrollView and PersonPicture.' },
  { key: 'motion', icon: 'play', title: 'Motion', text: 'Page transitions, the selection pill, popups and animated icons.' },
  { key: 'typography', icon: 'font', title: 'Typography', text: 'The Segoe UI Variable type ramp.' },
  { key: 'color', icon: 'brightness', title: 'Color', text: 'Theme tokens for light and dark, and the accent palette.' },
  { key: 'materials', icon: 'image', title: 'Materials', text: 'Mica, Mica Alt and Acrylic.' },
];

export function HomePage() {
  const { navigate, fontReminder, dismissFontReminder } = useApp();
  return (
    <div className="g-home">
      <div className="g-hero-bg" />
      <div className="g-page">
        <div className="g-hero">
          <Text variant="caption" tone="secondary" block>
            An unofficial React UI framework
          </Text>
          <Text variant="titleLarge">WinUI React Gallery</Text>
          <Text tone="secondary" block style={{ maxWidth: 640, marginTop: 8 }}>
            Every control here is a React component styled and animated after WinUI 3: the same
            theme tokens, the same geometry, the same motion. Pick a category to try them.
          </Text>
        </div>

        <InfoBar
          open={fontReminder}
          onClose={dismissFontReminder}
          severity="warning"
          style={{ marginBottom: 8 }}
          title="Segoe UI Variable is not installed"
          message="Text is shown in this device's system font. Install the Windows UI font from Microsoft, then restart your browser, to see the gallery as it looks on Windows."
          action={
            <Button onClick={() => window.open(SEGOE_DOWNLOAD_URL, '_blank', 'noopener')}>Get the font</Button>
          }
        />

        <InfoBar
          title="Tip"
          message="Use the button in the title bar to switch between light and dark, and Settings to change the accent colour and backdrop."
          closable={false}
          action={<HyperlinkButton onClick={() => navigate('settings')}>Open settings</HyperlinkButton>}
        />

        <Section>Browse the controls</Section>
        <div className="g-tiles">
          {TILES.map((t) => (
            <Card
              key={t.key}
              clickable
              className="g-tile wui-focusable"
              role="button"
              tabIndex={0}
              onClick={() => navigate(t.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(t.key);
                }
              }}
            >
              <span className="g-tile__icon">
                <Icon name={t.icon} size={20} />
              </span>
              <span>
                <Text variant="bodyStrong" block>
                  {t.title}
                </Text>
                <Text variant="caption" tone="secondary" block style={{ marginTop: 2 }}>
                  {t.text}
                </Text>
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
