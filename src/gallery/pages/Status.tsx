import { useEffect, useState } from 'react';
import {
  Button,
  CheckBox,
  ComboBox,
  HyperlinkButton,
  InfoBadge,
  InfoBar,
  ProgressBar,
  ProgressRing,
  Slider,
  Text,
  type Severity,
} from '../../lib';
import { Example, Page } from '../Example';

export function StatusPage() {
  const [value, setValue] = useState(35);
  const [state, setState] = useState<string>('running');
  const [severity, setSeverity] = useState<string>('informational');
  const [open, setOpen] = useState(true);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 400);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <Page
      title="Status & info"
      description="Controls that report progress or state. The indeterminate bar and ring loop the same way the WinUI ones do."
    >
      <Example
        title="ProgressBar"
        code={`<ProgressBar />                 {/* indeterminate */}
<ProgressBar value={35} />
<ProgressBar value={35} state="paused" />`}
        options={
          <>
            <ComboBox header="State" items={['running', 'paused', 'error']} value={state} onValueChange={setState} />
            <Slider header="Value" value={value} onValueChange={setValue} />
            <CheckBox checked={auto} onCheckedChange={setAuto}>
              Advance automatically
            </CheckBox>
          </>
        }
        stack
      >
        <Text variant="caption" tone="secondary">
          Indeterminate
        </Text>
        <ProgressBar style={{ width: 320 }} state={state as 'running'} aria-label="Working" />
        <Text variant="caption" tone="secondary" style={{ marginTop: 8 }}>
          Determinate: {value}%
        </Text>
        <ProgressBar style={{ width: 320 }} value={value} state={state as 'running'} aria-label="Progress" />
      </Example>

      <Example
        title="ProgressRing"
        code={`<ProgressRing />
<ProgressRing value={35} track />
<ProgressRing size={64} />`}
      >
        <ProgressRing size={16} />
        <ProgressRing />
        <ProgressRing size={64} />
        <ProgressRing value={value} track state={state as 'running'} />
        <ProgressRing value={value} track size={64} state={state as 'running'} />
      </Example>

      <Example
        title="InfoBar"
        code={`<InfoBar
  severity="success"
  title="Saved"
  message="Your changes were saved."
  action={<Button>Undo</Button>}
  onClose={() => setOpen(false)}
/>`}
        options={
          <>
            <ComboBox
              header="Severity"
              items={['informational', 'success', 'warning', 'error']}
              value={severity}
              onValueChange={setSeverity}
            />
            <CheckBox checked={open} onCheckedChange={setOpen}>
              Is open
            </CheckBox>
          </>
        }
        stack
      >
        <InfoBar
          style={{ width: '100%' }}
          open={open}
          onClose={() => setOpen(false)}
          severity={severity as Severity}
          title="Title"
          message="Essential information for the user, in one line where possible."
        />
        <InfoBar
          style={{ width: '100%' }}
          severity="success"
          title="Saved"
          message="Your changes were saved to the cloud."
          action={<Button>Undo</Button>}
          closable={false}
        />
        <InfoBar
          style={{ width: '100%' }}
          severity="warning"
          title="Storage almost full"
          message="A longer message wraps under the title when the bar is too narrow to hold both on one line, and the action moves with it."
          action={<HyperlinkButton>Manage storage</HyperlinkButton>}
        />
        <InfoBar style={{ width: '100%' }} severity="error" title="Could not connect" message="Check your network and try again." />
      </Example>

      <Example
        title="InfoBadge"
        description="A dot, a number or an icon, in five colours."
        code={`<InfoBadge />
<InfoBadge value={5} />
<InfoBadge icon="check" severity="success" />`}
      >
        <InfoBadge />
        <InfoBadge value={5} />
        <InfoBadge value="99+" />
        <InfoBadge icon="info" />
        <InfoBadge value={3} severity="informational" />
        <InfoBadge icon="check" severity="success" />
        <InfoBadge value={2} severity="caution" />
        <InfoBadge value={8} severity="critical" />
        <Button>
          Inbox <InfoBadge value={12} style={{ marginLeft: 4 }} />
        </Button>
      </Example>
    </Page>
  );
}
