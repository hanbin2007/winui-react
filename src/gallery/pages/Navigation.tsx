import { useState } from 'react';
import {
  AppBarButton,
  AppBarSeparator,
  AppBarToggleButton,
  BreadcrumbBar,
  ComboBox,
  CommandBar,
  Frame,
  InfoBadge,
  MenuBar,
  MenuBarItem,
  MenuFlyoutItem,
  MenuFlyoutSeparator,
  MenuFlyoutSubItem,
  NavigationView,
  SelectorBar,
  TabView,
  Text,
  ThemeProvider,
  TitleBar,
  ToggleMenuFlyoutItem,
  useTheme,
  type NavigationViewItem,
  type PaneDisplayMode,
  type TabViewItem,
} from '../../lib';
import { Example, Page } from '../Example';

const NAV: NavigationViewItem[] = [
  { key: 'inbox', label: 'Inbox', icon: 'mail', infoBadge: <InfoBadge value={12} /> },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
  {
    key: 'folders',
    label: 'Folders',
    icon: 'folder',
    selectable: false,
    children: [
      { key: 'drafts', label: 'Drafts', icon: 'edit' },
      { key: 'sent', label: 'Sent', icon: 'send' },
      { key: 'archive', label: 'Archive', icon: 'save' },
    ],
  },
  { key: 'people', label: 'People', icon: 'people' },
];

const CRUMBS = ['Home', 'Documents', 'Design', 'Northwind', 'Images'];

