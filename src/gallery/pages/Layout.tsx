import {
  Button,
  Card,
  ComboBox,
  Expander,
  InfoBadge,
  PersonPicture,
  ScrollView,
  SettingsCard,
  SettingsExpander,
  Slider,
  Text,
  ToggleSwitch,
} from '../../lib';
import { Example, Page } from '../Example';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export function LayoutPage() {
  return (
    <Page title="Layout" description="Containers and surfaces for arranging content.">
      <Example
        title="Expander"
        description="The content slides out from under the header, and the chevron flips."
        code={`<Expander header="This text is in the header">
  This is in the content
</Expander>`}
        stack
      >
        <Expander style={{ width: '100%', maxWidth: 520 }} header="This text is in the header">
          <Text>{LOREM}</Text>
        </Expander>
        <Expander
          style={{ width: '100%', maxWidth: 520 }}
          defaultExpanded
          header={
            <div className="g-row" style={{ gap: 12 }}>
              <PersonPicture displayName="Mona Kane" size={28} />
              <span>A header can hold any content</span>
            </div>
          }
        >
          <div className="g-row">
            <Button>Action</Button>
            <Button appearance="accent">Another action</Button>
          </div>
        </Expander>
        <Expander style={{ width: '100%', maxWidth: 520 }} direction="up" header="Expands upward">
          <Text>The content appears above the header.</Text>
        </Expander>
      </Example>

      <Example
        title="SettingsCard and SettingsExpander"
        description="The rows used on Settings pages."
        code={`<SettingsCard icon="wifi" header="Wi-Fi" description="Connect to wireless networks">
  <ToggleSwitch defaultChecked />
</SettingsCard>
<SettingsExpander icon="volume" header="Sound" content={<Slider />}>
  <SettingsCard header="Mono audio"><ToggleSwitch /></SettingsCard>
</SettingsExpander>`}
        stack
      >
        <div className="g-col" style={{ width: '100%', gap: 4, alignItems: 'stretch' }}>
          <SettingsCard icon="wifi" header="Wi-Fi" description="Connect to wireless networks">
            <ToggleSwitch defaultChecked />
          </SettingsCard>
          <SettingsCard icon="brightness" header="Night light" description="Use warmer colours to help block blue light">
            <ComboBox items={['Off', 'On until sunrise', 'Always on']} defaultValue="Off" style={{ width: 170 }} />
          </SettingsCard>
          <SettingsCard icon="shield" header="Privacy & security" description="This card is a button" onClick={() => undefined} />
          <SettingsExpander
            icon="volume"
            header="Sound"
            description="Volume levels, output, input and sound devices"
            content={<Slider defaultValue={60} style={{ width: 160 }} aria-label="Volume" />}
          >
            <SettingsCard header="Mono audio" description="Combine left and right channels into one">
              <ToggleSwitch />
            </SettingsCard>
            <SettingsCard header="Output device">
              <ComboBox items={['Speakers', 'Headphones']} defaultValue="Speakers" style={{ width: 150 }} />
            </SettingsCard>
          </SettingsExpander>
        </div>
      </Example>

      <Example
        title="Card"
        code={`<Card>Content on a card surface</Card>
<Card clickable>A clickable card</Card>`}
      >
        <Card style={{ width: 220 }}>
          <Text variant="bodyStrong" block>
            Card
          </Text>
          <Text tone="secondary">Content on a card surface.</Text>
        </Card>
        <Card clickable style={{ width: 220 }}>
          <Text variant="bodyStrong" block>
            Clickable card
          </Text>
          <Text tone="secondary">Hover and press me.</Text>
        </Card>
      </Example>

      <Example
        title="ScrollView"
        description="A thin scroll indicator shows while you scroll or hover. Point at it and it widens into a full scroll bar with arrows."
        code={`<ScrollView style={{ height: 180 }}>...long content</ScrollView>`}
      >
        <ScrollView style={{ width: 340, height: 180, border: '1px solid var(--wui-card-stroke-default)', borderRadius: 4 }}>
          <div style={{ padding: 16 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Text key={i} block style={{ marginBottom: 12 }}>
                {LOREM}
              </Text>
            ))}
          </div>
        </ScrollView>
        <ScrollView style={{ width: 300, height: 180, border: '1px solid var(--wui-card-stroke-default)', borderRadius: 4 }}>
          <div
            style={{
              width: 900,
              height: 500,
              background: 'conic-gradient(from 45deg, #60a5fa, #f472b6, #facc15, #4ade80, #60a5fa)',
            }}
          />
        </ScrollView>
      </Example>

      <Example
        title="PersonPicture"
        code={`<PersonPicture displayName="Jane Doe" />
<PersonPicture displayName="Kai Lee" badge={<InfoBadge value={3} />} />`}
      >
        <PersonPicture displayName="Jane Doe" size={72} />
        <PersonPicture displayName="Kai Lee" badge={<InfoBadge value={3} />} />
        <PersonPicture initials="WU" size={40} />
        <PersonPicture size={40} />
        <PersonPicture displayName="Online" size={40} badge={<InfoBadge severity="success" icon="check" />} />
      </Example>
    </Page>
  );
}
