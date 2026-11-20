import { useState } from 'react';
import { AutoSuggestBox, NumberBox, PasswordBox, TextBox } from '../../lib';
import { Example, Page } from '../Example';

const CATS = [
  'Abyssinian', 'American Shorthair', 'Bengal', 'Birman', 'Bombay', 'British Shorthair', 'Burmese',
  'Devon Rex', 'Maine Coon', 'Norwegian Forest', 'Persian', 'Ragdoll', 'Russian Blue', 'Scottish Fold',
  'Siamese', 'Siberian', 'Sphynx', 'Turkish Angora',
];

export function TextPage() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | null>(12);
  const [sum, setSum] = useState<number | null>(null);
  const [picked, setPicked] = useState('');

  return (
    <Page
      title="Text"
      description="Text entry controls. Focus one to see the fill change and the accent line appear along the bottom edge."
    >
      <Example
        title="TextBox"
        code={`<TextBox header="Name" placeholder="Type your name" value={name} onValueChange={setName} />
<TextBox header="Notes" multiline rows={4} />`}
        stack
      >
        <div className="g-row" style={{ alignItems: 'flex-end' }}>
          <TextBox style={{ width: 260 }} header="Name" placeholder="Type your name" value={name} onValueChange={setName} />
          <span className="g-out" style={{ paddingBottom: 8 }}>
            {name ? `Hello, ${name}.` : 'The clear button appears once you type.'}
          </span>
        </div>
        <TextBox style={{ width: 260 }} header="With a description" description="Shown under the box." defaultValue="Some text" />
        <TextBox style={{ width: 360 }} header="Notes" multiline rows={4} placeholder="Multi-line text" />
        <div className="g-row">
          <TextBox style={{ width: 200 }} defaultValue="Read only" readOnly />
          <TextBox style={{ width: 200 }} defaultValue="Disabled" disabled />
        </div>
      </Example>

      <Example
        title="PasswordBox"
        description="Hold the eye button to peek at the password."
        code={`<PasswordBox header="Password" placeholder="Enter your password" />`}
      >
        <PasswordBox style={{ width: 260 }} header="Password" placeholder="Enter your password" defaultValue="hunter2" />
      </Example>

      <Example
        title="NumberBox"
        description="Arrow keys and the spin buttons step the value. With acceptsExpression it works out sums when you press Enter."
        code={`<NumberBox header="Quantity" value={amount} onValueChange={setAmount} min={0} max={100} spinButtons="inline" />
<NumberBox header="Type a sum" acceptsExpression placeholder="1 + 2 ^ 3" />`}
      >
        <NumberBox
          style={{ width: 180 }}
          header="Quantity (0 to 100)"
          value={amount}
          onValueChange={setAmount}
          min={0}
          max={100}
          spinButtons="inline"
        />
        <NumberBox
          style={{ width: 220 }}
          header="Type a sum, then press Enter"
          acceptsExpression
          placeholder="1 + 2 ^ 3"
          value={sum}
          onValueChange={setSum}
        />
        <span className="g-out" style={{ alignSelf: 'flex-end', paddingBottom: 8 }}>
          Values: {String(amount)} and {String(sum)}
        </span>
      </Example>

      <Example
        title="AutoSuggestBox"
        description="Type a few letters. Use the arrow keys and Enter, or click a suggestion."
        code={`<AutoSuggestBox
  placeholder="Type a cat breed"
  items={cats}
  onSuggestionChosen={setPicked}
/>`}
      >
        <AutoSuggestBox
          style={{ width: 300 }}
          header="Cat breed"
          placeholder="Try typing 'b' or 'sh'"
          items={CATS}
          noResultsText="No results found"
          onSuggestionChosen={setPicked}
        />
        <span className="g-out" style={{ alignSelf: 'flex-end', paddingBottom: 8 }}>
          {picked ? `You chose ${picked}.` : 'Nothing chosen yet.'}
        </span>
      </Example>
    </Page>
  );
}
