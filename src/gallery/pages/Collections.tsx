import { useState } from 'react';
import {
  ComboBox,
  FlipView,
  GridView,
  ListView,
  PersonPicture,
  PipsPager,
  ScrollView,
  Text,
  TreeView,
  type SelectionMode,
  type TreeViewNode,
} from '../../lib';
import { Example, Page } from '../Example';

const PEOPLE = [
  { id: '1', name: 'Kendall Collins', role: 'Product manager' },
  { id: '2', name: 'Henry Ross', role: 'Designer' },
  { id: '3', name: 'Lydia Bauer', role: 'Software engineer' },
  { id: '4', name: 'Ashley McCarthy', role: 'Researcher' },
  { id: '5', name: 'Mona Kane', role: 'Engineering lead' },
  { id: '6', name: 'Elvia Atkins', role: 'Data scientist' },
  { id: '7', name: 'Wanda Howard', role: 'Marketing' },
  { id: '8', name: 'Tim Deboer', role: 'Support' },
];

const TILES = [
  ['Aurora', 'linear-gradient(135deg,#34d399,#3b82f6)'],
  ['Dusk', 'linear-gradient(135deg,#f472b6,#7c3aed)'],
  ['Ember', 'linear-gradient(135deg,#fb923c,#dc2626)'],
  ['Lagoon', 'linear-gradient(135deg,#22d3ee,#1d4ed8)'],
  ['Meadow', 'linear-gradient(135deg,#a3e635,#15803d)'],
  ['Slate', 'linear-gradient(135deg,#94a3b8,#334155)'],
].map(([name, bg]) => ({ name, bg }));

const TREE: TreeViewNode[] = [
  {
    key: 'docs',
    label: 'Documents',
    icon: 'folder',
    children: [
      {
        key: 'work',
        label: 'Work',
        icon: 'folder',
        children: [
          { key: 'plan', label: 'Feature plan.docx', icon: 'document' },
          { key: 'budget', label: 'Budget.xlsx', icon: 'document' },
        ],
      },
      { key: 'resume', label: 'Resume.pdf', icon: 'document' },
    ],
  },
  {
    key: 'pics',
    label: 'Pictures',
    icon: 'folder',
    children: [
      { key: 'p1', label: 'Holiday.jpg', icon: 'image' },
      { key: 'p2', label: 'Garden.png', icon: 'image' },
    ],
  },
  { key: 'music', label: 'Music', icon: 'folder', children: [{ key: 'm1', label: 'Track 01.mp3', icon: 'music' }] },
];

export function CollectionsPage() {
  const [mode, setMode] = useState<string>('single');
  const [keys, setKeys] = useState<string[]>(['2']);
  const [tiles, setTiles] = useState<string[]>(['Dusk']);
  const [page, setPage] = useState(0);
  const [node, setNode] = useState<string | null>('resume');

  return (
    <Page
      title="Collections"
      description="Controls that show sets of items. Selection uses the accent pill; press an item and the pill shrinks."
    >
      <Example
        title="ListView"
        code={`<ListView
  items={people}
  getKey={(p) => p.id}
  selectionMode="single"
  selectedKeys={keys}
  onSelectionChange={setKeys}
  renderItem={(p) => <PersonRow person={p} />}
/>`}
        options={
          <>
            <ComboBox
              header="Selection mode"
              items={['none', 'single', 'multiple']}
              value={mode}
              onValueChange={(m) => {
                setMode(m);
                setKeys([]);
              }}
            />
            <span className="g-out">Selected: {keys.length ? keys.join(', ') : 'nothing'}</span>
          </>
        }
        fill
      >
        <ScrollView style={{ height: 300, maxWidth: 420 }}>
          <ListView
            aria-label="People"
            items={PEOPLE}
            getKey={(p) => p.id}
            selectionMode={mode as SelectionMode}
            selectedKeys={keys}
            onSelectionChange={setKeys}
            renderItem={(p) => (
              <div className="g-row" style={{ gap: 12, padding: '8px 0' }}>
                <PersonPicture displayName={p.name} size={32} />
                <div>
                  <Text block>{p.name}</Text>
                  <Text variant="caption" tone="secondary" block>
                    {p.role}
                  </Text>
                </div>
              </div>
            )}
          />
        </ScrollView>
      </Example>

      <Example
        title="GridView"
        description="A wrapping grid of tiles with multiple selection."
        code={`<GridView items={tiles} getKey={(t) => t.name} selectionMode="multiple" renderItem={...} />`}
      >
        <GridView
          aria-label="Wallpapers"
          items={TILES}
          getKey={(t) => t.name}
          selectionMode="multiple"
          selectedKeys={tiles}
          onSelectionChange={setTiles}
          renderItem={(t) => (
            <div className="g-tilepic" style={{ background: t.bg }}>
              {t.name}
            </div>
          )}
        />
      </Example>

      <Example
        title="TreeView"
        description="Click a folder to expand it; the chevron turns and the children slide open. Arrow keys work too."
        code={`<TreeView items={nodes} defaultExpandedKeys={['docs']} selectedKey={key} onSelectionChange={setKey} />`}
        options={<span className="g-out">Selected: {node ?? 'nothing'}</span>}
        fill
      >
        <TreeView
          aria-label="Files"
          style={{ maxWidth: 320 }}
          items={TREE}
          defaultExpandedKeys={['docs']}
          selectedKey={node}
          onSelectionChange={setNode}
        />
      </Example>

      <Example
        title="FlipView and PipsPager"
        description="Hover the picture for the previous and next buttons, or use the pips below."
        code={`<FlipView index={page} onIndexChange={setPage}>{slides}</FlipView>
<PipsPager numberOfPages={slides.length} selectedIndex={page} onSelectedIndexChange={setPage} buttons />`}
        stack
      >
        <FlipView aria-label="Wallpapers" style={{ width: 420, height: 220 }} index={page} onIndexChange={setPage}>
          {TILES.map((t) => (
            <div key={t.name} className="g-flip" style={{ background: t.bg }}>
              {t.name}
            </div>
          ))}
        </FlipView>
        <div style={{ width: 420, display: 'flex', justifyContent: 'center' }}>
          <PipsPager numberOfPages={TILES.length} selectedIndex={page} onSelectedIndexChange={setPage} buttons />
        </div>
      </Example>
    </Page>
  );
}
