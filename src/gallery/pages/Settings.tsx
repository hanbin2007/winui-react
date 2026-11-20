import {
  Button,
  ComboBox,
  RadioButton,
  RadioButtons,
  SettingsCard,
  SettingsExpander,
  Text,
  type Backdrop,
  type PaneDisplayMode,
  type ThemeMode,
} from '../../lib';
import { useApp } from '../context';
import { Page, Section } from '../Example';
import { SEGOE_DOWNLOAD_URL } from '../font';

const ACCENTS = ['#0078D4', '#0099BC', '#00B294', '#107C10', '#FFB900', '#F7630C', '#E81123', '#E3008C', '#8764B8', '#744DA9', '#515C6B', '#7A7574'];

export function SettingsPage() {
  const { settings, update, fontInstalled, showFontReminder } = useApp();
  return (
    <Page title="Settings">
      <Section>Appearance & behaviour</Section>
      <div className="g-col" style={{ gap: 4, alignItems: 'stretch' }}>
        <SettingsExpander
          icon="color"
          header="App theme"
          description="Select which app theme to display"
          defaultExpanded
          content={<Text tone="secondary">{settings.theme[0].toUpperCase() + settings.theme.slice(1)}</Text>}
        >
          <div style={{ padding: '8px 16px 12px 56px' }}>
            <RadioButtons value={settings.theme} onValueChange={(v) => update({ theme: v as ThemeMode })}>
              <RadioButton value="light">Light</RadioButton>
              <RadioButton value="dark">Dark</RadioButton>
              <RadioButton value="system">Use system setting</RadioButton>
            </RadioButtons>
          </div>
        </SettingsExpander>

        <SettingsCard icon="brightness" header="Accent colour" description="Light and dark shades are derived from it">
          <div className="g-row" style={{ gap: 6, maxWidth: 230, justifyContent: 'flex-end' }}>
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                className="g-swatch wui-focusable"
                style={{ background: c }}
                aria-label={`Accent ${c}`}
                aria-pressed={settings.accent === c}
                onClick={() => update({ accent: c })}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard icon="image" header="Window backdrop" description="The material behind the navigation pane and title bar">
          <ComboBox
            style={{ width: 150 }}
            items={[
              { value: 'mica', label: 'Mica' },
              { value: 'micaAlt', label: 'Mica Alt' },
              { value: 'solid', label: 'Solid' },
            ]}
            value={settings.backdrop}
            onValueChange={(v) => update({ backdrop: v as Backdrop })}
          />
        </SettingsCard>

        <SettingsCard icon="menu" header="Navigation style" description="How the navigation pane is shown">
          <ComboBox
            style={{ width: 150 }}
            items={[
              { value: 'auto', label: 'Auto' },
              { value: 'left', label: 'Left' },
              { value: 'leftCompact', label: 'Left compact' },
              { value: 'leftMinimal', label: 'Left minimal' },
              { value: 'top', label: 'Top' },
            ]}
            value={settings.paneMode}
            onValueChange={(v) => update({ paneMode: v as PaneDisplayMode })}
          />
        </SettingsCard>

        <SettingsCard
          icon="font"
          header="Windows UI font"
          description={
            fontInstalled
              ? 'Segoe UI is installed. Text looks the way it does on Windows.'
              : "Segoe UI Variable is not installed. Text is shown in this device's system font."
          }
        >
          {!fontInstalled && (
            <Button appearance="accent" onClick={() => window.open(SEGOE_DOWNLOAD_URL, '_blank', 'noopener')}>
              Get the font
            </Button>
          )}
          <Button onClick={showFontReminder}>Show reminder</Button>
        </SettingsCard>
      </div>

      <Section>About</Section>
      <SettingsExpander icon="info" header="WinUI React" description="An unofficial React recreation of WinUI 3" content={<Text tone="secondary">0.1.0</Text>}>
        <SettingsCard header="Not affiliated with Microsoft" description="WinUI, Windows and Segoe are trademarks of Microsoft. This project only mimics the public design language." />
        <SettingsCard header="Zero runtime dependencies" description="Only React and React DOM as peers. Styles ship as one CSS file." />
      </SettingsExpander>
    </Page>
  );
}
