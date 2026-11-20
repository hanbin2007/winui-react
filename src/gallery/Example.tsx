import type { ReactNode } from 'react';
import { Text } from '../lib';

export function Page({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="g-page">
      <Text variant="title">{title}</Text>
      {description != null && (
        <Text tone="secondary" className="g-page__desc">
          {description}
        </Text>
      )}
      {children}
    </div>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return (
    <Text variant="subtitle" className="g-section" block>
      {children}
    </Text>
  );
}

interface ExampleProps {
  title: string;
  description?: ReactNode;
  /** Short source shown under the demo. */
  code?: string;
  /** Controls that change the demo, shown on the right. */
  options?: ReactNode;
  /** Lay the demo out as a column. */
  stack?: boolean;
  /** Let the demo fill the card (no flex layout). */
  fill?: boolean;
  children: ReactNode;
}

export function Example({ title, description, code, options, stack, fill, children }: ExampleProps) {
  return (
    <section className="g-example">
      <Text variant="bodyStrong" className="g-example__title">
        {title}
      </Text>
      {description != null && (
        <Text tone="secondary" className="g-example__desc">
          {description}
        </Text>
      )}
      <div className="g-example__card">
        <div className="g-example__main">
          <div className="g-example__demo" data-stack={stack || undefined} data-fill={fill || undefined}>
            {children}
          </div>
          {options != null && <div className="g-example__options">{options}</div>}
        </div>
        {code && (
          <details className="g-example__code">
            <summary>Source code</summary>
            <pre>{code.trim()}</pre>
          </details>
        )}
      </div>
    </section>
  );
}
