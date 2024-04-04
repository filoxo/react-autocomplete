import { useState } from 'react';

interface UseActiveDescendantProps<E = HTMLElement> {
  element?: E;
  selector?: string;
}

/**
 * useTrackActiveDescendant
 *
 * @summary Use this hook to track the currently active descendant within a container.
 *
 * @param params.element - container HTML element to track an active descendant within. Obtain such an element using a [Callback Ref](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs), which is necessary to prevent extra renders from the parent.
 * @param params.selector - selector to use to find the active descendant within the container element. Defaults to `[role="option"]`.
 * @returns ActiveDescendantTracking
 *
 * this hook implements the [WAI ARIA Active Descendant Pattern](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant) for virtually managing a focus indicator without having to leave the original element.
 */
export const useTrackActiveDescendant = <T extends HTMLElement>({
  element,
  selector = '[role="option"]',
}: UseActiveDescendantProps<T>) => {
  const [activeId, setActiveDescendant] = useState<string | null>(null);

  const getCurrentActiveIndex = () => {
    if (element?.childNodes) {
      // childNodes is a live HTMLCollection, and will update as the DOM changes without needing MutationObserver
      for (let i = 0; i < element.childNodes.length; i++) {
        const item = element.childNodes[i] as T;
        if (item.matches(selector) && item.id === activeId) {
          return i;
        }
      }
    }
    return -1;
  };

  const next = () => {
    if (!element) return;
    const activeElemIndex = getCurrentActiveIndex();
    const nextIndex = activeElemIndex + 1;
    const wrapAroundIndex = nextIndex % element.childNodes.length;
    const nextElem = element.childNodes[wrapAroundIndex] as T;
    if (nextElem?.id) {
      setActiveDescendant(nextElem.id);
    }
  };

  const prev = () => {
    if (!element) return;
    const activeElemIndex = getCurrentActiveIndex();
    const prevIndex = activeElemIndex - 1;
    const wrapAroundIndex =
      prevIndex < 0 ? element.childNodes.length - 1 : prevIndex;
    const prevElem = element.childNodes[wrapAroundIndex] as T;
    if (prevElem?.id) {
      setActiveDescendant(prevElem.id);
    }
  };

  const clear = () => setActiveDescendant(null);

  const update = (id?: string) => setActiveDescendant(id ?? null);

  const click = () => {
    if (!element) return;
    const activeElemIndex = getCurrentActiveIndex();
    const activeElem = element.childNodes[activeElemIndex] as T;
    activeElem?.click();
  };

  const check = (id: string) => id === activeId;

  /**
   * @deftype {Object} TrackActiveDescendant
   *
   * @property {string} current - the id of the active descendant
   * @property {(id: string) => boolean} check - check if the given id matches the active descendant id
   * @property {function} update - update the active descendant
   * @property {function} clear - clear the active descendant
   * @property {function} next - set the next element that matches the selector as the active descendant
   * @property {function} prev - set the previous element that matches the selector as the active descendant
   * @property {function} click - trigger click event on the current active descendant
   */
  return {
    current: activeId,
    update,
    clear,
    next,
    prev,
    click,
    check,
  };
};
