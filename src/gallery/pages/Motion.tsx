import { useState } from 'react';
import {
  Button,
  Card,
  CheckBox,
  ComboBox,
  DropDownButton,
  Expander,
  Frame,
  ListView,
  MenuFlyoutItem,
  RadioButton,
  RadioButtons,
  SelectorBar,
  Text,
  ToggleSwitch,
  type PageTransition,
} from '../../lib';
import { Example, Page } from '../Example';

const TIMINGS: Array<[string, string, string]> = [
  ['Fill and text colour changes', '83 ms', 'linear'],
  ['Control state (knob, dot, chevron)', '167 ms', 'cubic-bezier(0, 0, 0, 1)'],
  ['Popup open (menu, flyout, ComboBox)', '250 ms', 'cubic-bezier(0, 0, 0, 1)'],
  ['Popup close', '83 ms', 'linear fade'],
  ['Expander open / close', '333 ms / 167 ms', 'cubic-bezier(0, 0, 0, 1) / (1, 1, 0, 1)'],
  ['Selection pill stretch', '600 ms', '(0.9, 0.1, 1, 0.2) then (0.1, 0.9, 0.2, 1)'],
  ['Page entrance', '600 ms', 'cubic-bezier(0.1, 0.9, 0.2, 1)'],
  ['Indeterminate progress loop', '2 s', 'cubic-bezier(0.4, 0, 0.6, 1)'],
];

export function MotionPage() {
  const [transition, setTransition] = useState<string>('entrance');
  const [n, setN] = useState(1);
  const [item, setItem] = useState(['Item 1']);
  const [tab, setTab] = useState('one');

  return (
    <Page
      title="Motion"
      description="The framework reproduces WinUI's motion: the same durations, the same easing curves, and the same choreography for popups, selection and pages."
    >
      <Example
        title="Page transitions"
        description="Frame replays a NavigationTransitionInfo-style animation whenever its pageKey changes."
        code={`<Frame pageKey={route} transition="entrance">
  <MyPage />
</Frame>`}
        options={
          <>
            <ComboBox
              header="Transition"
              items={['entrance', 'drillIn', 'slideFromRight', 'slideFromLeft', 'suppress']}
              value={transition}
              onValueChange={setTransition}
            />
            <Button onClick={() => setN((x) => x + 1)}>Navigate</Button>
          </>
        }
        fill
      >
        <div style={{ height: 180, overflow: 'hidden', borderRadius: 4 }}>
          <Frame pageKey={n} transition={transition as PageTransition}>
            <Card style={{ height: 180 }}>
              <Text variant="subtitle">Page {n}</Text>
              <Text tone="secondary" block style={{ marginTop: 4 }}>
                Press Navigate to bring in the next page with the chosen transition.
              </Text>
            </Card>
          </Frame>
        </div>
      </Example>

      <Example
        title="The selection pill"
        description="Pick different items. In lists the pill grows in place; in NavigationView and SelectorBar it stretches across to the new item."
        stack
      >
        <SelectorBar
          items={[
            { key: 'one', text: 'First' },
            { key: 'two', text: 'Second' },
            { key: 'three', text: 'Third' },
            { key: 'four', text: 'Fourth' },
            { key: 'five', text: 'Fifth' },
          ]}
          selectedKey={tab}
          onSelectionChange={setTab}
        />
        <ListView
          style={{ width: 240 }}
          items={['Item 1', 'Item 2', 'Item 3', 'Item 4']}
          selectedKeys={item}
          onSelectionChange={setItem}
        />
      </Example>

      <Example
        title="Control state changes"
        description="Hover, press and toggle these slowly to see each transition."
      >
        <ToggleSwitch defaultChecked />
        <CheckBox defaultChecked>Check mark draws in</CheckBox>
        <RadioButtons orientation="horizontal" defaultValue="a">
          <RadioButton value="a">Dot grows</RadioButton>
          <RadioButton value="b">and shrinks</RadioButton>
        </RadioButtons>
        <DropDownButton
          menu={
            <>
              <MenuFlyoutItem>The menu unrolls downward</MenuFlyoutItem>
              <MenuFlyoutItem>from the button's edge</MenuFlyoutItem>
              <MenuFlyoutItem>and fades out when closed</MenuFlyoutItem>
            </>
          }
        >
          Chevron nudges
        </DropDownButton>
      </Example>

      <Example title="Expander" description="Content slides out from behind the header." fill>
        <Expander header="Open me" style={{ maxWidth: 520 }}>
          <Text>
            The content translates down from behind the header over 333 ms and leaves faster, over
            167 ms.
          </Text>
        </Expander>
      </Example>

      <Example title="Durations and easing" description="The values used across the framework, exposed as CSS variables." fill>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {TIMINGS.map(([what, dur, ease]) => (
              <tr key={what} style={{ borderBottom: '1px solid var(--wui-divider-stroke-default)' }}>
                <td style={{ padding: '8px 12px 8px 0' }}>{what}</td>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  <Text variant="bodyStrong">{dur}</Text>
                </td>
                <td style={{ padding: '8px 0', fontFamily: 'var(--wui-font-mono)', fontSize: 12 }}>{ease}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Example>
    </Page>
  );
}
