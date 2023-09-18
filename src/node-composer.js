export default class NodeComposer {

  static ERROR_MODE = 2;
  static LOG_MODE = 1;
  static SILENT_MODE = 0;

  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with this._error().
   */
  _errorMessage = {
    INVALID_NODE: "Passed scope parameter for query '{0}' is not a valid DOM node",
    INVALID_WRAPPER: "Passed wrapper element is not a valid DOM node",
    INVALID_VOCAL_MODE: "Invalid vocal mode",
    NODE_NOT_FOUND: "No elements with selector '{0}' were found in the scope",
    TEMPLATE_NOT_FOUND: "Template '{0}' was not found in the page document",
    UNDEFINED_WRAPPER: "Wrapper is undefined",
    UNDEFINED_TEMPLATE: "Template is underfined",
    INVALID_VALUES: "Invalid values for template '{0}'",
    INVALID_CHILDREN: "Invalid children for template '{0}'",
    NODE_ID_REQUIRED: "Id is required if `beforeUnset` is set",
    NOT_A_FUNCTION: "'{0}' is not a valid function"
  }

  /**
   * Node types accepted for template insertion.
   */
  _acceptedNodeTypes = [
    Node.ELEMENT_NODE,
    Node.DOCUMENT_FRAGMENT_NODE
  ]

  /**
   * Array for functions to be triggered while unsetting the element
   */
  _beforeUnsets = []

  /**
   * Class constructor.
   *
   * @param {Number} vocalMode  NodeComposer.ERROR_MODE, NodeComposer.LOG_MODE,
   *                            or NodeComposer.SILENT_MODE
   */
  constructor(vocalMode) {
    if (![NodeComposer.ERROR_MODE, NodeComposer.LOG_MODE, NodeComposer.SILENT_MODE].includes(vocalMode)) {
      console.error(this._errorMessage.INVALID_VOCAL_MODE);
      return;
    }

    this._vocalMode = vocalMode;
  }

  /**
   * Error reporting with a formatted message. Based on this._vocalMode, raises
   * error in the console, log message or remains silent. Used for cleaner code
   * with values from this._errorMessage.
   *
   * Example: this._error(this._errorMessage.INVALID_NODE, '.wrong-selector');
   *
   * @param {String} str  Original string with {0}, {1} and etc. values which
   *                      will be replaced by further passed arguments.
   * @param {String} arguments...
   * @returns
   */
  _error(message, ...args) {
    if (this._vocalMode === this.SILENT_MODE) {
      return;
    }

    const formattedMessage = message.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });

    if (this._vocalMode === this.LOG_MODE) {
      console.log(formattedMessage);
    } else {
      console.error(formattedMessage);
    }
  }

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
   * console based on this._vocaleMode value. Second parameter is a search scope.
   * If not passed, document is used.
   *
   * @param {string}      selector  HTML Selector string
   * @param {HTMLElement} domain    HTML node for search scope (optional)
   * @returns {HTMLElement}
   */
  _getNode(selector, domain) {
    if (typeof domain === 'undefined') {
      domain = document;
    } else if (!this._isCorrectNode(domain)) {
      this._error(this._errorMessage.INVALID_NODE, selector);
      return;
    }

    const node = domain.querySelector(selector);

    if (!node) {
      this._error(this._errorMessage.NODE_NOT_FOUND, selector);
    }

    return node;
  }

  /**
   * Searches for template element and clones to a new one. If template is not
   * found, raises an error in the console based on this._vocalMode.
   *
   * @param   {string}      selector  HTML Selector string
   * @param   {HTMLElement} domain    HTML node for search scope (optional)
   * @returns {HTMLElement}
   */
  _getNodeFromTemplate(selector) {
    const template = document.querySelector(selector);

    if (!template) {
      this._error(this._errorMessage.TEMPLATE_NOT_FOUND, selector);
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
   * compose.Node({
   *  wrapper: 'body',
   *  template: '#template1',
   *  values: [
   *      {
   *        wrapper: '.value-tag',
   *        innerHTML: 'Example <b>HTML</b>' // OR innerText: 'Example text'
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
   * @param  {String}      options.wrapper      Wrapper element selector
   * @param  {String}      options.template     Template element selector
   * @param  {Array}       options.values       Array of values to insert (optional)
   * @param  {Array}       options.children     Array of children to insert (optional)
   * @param  {HTMLElement} options.domain       Scope for selecting wrapper element (optional)
   * @param  {Function}    options.afterInsert  Function to be triggered after element
   *                                            is placed (optional)
   * @param  {Function}    options.beforeUnset  Function to be triggered after element
   *                                            is placed (optional)
   * @param  {String}      options.id           Id for the element. Required if beforeUnset
   *                                            is set, otherwise optional
   * @param  {Boolean}     option.incremental   Default is true. If set to false, wrapper is
   *                                            cleared before inserting new nodes
   * @return void
   */
  composeNode({
    id,
    wrapper: wrapperSelector,
    template: templateSelector,
    values,
    children,
    domain,
    afterInsert,
    beforeUnset,
    incremental
  }) {
    if (!wrapperSelector) {
      this._error(wrapperSelector)
    }

    if (domain && !this._isCorrectNode(domain)) {
      this._error(this._errorMessage.INVALID_NODE, wrapperSelector);
      return;
    } else {
      const domain = document;
    }
    const wrapper = this._getNode(wrapperSelector, domain);

    if (!templateSelector) {
      this._error(wrapperSelector)
    }
    const template = this._getNodeFromTemplate(templateSelector);

    if (afterInsert && typeof afterInsert !== 'function') {
      this._error(this._errorMessage.NOT_A_FUNCTION, 'afterInsert()');
      return;
    }

    if (beforeUnset) {
      if (typeof beforeUnset !== 'function') {
        this._error(this._errorMessage.NOT_A_FUNCTION, 'beforeUnset()');
        return;
      }

      if (!id) {
        this._error(this._errorMessage.NODE_ID_REQUIRED);
        return;
      }
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(template);

    const element = fragment.querySelector('*');

    if (values) {
      if (!Array.isArray(values)) {
        this._error(this._errorMessage.INVALID_VALUES, templateSelector);
        return;
      }

      values.forEach((value) => {
        if (!value.wrapper) {
          this._error(this._errorMessage.INVALID_WRAPPER);
          return;
        }

        const element = this._getNode(value.wrapper, fragment);

        if (value.innerHTML) {
          element.innerHTML = value.innerHTML;
        } else if (value.innerText) {
          element.innerText = value.innerText;
        }
      });
    }

    if (children) {
      if (!Array.isArray(children)) {
        this._error(this._errorMessage.INVALID_CHILDREN, templateSelector);
        return;
      }

      children.forEach((child) => {
        if (!child.domain) {
          child = {...child, domain: fragment};
        }

        this.composeNode(child)
      });
    }

    if (id) {
      element.id = id;

      if (beforeUnset) {
        this._beforeUnsets.push({id, beforeUnset })
      }
    }

    if (incremental === false) {
      this._beforeUnsets.forEach(({id:objectId, beforeUnset}) => {
        const childObject = wrapper.querySelector('#' + objectId);
        if (childObject) {
          beforeUnset(childObject);
        }
      });

      while (wrapper.firstChild) {
        wrapper.firstChild.remove();
      }
    }

    wrapper.appendChild(fragment);

    if (afterInsert) {
      afterInsert(element);
    }
  }

  /**
   * Removes previously inserted node and triggers beforeUnset() function if it
   * was defined
   *
   * @param  {String}  id  Id of the node to remove (without '#')
   * @return void
   */
  removeNode(id) {
    const element = document.querySelector('#' + id);

    if (!element) {
      this._error(this._errorMessage.NODE_NOT_FOUND, '#' + id);
      return;
    }

    this._beforeUnsets.forEach(({id:objectId, beforeUnset}) => {
      if (objectId === id) {
        beforeUnset(element)
        return;
      }

      const object = element.querySelector('#' + objectId);
      if (object) {
        beforeUnset(object);
      }
    });

    element.remove();
  }
};
