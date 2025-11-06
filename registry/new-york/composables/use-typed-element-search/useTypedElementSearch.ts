/**
 *
 * @type registry:hook
 * @category elements
 */

export const useTypedElementSearch = () => {
  /**
   * Recursively searches for an element of a given type in a DOM tree
   */
  const searchTypedElementInTree = <T extends Element>(
    root: Element,
    predicate: (el: Element) => el is T
  ): T | null => {
    if (predicate(root)) return root;
    for (const child of Array.from(root.children)) {
      const found = searchTypedElementInTree(child, predicate);
      if (found) return found;
    }
    return null;
  };

  /**
   * Searches for an element of a given type among the siblings of a referenced element, including their respective subtrees.
   */
  const getTypedElementAmongSiblings = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T
  ): T | null => {
    if (!refEl || !refEl.parentElement) return null;
    const siblings = Array.from(refEl.parentElement.children).filter((el) => el !== refEl);
    for (const sibling of siblings) {
      const found = searchTypedElementInTree(sibling, predicate);
      if (found) return found;
    }
    return null;
  };

  /**
   * Recursively searches for an element of a given type among the successive parents of an element.
   */
  const getContainerOfType = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T
  ): T | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (predicate(current)) return current;
      current = current.parentElement;
    }
    return null;
  };

  /**
   * Returns the first parent HTMLElement of a given element.
   */
  const getContainer = (refEl: Element): HTMLElement | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (current instanceof HTMLElement) return current;
      current = current.parentElement;
    }
    return null;
  };

  return {
    searchTypedElementInTree,
    getTypedElementAmongSiblings,
    getContainerOfType,
    getContainer,
  };
};
