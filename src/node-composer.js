import error from './helpers/error';

export default class NodeComposer {

  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_NODE: "Passed scope parameter for query '{0}' is not a valid DOM node",
    INVALID_WRAPPER: "Passed wrapper element is not a valid DOM node",
    NODE_NOT_FOUND: "No elements with selector '{0}' were found in the scope",
    TEMPLATE_NOT_FOUND: "Template '{0}' was not found in the page document",
    UNDEFINED_WRAPPER: "Wrapper is undefined",
    UNDEFINED_TEMPLATE: "Template is underfined",
    INVALID_VALUES: "Invalid values for template '{0}'",
    INVALID_CHILDREN: "Invalid children for template '{0}'",
    NODE_ID_REQUIRED: "Id is required if `beforeUnset` is set",
    NOT_A_FUNCTION: "'{0}' is not a valid function"
  };

  /**
   * Node types accepted for template insertion.
   */
  _acceptedNodeTypes = [
    Node.ELEMENT_NODE,
    Node.DOCUMENT_FRAGMENT_NODE
  ];

  /**
   * Array for functions to be triggered while unsetting the element.
   */
  _beforeUnsets = [];

  /**
   * Shortcut for _acceptedNodeTypes.includes() to keep the code self-explaining.
   *
   * @param {HTMLElement} node  element to be checked
   * @returns
   */
  _isCorrectNode(node) {
    if (!node.nodeType) {
      return false;
    }
    return this._acceptedNodeTypes.includes(node.nodeType);
  }

  /**
   * Vocal HTML Node selector. If element is nout found, raises an error in the
   * console based on this._showErrors value. Second parameter is a search scope.
   * If not passed, document is used.
   *
   * @param {string}      selector  HTML Selector string
   * @param {HTMLElement} scope    HTML node for search scope (optional)
   * @returns {HTMLElement}
   */
  _getNode(selector, scope) {
    if (typeof scope === 'undefined') {
      scope = document;
    } else if (!this._isCorrectNode(scope)) {
      error(this._errorMessage.INVALID_NODE, selector);
      return;
    }

    const node = scope.querySelector(selector);

    if (!node) {
      error(this._errorMessage.NODE_NOT_FOUND, selector);
    }

    return node;
  }

  /**
   * Searches for template element and clones to a new one. If template is not
   * found, raises an error in the console based on this._showErrors.
   *
   * @param   {string}      selector  HTML Selector string
   * @returns {HTMLElement}
   */
  _getNodeFromTemplate(selector) {
    const template = document.querySelector(selector);
    if (!template) {
      error(this._errorMessage.TEMPLATE_NOT_FOUND, selector);
      return;
    }

    return template.content.cloneNode(true);
  }

  /**
   * Composes a new node based on the provided template (should be in the document
   * body as <template>) and inserts it wrapper. If values are provided, inserts
   * values. Recursive: propery childres is an arrey, where each element is an
   * object of the same structure, e.g.:
   *
   * composeNode({
   *  wrapper: 'body',
   *  template: '#template1',
   *  values: [
   *      {
   *        wrapper: '.value-tag',
   *        innerHTML: 'Example <b>HTML</b>' // OR innerText: 'Example text'
   *        attributes: [
   *          { name: 'data-variable', value: 'value' }
   *        ]
   *      }
   *    ],
   *  children: [
   *      wrapper: '.child-tag',
   *      template '#template2',
   *      values: [
   *          {
   *            wrapper: '.subvalue-tag',
   *            innerText: 'Example subtext'
   *          }
   *        ]
   *    ],
   *  afterInsert: () => { ... },
   *  beforeUnset: () => { ... }
   * })
   *
   * @param  {String}    options.wrapper         Wrapper element selector
   * @param  {String}    options.template        Template element selector
   * @param  {Array}     options.values          Array of values to insert (optional)
   * @param  {Array}     options.children        Array of children to insert (optional)
   * @param  {Element}   options.scope           Scope for selecting wrapper element (optional)
   * @param  {Function}  options.afterInsert     Function to be triggered after element
   *                                             is placed (optional)
   * @param  {Function}  options.beforeUnset     Function to be triggered after element
   *                                             is placed (optional)
   * @param  {String}    options.id              Id for the element. Required if beforeUnset
   *                                             is set, otherwise optional
   * @param  {Boolean}   options.incremental     Default is true. If set to false, wrapper is
   *                                             cleared before inserting new nodes (optional)
   * @param  {Boolean}   options.replaceWrapper  Default is false. If set to true, new node is
   *                                             replacing wrapper instead of appending to it.
   * @return {Element}   Composed node
   */
  composeNode({
    id,
    wrapper,
    template,
    values,
    children,
    scope,
    afterInsert,
    beforeUnset,
    incremental,
    replaceWrapper
  }) {
    if (!wrapper) {
      error(this._errorMessage.UNDEFINED_WRAPPER);
      return;
    }

    wrapper = this._isCorrectNode(wrapper)
      ? wrapper
      : this._getNode(wrapper, scope);

    if (!template) {
      error(this._errorMessage.UNDEFINED_TEMPLATE);
      return;
    }

    template = this._isCorrectNode(template)
      ? template
      : this._getNodeFromTemplate(template);

    if (afterInsert && typeof afterInsert !== 'function') {
      error(this._errorMessage.NOT_A_FUNCTION, 'afterInsert()');
      return;
    }

    if (beforeUnset) {
      if (typeof beforeUnset !== 'function') {
        error(this._errorMessage.NOT_A_FUNCTION, 'beforeUnset()');
        return;
      }

      if (!id) {
        error(this._errorMessage.NODE_ID_REQUIRED);
        return;
      }
    }

    if (incremental === false) {
      const executedBeforeUnsetIndexes = [];

      for (let i = this._beforeUnsets.length-1; i >= 0; i--) {
        const childObject = wrapper.querySelector(this._beforeUnsets[i].id);
        if (childObject) {
          this._beforeUnsets[i].beforeUnset(childObject);

          if (i === this._beforeUnsets.length-1) {
            this._beforeUnsets.pop();
          } else {
            this._beforeUnsets.splice(i, 1); // NOT TESTED
          }
        }
      }

      while (wrapper.firstChild) {
        wrapper.firstChild.remove();
      }
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(template);

    const element = fragment.querySelector('*');

    if (values) {
      if (!Array.isArray(values)) {
        error(this._errorMessage.INVALID_VALUES, templateSelector);
        return;
      }

      values.forEach((value) => {
        if (!value.wrapper) {
          error(this._errorMessage.INVALID_WRAPPER);
          return;
        }

        const element = this._getNode(value.wrapper, fragment);

        if (value.innerHTML) {
          element.innerHTML = value.innerHTML;
        } else if (value.innerText) {
          element.innerText = value.innerText;
        }

        if (value.attributes && Array.isArray(value.attributes)) {
          value.attributes.forEach((attribute) => {
            if (Object.hasOwn(attribute, 'name') && Object.hasOwn(attribute, 'value')) {
              element.setAttribute(attribute.name, attribute.value);
            }
          })
        }
      });
    }

    if (children) {
      if (!Array.isArray(children)) {
        error(this._errorMessage.INVALID_CHILDREN, templateSelector);
        return;
      }

      children.forEach((child) => {
        if (!child.scope) {
          child = {...child, scope: fragment};
        }

        this.composeNode(child);
      });
    }

    if (id) {
      element.id = (id.substr(0, 1) === '#') ? id.substr(1) : id;

      if (beforeUnset) {
        if (replaceWrapper === true) {
          this._beforeUnsets.every((node, i) => {
            if (node.id === id) {
              node.beforeUnset(element);
              this._beforeUnsets[i].beforeUnset = beforeUnset;
              return false;
            }
            return true;
          });
        } else {
          this._beforeUnsets.push({id, beforeUnset })
        }
      }
    }

    if (replaceWrapper === true) {
      const parent = wrapper.parentNode;
      parent.replaceChild(fragment, wrapper);
    } else {
      wrapper.appendChild(fragment);
    }

    if (afterInsert) {
      afterInsert(element);
    }

    return element;
  }


  /**
   * Removes previously inserted node and runs the beforeUnset() function if it
   * was defined for the element and it its children.
   *
   * @param  {String/Element} nodeSelector - Element or a selector of node to remove
   * @return void
   */
  removeNode(nodeSelector) {
    const element = (nodeSelector instanceof Element)
      ? nodeSelector
      : document.querySelector(nodeSelector);

    if (!element) {
      error(this._errorMessage.NODE_NOT_FOUND, nodeSelector);
      return;
    }

    if (element.id && element.id !== '') {

      this._beforeUnsets.find((node, index) => {
        if (node.id === '#' + element.id) {
          node.beforeUnset(element);
          this._beforeUnsets.splice(index, 1);
          return true;
        }
      });
    }

    this.emptyNode(element);

    element.remove();
  }

  /**
   * Removes all the element's children and runs attached beforeUnsets() if needed.
   *
   * @param   {String/Element} nodeSelector - Element or a selector of node to empty
   * @returns void
   */
  emptyNode(nodeSelector) {
    const element = (nodeSelector instanceof Element)
      ? nodeSelector
      : document.querySelector(nodeSelector);

    if (!element) {
      error(this._errorMessage.NODE_NOT_FOUND, nodeSelector);
      return;
    }

    for (let i = 0; i < this._beforeUnsets.length; i++) {
      const object = element.querySelector(this._beforeUnsets[i].id);
      if (object) {
        this._beforeUnsets[i].beforeUnset(object);
        this._beforeUnsets.splice(i, 1);
        i--;
      }
    }

    while (element.lastElementChild) {
      element.removeChild(element.lastElementChild);
    }
  }
};
