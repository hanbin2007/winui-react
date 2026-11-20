import { useState } from 'react';
import {
  Button,
  CheckBox,
  ColorPicker,
  ComboBox,
  DropDownButton,
  HyperlinkButton,
  MenuFlyoutItem,
  MenuFlyoutSeparator,
  RadioButton,
  RadioButtons,
  RatingControl,
  RepeatButton,
  Slider,
  SplitButton,
  Text,
  ToggleButton,
  ToggleSwitch,
} from '../../lib';
import { Example, Page, Section } from '../Example';

const TOPPINGS = ['Mushrooms', 'Olives', 'Peppers'];

export function BasicInputPage() {
  const [disabled, setDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [repeat, setRepeat] = useState(0);
  const [toppings, setToppings] = useState<string[]>(['Olives']);
  const [volume, setVolume] = useState(40);
  const [rating, setRating] = useState(3);
  const [color, setColor] = useState('#0078D4');
  const [font, setFont] = useState<string>('Segoe UI');
  const [swatch, setSwatch] = useState('#0F7B0F');

  const all = toppings.length === TOPPINGS.length;
  const none = toppings.length === 0;

  return (
    <Page
      title="Basic input"
      description="Buttons and the controls people use to make a choice. Hover, press and tab through them: fills, borders and glyphs all change the way they do in WinUI."
    >
      <Section>Buttons</Section>
      <Example
        title="Button"
        description="Standard, accent and subtle appearances."
        code={`<Button onClick={save}>Standard</Button>
<Button appearance="accent">Accent</Button>
<Button appearance="subtle" icon="share">Subtle</Button>`}
        options={<CheckBox checked={disabled} onCheckedChange={setDisabled}>Disable buttons</CheckBox>}
      >
        <Button disabled={disabled} onClick={() => setClicks((c) => c + 1)}>
          Standard
        </Button>
        <Button appearance="accent" disabled={disabled} onClick={() => setClicks((c) => c + 1)}>
          Accent
        </Button>
        <Button appearance="subtle" icon="share" disabled={disabled} onClick={() => setClicks((c) => c + 1)}>
          Subtle
        </Button>
        <Button icon="add" disabled={disabled} onClick={() => setClicks((c) => c + 1)}>
          With icon
        </Button>
        <Button icon="settings" aria-label="Settings" disabled={disabled} />
        <span className="g-out">Clicked {clicks} times</span>
      </Example>

      <Example
        title="ToggleButton, DropDownButton and SplitButton"
        code={`<ToggleButton defaultChecked>Toggle</ToggleButton>
<DropDownButton icon="mail" menu={<><MenuFlyoutItem>Send</MenuFlyoutItem>...</>}>Email</DropDownButton>
<SplitButton menu={...} onClick={apply}>Apply colour</SplitButton>`}
      >
        <ToggleButton defaultChecked>Toggle</ToggleButton>
        <DropDownButton
          icon="mail"
          menu={
            <>
              <MenuFlyoutItem icon="send">Send</MenuFlyoutItem>
              <MenuFlyoutItem icon="share">Reply</MenuFlyoutItem>
              <MenuFlyoutItem icon="people">Reply all</MenuFlyoutItem>
              <MenuFlyoutSeparator />
              <MenuFlyoutItem icon="delete">Delete</MenuFlyoutItem>
            </>
          }
        >
          Email
        </DropDownButton>
        <SplitButton
          flyout={
            <div className="g-row" style={{ gap: 8, width: 136 }}>
              {['#C42B1C', '#F7630C', '#FCE100', '#0F7B0F', '#0078D4', '#744DA9', '#E3008C', '#515C6B'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className="g-swatch wui-focusable"
                  style={{ background: c }}
                  aria-label={c}
                  aria-pressed={swatch === c}
                  onClick={() => setSwatch(c)}
                />
              ))}
            </div>
          }
        >
          <span style={{ width: 16, height: 16, borderRadius: 3, background: swatch }} />
          Colour
        </SplitButton>
        <SplitButton
          appearance="accent"
          menu={
            <>
              <MenuFlyoutItem>Save as...</MenuFlyoutItem>
              <MenuFlyoutItem>Save a copy</MenuFlyoutItem>
            </>
          }
        >
          Save
        </SplitButton>
      </Example>

      <Example
        title="HyperlinkButton and RepeatButton"
        description="A RepeatButton keeps firing while you hold it down."
        code={`<HyperlinkButton href="https://learn.microsoft.com/windows/apps/winui/">WinUI docs</HyperlinkButton>
<RepeatButton onClick={() => setCount(c => c + 1)}>Hold me</RepeatButton>`}
      >
        <HyperlinkButton href="https://learn.microsoft.com/windows/apps/winui/" target="_blank" rel="noreferrer">
          WinUI documentation
        </HyperlinkButton>
        <RepeatButton onClick={() => setRepeat((c) => c + 1)}>Hold me</RepeatButton>
        <span className="g-out">Fired {repeat} times</span>
      </Example>

      <Section>Selection</Section>
      <Example
        title="CheckBox"
        description="Two-state boxes, and a three-state box that summarises them. The check mark draws itself in."
        code={`<CheckBox checked={all ? true : none ? false : 'indeterminate'} onCheckedChange={selectAll}>
  Select all
</CheckBox>`}
        stack
      >
        <CheckBox
          checked={all ? true : none ? false : 'indeterminate'}
          onCheckedChange={(c) => setToppings(c ? TOPPINGS : [])}
        >
          Select all
        </CheckBox>
        <div className="g-col" style={{ gap: 0, marginLeft: 28, marginTop: -16 }}>
          {TOPPINGS.map((t) => (
            <CheckBox
              key={t}
              checked={toppings.includes(t)}
              onCheckedChange={(c) => setToppings(c ? [...toppings, t] : toppings.filter((x) => x !== t))}
            >
              {t}
            </CheckBox>
          ))}
        </div>
        <div className="g-row">
          <CheckBox disabled>Disabled</CheckBox>
          <CheckBox disabled defaultChecked>
            Disabled, checked
          </CheckBox>
        </div>
      </Example>

      <Example
        title="RadioButtons"
        description="The inner dot grows on hover and shrinks while pressed."
        code={`<RadioButtons header="Background" defaultValue="green">
  <RadioButton value="green">Green</RadioButton>
  <RadioButton value="yellow">Yellow</RadioButton>
</RadioButtons>`}
      >
        <RadioButtons header="Background" defaultValue="green">
          <RadioButton value="green">Green</RadioButton>
          <RadioButton value="yellow">Yellow</RadioButton>
          <RadioButton value="white">White</RadioButton>
        </RadioButtons>
        <RadioButtons header="Disabled" defaultValue="a" disabled>
          <RadioButton value="a">Option A</RadioButton>
          <RadioButton value="b">Option B</RadioButton>
        </RadioButtons>
      </Example>

      <Example
        title="ToggleSwitch"
        description="The knob grows on hover, stretches while pressed, and slides across."
        code={`<ToggleSwitch header="Wi-Fi" defaultChecked />`}
      >
        <ToggleSwitch defaultChecked />
        <ToggleSwitch header="Wi-Fi" onContent="Connected" offContent="Off" />
        <ToggleSwitch disabled />
        <ToggleSwitch disabled defaultChecked />
      </Example>

      <Example
        title="Slider"
        description="Drag the thumb or use the arrow keys. A value tip follows the thumb."
        code={`<Slider value={volume} onValueChange={setVolume} />
<Slider defaultValue={40} step={20} tickFrequency={20} />`}
        stack
      >
        <div className="g-row" style={{ width: '100%' }}>
          <Slider style={{ width: 260 }} value={volume} onValueChange={setVolume} aria-label="Volume" />
          <span className="g-out">Value: {volume}</span>
        </div>
        <Slider style={{ width: 260 }} header="Steps of 20, with ticks" defaultValue={40} step={20} tickFrequency={20} />
        <div className="g-row" style={{ height: 120 }}>
          <Slider orientation="vertical" defaultValue={60} aria-label="Vertical" />
          <Slider style={{ width: 200 }} defaultValue={30} disabled aria-label="Disabled" />
        </div>
      </Example>

      <Example
        title="RatingControl"
        code={`<RatingControl value={rating} onValueChange={setRating} caption={rating + ' of 5'} />`}
      >
        <RatingControl value={rating} onValueChange={setRating} caption={rating ? `${rating} of 5` : 'Not rated'} />
        <RatingControl placeholderValue={4} caption="Average" />
        <RatingControl defaultValue={2} readOnly caption="Read only" />
      </Example>

      <Example
        title="ComboBox"
        description="The list opens over the box, with the selected item lined up on it."
        code={`<ComboBox header="Font" items={fonts} value={font} onValueChange={setFont} />`}
      >
        <ComboBox
          header="Font"
          style={{ width: 200 }}
          items={['Arial', 'Cascadia Code', 'Comic Sans MS', 'Courier New', 'Georgia', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Verdana']}
          value={font}
          onValueChange={setFont}
        />
        <ComboBox
          header="Colour"
          style={{ width: 160 }}
          placeholder="Pick a colour"
          items={[
            { value: 'red', label: 'Red' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' },
            { value: 'grey', label: 'Grey (unavailable)', disabled: true },
          ]}
        />
        <ComboBox header="Disabled" style={{ width: 140 }} items={['One']} defaultValue="One" disabled />
        <Text style={{ fontFamily: font, alignSelf: 'flex-end', paddingBottom: 6 }}>The quick brown fox</Text>
      </Example>

      <Example
        title="ColorPicker"
        code={`<ColorPicker value={color} onValueChange={setColor} alphaEnabled />`}
        options={
          <>
            <Text variant="caption" tone="secondary">
              Current value
            </Text>
            <Text style={{ fontFamily: 'var(--wui-font-mono)' }}>{color}</Text>
          </>
        }
      >
        <ColorPicker value={color} onValueChange={setColor} alphaEnabled />
      </Example>
    </Page>
  );
}
