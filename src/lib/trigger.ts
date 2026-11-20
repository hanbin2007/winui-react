import { cloneElement, version, type ReactElement, type Ref } from 'react';
import { mergeRefs } from './utils';

const REACT_MAJOR = Number(version.split('.')[0]);

type AnyProps = Record<string, unknown>;

/**
 * Clone a trigger element, attaching a ref and extra props. Event handlers in
 * `extra` run after the element's own handlers instead of replacing them.
 */
export function withTrigger(
  trigger: ReactElement,
  ref: Ref<HTMLElement>,
  extra: AnyProps = {},
): ReactElement {
  const props = (trigger.props ?? {}) as AnyProps;
  const ownRef = (REACT_MAJOR >= 19 ? props.ref : (trigger as unknown as { ref?: unknown }).ref) as
    | Ref<HTMLElement>
    | undefined;
  const merged: AnyProps = { ...extra, ref: mergeRefs(ownRef, ref) };
  for (const key of Object.keys(extra)) {
    const mine = extra[key];
    const theirs = props[key];
    if (/^on[A-Z]/.test(key) && typeof mine === 'function' && typeof theirs === 'function') {
      merged[key] = (...args: unknown[]) => {
        (theirs as (...a: unknown[]) => void)(...args);
        (mine as (...a: unknown[]) => void)(...args);
      };
    }
  }
  return cloneElement(trigger, merged);
}
