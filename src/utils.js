/**
 * Vocal HTML Node selector. If element is nout found, raises an error
 * in the console. Second parameter is a search scope (domain). If not passed,
 * document is used.
 *
 * @param {string} selector
 * @param {HTMLElement} domain (optional)
 * @returns {HTMLElement}
 */

export const getNode = (selector, domain) => {
  if (typeof domain === 'undefined') {
    domain = document;
  } else if (![Node.ELEMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE].includes(domain.nodeType)) {
    console.error('Passed scope parameter for \'' + selector+ '\' query is not a valid DOM node');
    return;
  }

  const node = domain.querySelector(selector);

  if (!node) {
    console.error('No elements with \'' + selector + '\' selector were found in the scope');
  }

  return node;
};

/**
 * Searches for template element and clones to a new one. If template is not
 * found, raises an error in the console.
 *
 * @param {string} selector
 * @param {HTMLElement} domain (optional)
 * @returns {HTMLElement}
 */
export const getNodeFromTemplate = (selector) => {
  const template = document.querySelector(selector);

  if (!template) {
   console.error('Template \'' + selector + '\' was not found in the page document');
   return;
  }

  return template.content.cloneNode(true);
}

/**
 * Vocal alias for the HTML DOM Element appendChild() method.
 *
 * @param {HTMLElement} wrapperNode
 * @param {HTMLElement} hostedNode
 * @returns void
 */
export const placeNode = (wrapperNode, hostedNode) => {
  if (!wrapperNode || ![Node.ELEMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE].includes(wrapperNode.nodeType)) {
    console.error('Passed wrapper element is not a valid DOM node');
    return;
  }

  if (!hostedNode || ![Node.ELEMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE].includes(hostedNode.nodeType)) {
    console.error('Passed hosted element is not a valid DOM node');
    return;
  }

  wrapperNode.appendChild(hostedNode);
}