export function NavigationPage() {
  const theme = useTheme();
  const [mode, setMode] = useState<string>('left');
  const [navKey, setNavKey] = useState('inbox');
  const [tabs, setTabs] = useState<TabViewItem[]>([
    { key: 't1', header: 'Document 1', icon: 'document' },
    { key: 't2', header: 'Document 2', icon: 'document' },
    { key: 't3', header: 'Pictures', icon: 'image' },
  ]);
  const [tab, setTab] = useState('t1');
  const [count, setCount] = useState(3);
  const [depth, setDepth] = useState(CRUMBS.length);
  const [view, setView] = useState('recent');
  const [last, setLast] = useState('');

  const closeTab = (key: string) => {
    const i = tabs.findIndex((t) => t.key === key);
    const next = tabs.filter((t) => t.key !== key);
    setTabs(next);
    if (key === tab && next.length) setTab(next[Math.min(i, next.length - 1)].key);
  };

  return (
    <Page
      title="Navigation"
      description="Controls for moving around an app. Watch the selection pill: it stretches towards the new item, then its tail catches up."
    >
      <Example
        title="NavigationView and TitleBar"
        description="A small window with its own navigation. Change the pane mode on the right; try the hamburger button in each one."
        code={`<NavigationView
  items={items}
  settings
  paneDisplayMode="left"
  selectedKey={key}
  onSelectionChange={setKey}
>
  <Frame pageKey={key}>...</Frame>
</NavigationView>`}
        options={
          <ComboBox
            header="Pane display mode"
            items={['left', 'leftCompact', 'leftMinimal', 'top']}
            value={mode}
            onValueChange={setMode}
          />
        }
        fill
      >
        <ThemeProvider theme={theme} backdrop="micaAlt" className="g-window" style={{ minHeight: 0 }}>
          <TitleBar icon={<span className="g-logo" />} title="Mail" captionButtons />
          <NavigationView
            key={mode}
            items={NAV}
            settings
            paneDisplayMode={mode as PaneDisplayMode}
            openPaneWidth={220}
            selectedKey={navKey}
            onSelectionChange={setNavKey}
          >
            <Frame pageKey={navKey} className="g-pad">
              <Text variant="subtitle">{navKey[0].toUpperCase() + navKey.slice(1)}</Text>
              <Text tone="secondary" block style={{ marginTop: 4 }}>
                The page slides up and fades in each time the selection changes.
              </Text>
            </Frame>
          </NavigationView>
        </ThemeProvider>
      </Example>

      <Example
        title="TabView"
        description="Add, close and switch tabs. The selected tab joins the content below it with curved feet."
        code={`<TabView tabs={tabs} selectedKey={tab} onSelectionChange={setTab} onTabClose={close} onAddTab={add}>
  ...content
</TabView>`}
        fill
      >
        <ThemeProvider theme={theme} backdrop="micaAlt" className="g-window" style={{ minHeight: 0, height: 200 }}>
          <TabView
            style={{ height: '100%' }}
            tabs={tabs}
            selectedKey={tab}
            onSelectionChange={setTab}
            onTabClose={closeTab}
            onAddTab={() => {
              const n = count + 1;
              setCount(n);
              setTabs([...tabs, { key: `t${n}`, header: `Document ${n}`, icon: 'document' }]);
              setTab(`t${n}`);
            }}
          >
            <div className="g-pad">
              <Text tone="secondary">
                {tabs.length ? `Content of ${tabs.find((t) => t.key === tab)?.header ?? ''}` : 'No tabs open.'}
              </Text>
            </div>
          </TabView>
        </ThemeProvider>
      </Example>

      <Example
        title="BreadcrumbBar"
        description="Click an earlier item to go back to it."
        code={`<BreadcrumbBar items={items} onItemClick={(item, index) => goTo(index)} />`}
        stack
      >
        <BreadcrumbBar
          items={CRUMBS.slice(0, depth).map((label) => ({ key: label, label }))}
          onItemClick={(_item, i) => setDepth(i + 1)}
        />
        <BreadcrumbBar
          size="large"
          items={[
            { key: 'settings', label: 'Settings' },
            { key: 'system', label: 'System' },
            { key: 'display', label: 'Display' },
          ]}
        />
        {depth < CRUMBS.length && (
          <span className="g-out" role="button" tabIndex={0} onClick={() => setDepth(CRUMBS.length)}>
            Click here to reset the first breadcrumb.
          </span>
        )}
      </Example>

      <Example
        title="SelectorBar"
        description="Switches between a few views. The underline slides between items."
        code={`<SelectorBar items={[{ key: 'recent', text: 'Recent', icon: 'clock' }, ...]} selectedKey={view} onSelectionChange={setView} />`}
        stack
      >
        <SelectorBar
          items={[
            { key: 'recent', text: 'Recent', icon: 'clock' },
            { key: 'shared', text: 'Shared', icon: 'share' },
            { key: 'favourites', text: 'Favourites', icon: 'star' },
            { key: 'archive', text: 'Archive', icon: 'folder' },
          ]}
          selectedKey={view}
          onSelectionChange={setView}
        />
        <Frame pageKey={view} transition="slideFromRight">
          <Text tone="secondary">Showing the {view} view.</Text>
        </Frame>
      </Example>

      <Example
        title="CommandBar"
        code={`<CommandBar secondaryCommands={<MenuFlyoutItem icon="settings">Settings</MenuFlyoutItem>}>
  <AppBarButton icon="add" label="Add" />
  <AppBarToggleButton icon="pin" label="Pin" />
  <AppBarSeparator />
  <AppBarButton icon="delete" label="Delete" />
</CommandBar>`}
        options={<span className="g-out">{last ? `Last command: ${last}` : 'Pick a command'}</span>}
        stack
      >
        <CommandBar
          align="left"
          secondaryCommands={
            <>
              <MenuFlyoutItem icon="settings" accelerator="Ctrl+I" onClick={() => setLast('Settings')}>
                Settings
              </MenuFlyoutItem>
              <MenuFlyoutItem icon="help" onClick={() => setLast('Help')}>
                Help
              </MenuFlyoutItem>
            </>
          }
        >
          <AppBarButton icon="add" label="Add" onClick={() => setLast('Add')} />
          <AppBarButton icon="edit" label="Edit" onClick={() => setLast('Edit')} />
          <AppBarButton icon="share" label="Share" onClick={() => setLast('Share')} />
          <AppBarSeparator />
          <AppBarToggleButton icon="pin" label="Pin" />
          <AppBarButton icon="delete" label="Delete" disabled />
        </CommandBar>
        <CommandBar labelPosition="collapsed" align="left">
          <AppBarButton icon="undo" label="Undo" onClick={() => setLast('Undo')} />
          <AppBarButton icon="redo" label="Redo" onClick={() => setLast('Redo')} />
          <AppBarSeparator />
          <AppBarButton icon="cut" label="Cut" onClick={() => setLast('Cut')} />
          <AppBarButton icon="copy" label="Copy" onClick={() => setLast('Copy')} />
          <AppBarButton icon="paste" label="Paste" onClick={() => setLast('Paste')} />
        </CommandBar>
        <CommandBar labelPosition="bottom" align="left">
          <AppBarButton icon="play" label="Play" onClick={() => setLast('Play')} />
          <AppBarButton icon="pause" label="Pause" onClick={() => setLast('Pause')} />
          <AppBarButton icon="volume" label="Volume" onClick={() => setLast('Volume')} />
        </CommandBar>
      </Example>

      <Example
        title="MenuBar"
        description="Open one menu, then move the pointer across the others."
        code={`<MenuBar>
  <MenuBarItem title="File">
    <MenuFlyoutItem accelerator="Ctrl+N">New</MenuFlyoutItem>
  </MenuBarItem>
</MenuBar>`}
        fill
      >
        <MenuBar>
          <MenuBarItem title="File">
            <MenuFlyoutItem accelerator="Ctrl+N" onClick={() => setLast('New')}>
              New
            </MenuFlyoutItem>
            <MenuFlyoutItem accelerator="Ctrl+O" onClick={() => setLast('Open')}>
              Open...
            </MenuFlyoutItem>
            <MenuFlyoutSubItem text="Open recent">
              <MenuFlyoutItem onClick={() => setLast('Open notes.txt')}>notes.txt</MenuFlyoutItem>
              <MenuFlyoutItem onClick={() => setLast('Open todo.md')}>todo.md</MenuFlyoutItem>
            </MenuFlyoutSubItem>
            <MenuFlyoutSeparator />
            <MenuFlyoutItem accelerator="Ctrl+S" onClick={() => setLast('Save')}>
              Save
            </MenuFlyoutItem>
            <MenuFlyoutItem onClick={() => setLast('Exit')}>Exit</MenuFlyoutItem>
          </MenuBarItem>
          <MenuBarItem title="Edit">
            <MenuFlyoutItem accelerator="Ctrl+Z" onClick={() => setLast('Undo')}>
              Undo
            </MenuFlyoutItem>
            <MenuFlyoutItem accelerator="Ctrl+X" onClick={() => setLast('Cut')}>
              Cut
            </MenuFlyoutItem>
            <MenuFlyoutItem accelerator="Ctrl+C" onClick={() => setLast('Copy')}>
              Copy
            </MenuFlyoutItem>
            <MenuFlyoutItem accelerator="Ctrl+V" onClick={() => setLast('Paste')}>
              Paste
            </MenuFlyoutItem>
          </MenuBarItem>
          <MenuBarItem title="View">
            <ToggleMenuFlyoutItem defaultChecked>Status bar</ToggleMenuFlyoutItem>
            <ToggleMenuFlyoutItem>Word wrap</ToggleMenuFlyoutItem>
          </MenuBarItem>
          <MenuBarItem title="Help">
            <MenuFlyoutItem onClick={() => setLast('About')}>About</MenuFlyoutItem>
          </MenuBarItem>
        </MenuBar>
      </Example>
    </Page>
  );
}
