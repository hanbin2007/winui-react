import { useRef, useState } from 'react';
import {
  Button,
  Card,
  CheckBox,
  ContentDialog,
  ContextMenu,
  Flyout,
  MenuFlyout,
  MenuFlyoutItem,
  MenuFlyoutSeparator,
  MenuFlyoutSubItem,
  RadioMenuFlyoutItem,
  TeachingTip,
  Text,
  ToggleMenuFlyoutItem,
  ToolTip,
} from '../../lib';
import { Example, Page } from '../Example';

export function DialogsPage() {
  const [dialog, setDialog] = useState(false);
  const [result, setResult] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [tip, setTip] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [sort, setSort] = useState('name');
  const [last, setLast] = useState('');
  const tipTarget = useRef<HTMLButtonElement>(null);

  return (
    <Page
      title="Dialogs & flyouts"
      description="Surfaces that appear over the page. Menus and flyouts are acrylic and unroll from the element that opened them; dialogs scale in over a smoke layer."
    >
      <Example
        title="ContentDialog"
        description="A modal dialog. Focus stays inside it and Escape closes it."
        code={`<ContentDialog
  open={open}
  onOpenChange={setOpen}
  title="Save your work?"
  primaryButtonText="Save"
  secondaryButtonText="Don't save"
  closeButtonText="Cancel"
>
  Lorem ipsum...
</ContentDialog>`}
      >
        <Button onClick={() => setDialog(true)}>Show dialog</Button>
        <span className="g-out">{result}</span>
        <ContentDialog
          open={dialog}
          onOpenChange={setDialog}
          title="Save your work?"
          primaryButtonText="Save"
          secondaryButtonText="Don't save"
          closeButtonText="Cancel"
          onPrimaryClick={() => setResult('You chose Save.')}
          onSecondaryClick={() => setResult("You chose Don't save.")}
          onCloseClick={() => setResult('You cancelled.')}
        >
          <Text block>
            Your changes will be lost if you close this document without saving. Do you want to save
            them first?
          </Text>
          <CheckBox style={{ marginTop: 12 }}>Always ask before closing</CheckBox>
        </ContentDialog>
      </Example>

      <Example
        title="Flyout"
        description="A light-dismiss popup with any content. Click outside it to close."
        code={`<Flyout trigger={<Button>Empty cart</Button>}>
  <Text block>All items will be removed. Continue?</Text>
  <Button>Yes, empty my cart</Button>
</Flyout>`}
      >
        <Flyout open={confirm} onOpenChange={setConfirm} trigger={<Button>Empty cart</Button>}>
          <Text block style={{ marginBottom: 12 }}>
            All items will be removed. Do you want to continue?
          </Text>
          <Button onClick={() => setConfirm(false)}>Yes, empty my cart</Button>
        </Flyout>
        <Flyout placement="right" trigger={<Button>Opens to the right</Button>}>
          <Text>Flyouts flip to the other side when there is no room.</Text>
        </Flyout>
      </Example>

      <Example
        title="MenuFlyout"
        description="Icons, shortcut hints, toggle and radio items, and cascading submenus."
        code={`<MenuFlyout trigger={<Button>Open menu</Button>}>
  <MenuFlyoutItem icon="copy" accelerator="Ctrl+C">Copy</MenuFlyoutItem>
  <MenuFlyoutSubItem text="Send to">...</MenuFlyoutSubItem>
  <MenuFlyoutSeparator />
  <ToggleMenuFlyoutItem checked={wrap} onCheckedChange={setWrap}>Word wrap</ToggleMenuFlyoutItem>
</MenuFlyout>`}
        options={<span className="g-out">{last ? `Last command: ${last}` : 'Pick a command'}</span>}
      >
        <MenuFlyout trigger={<Button>Edit</Button>}>
          <MenuFlyoutItem icon="cut" accelerator="Ctrl+X" onClick={() => setLast('Cut')}>
            Cut
          </MenuFlyoutItem>
          <MenuFlyoutItem icon="copy" accelerator="Ctrl+C" onClick={() => setLast('Copy')}>
            Copy
          </MenuFlyoutItem>
          <MenuFlyoutItem icon="paste" accelerator="Ctrl+V" onClick={() => setLast('Paste')}>
            Paste
          </MenuFlyoutItem>
          <MenuFlyoutSeparator />
          <MenuFlyoutSubItem text="Send to" icon="share">
            <MenuFlyoutItem icon="mail" onClick={() => setLast('Send to Mail')}>
              Mail
            </MenuFlyoutItem>
            <MenuFlyoutItem icon="print" onClick={() => setLast('Send to Printer')}>
              Printer
            </MenuFlyoutItem>
            <MenuFlyoutSubItem text="Nearby devices">
              <MenuFlyoutItem onClick={() => setLast('Send to Laptop')}>Laptop</MenuFlyoutItem>
              <MenuFlyoutItem onClick={() => setLast('Send to Phone')}>Phone</MenuFlyoutItem>
            </MenuFlyoutSubItem>
          </MenuFlyoutSubItem>
          <MenuFlyoutItem icon="delete" disabled>
            Delete
          </MenuFlyoutItem>
        </MenuFlyout>
        <MenuFlyout trigger={<Button>View</Button>}>
          <ToggleMenuFlyoutItem checked={wrap} onCheckedChange={setWrap}>
            Word wrap
          </ToggleMenuFlyoutItem>
          <ToggleMenuFlyoutItem defaultChecked>Status bar</ToggleMenuFlyoutItem>
          <MenuFlyoutSeparator />
          {['name', 'date', 'size'].map((s) => (
            <RadioMenuFlyoutItem key={s} checked={sort === s} onSelect={() => setSort(s)}>
              Sort by {s}
            </RadioMenuFlyoutItem>
          ))}
        </MenuFlyout>
      </Example>

      <Example
        title="ContextMenu"
        description="Right-click the card."
        code={`<ContextMenu menu={<><MenuFlyoutItem icon="refresh">Refresh</MenuFlyoutItem>...</>}>
  <Card>Right-click me</Card>
</ContextMenu>`}
      >
        <ContextMenu
          menu={
            <>
              <MenuFlyoutItem icon="refresh" onClick={() => setLast('Refresh')}>
                Refresh
              </MenuFlyoutItem>
              <MenuFlyoutItem icon="pin" onClick={() => setLast('Pin')}>
                Pin to Start
              </MenuFlyoutItem>
              <MenuFlyoutSeparator />
              <MenuFlyoutItem icon="settings" onClick={() => setLast('Properties')}>
                Properties
              </MenuFlyoutItem>
            </>
          }
        >
          <Card style={{ width: 280, textAlign: 'center', padding: '32px 16px' }}>
            <Text tone="secondary">Right-click anywhere in this card</Text>
          </Card>
        </ContextMenu>
      </Example>

      <Example
        title="TeachingTip"
        description="A tip that points at an element. It stays until the user closes it."
        code={`<TeachingTip
  open={open}
  onOpenChange={setOpen}
  target={buttonRef}
  title="Save automatically"
  subtitle="Your changes are saved as you go."
  actionButtonText="Got it"
/>`}
      >
        <Button ref={tipTarget} onClick={() => setTip((t) => !t)}>
          Show teaching tip
        </Button>
        <TeachingTip
          open={tip}
          onOpenChange={setTip}
          target={tipTarget}
          placement="bottom"
          title="Save automatically"
          subtitle="When you save to OneDrive, your changes are saved as you go."
          actionButtonText="Got it"
          onActionClick={() => setTip(false)}
        />
      </Example>

      <Example
        title="ToolTip"
        description="Rest the pointer on a button, or tab to it."
        code={`<ToolTip content="Save (Ctrl+S)"><Button icon="save" aria-label="Save" /></ToolTip>`}
      >
        <ToolTip content="Save (Ctrl+S)">
          <Button icon="save" aria-label="Save" />
        </ToolTip>
        <ToolTip content="Tooltips can sit on any side" placement="right">
          <Button>Right</Button>
        </ToolTip>
        <ToolTip content="A longer tooltip wraps onto more lines once it reaches its maximum width of 320 pixels." placement="bottom">
          <Button>Long text</Button>
        </ToolTip>
      </Example>
    </Page>
  );
}
