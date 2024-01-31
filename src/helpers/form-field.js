import {Selector, Value} from '../const';
import NodeComposer from '../node-composer';
import error from './error';

export default class FormField {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    FIELD_NOT_FOUND: "Field '{0}' is not found",
    INCORRECT_SCOPE: "Incorrect scope for querying elements",
    VALIDATION_CONTAINER_NOT_FOUND: "Validation container for the field is not found",
  }

  /**
   * Class constructor. Needs an instance of NodeComposer to be initialized.
   *
   * @param   {NodeComposer} composer  - Instance of NodeComposer for the page
   * @returns void
   */
  constructor(composer) {
    if (!(composer instanceof NodeComposer)) {
      error(this._errorMessage.INVALID_COMPOSER);
      return;
    }

    this._composer = composer;
  }

  /**
   * Sets up a form field with a value and validation callback
   *
   * @param   {String} options.fieldSelector               - DOM Selector of the field
   * @param   {*}      options.fieldValue                  - Default value (optional)
   * @param   {String} options.validationContainerSelector - DOM Selector of the validation container
   *                                                         (required if validationCallback is set)
   * @param   {Function} options.validationCallback        - Callback that will be called for validation as
   *                                                         'onchange' event with evt.target as a first
   *                                                         parameter, fieldSelector as a second parameter, and
   *                                                         validationContainerSelector as a third parameter
   *                                                         (if set, validationContainerSelector is required)
   * @param   {Array}    options.datalistSelector          - DOM Selector of the options for the field (optional)
   * @param   {Array}    options.datalist                  - List of options for the field (if set,
   *                                                         datalistSelector is required)
   * @param   {HTMLNode} options.scope                     - Scope for elements operations (optional)
   * @returns void
   */
  set(options) {
    const scope = options.scope || document;
    const field = scope.querySelector(options.fieldSelector);

    if (!field) {
      error(this._errorMessage.FIELD_NOT_FOUND, options.fieldSelector);
      return;
    }

    if (options.fieldValue) {
      field.value = options.fieldValue;
    }

    if (options.datalistSelector && options.datalist) {
      options.datalist.forEach((datalistOption) => {
        this._composer.composeNode({
          wrapper: options.datalistSelector,
          template: Selector.TRANSACTION_EDIT_FORM.DATALIST.TEMPLATE,
          values: [{
            wrapper: Selector.TRANSACTION_EDIT_FORM.DATALIST.WRAPPER,
            attributes: [{
              name: 'value',
              value: datalistOption
            }]
          }]
        })
      });
    }

    if (options.validationContainerSelector && typeof options.validationCallback === "function") {
      const validationContainer = scope.querySelector(options.validationContainerSelector);
      field.onchange = () => {
        options.validationCallback(field, validationContainer);
      }
      field.onkeyup = field.onchange;
    }
  }

  /**
   * Unnregisters onChange listeners for the field(s).
   *
   * @param   {element} scope       - Node in the document tree that is parent
   *                                  to the elements defined as selectors
   * @param   {String} ...selectors - Selector(s) of the field(s) to unset
   * @returns void
   */
  unset(scope, ...selectors) {
    if (!(scope instanceof Element)) {
      error(this._errorMessage.INCORRECT_SCOPE);
      return;
    }

    selectors.forEach((selector) => {
      const field = scope.querySelector(selector);
      if (field) {
        field.onchange = null;
      }
    });
  }

  /**
   * Shows validation message for the field.
   *
   * @param   {Element} field              - Node element of the input/select field
   * @param   {String} validationContainer - Node element of the validation message containter
   * @param   {String} message             - Message to show in the containter
   * @returns void
   */
  showValidationMessage(field, validationContainer, message) {
    if (!validationContainer) {
      error(this._errorMessage.VALIDATION_CONTAINER_NOT_FOUND);
      return;
    }

    this._composer.composeNode({
      wrapper: validationContainer,
      template: Selector.MESSAGE.ERROR.TEMPLATE,
      values: [{
        wrapper: Selector.MESSAGE.CONTENT.WRAPPER,
        innerText: message
      }],
      incremental: false
    });

    field.classList.add(Value.FORM_INPUT_ERROR_CLASS);
    field.setCustomValidity(message);
  }

  /**
   * Hides the validation message for the field.
   *
   * @param   {Element} field              - Node element of the input/select field
   * @param   {String} validationContainer - Node element of the validation message containter
   * @returns void
   */
  hideValidationMessage(field, validationContainer) {
    field.setCustomValidity('');
    field.classList.remove(Value.FORM_INPUT_ERROR_CLASS);
    this._composer.emptyNode(validationContainer)
  }

  /**
   * Creates a callback for date validation.
   *
   * @param   {String} message  - Validation message
   * @returns {Function}        - Validation callback, that accepsts field (Element)
   *                              and validationContainer (Element) as parameters
   */
  validateDate(message) {
    return (field, validationContainer) => {
      if (!field.valueAsDate || isNaN(field.valueAsDate.getTime())) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      const today = Math.round(Date.now() / 1000);
      const transactionDate = Math.round(
        field.valueAsDate.getTime() / 1000 + field.valueAsDate.getTimezoneOffset() * 60
      );

      if (today < transactionDate) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates a callback for the amount (number > 0) validation.
   *
   * @param   {String} message  - Validation message
   * @returns {Function}        - Validation callback, that accepsts field (Element)
   *                              and validationContainer (Element) as parameters
   */
  validateAmount(message) {
    return (field, validationContainer) => {
      if (isNaN(field.value) || field.value <= 0) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates a callback for "Not empty" validation
   *
   * @param   {String} message  - Validation message
   * @returns {Function}        - Validation callback, that accepsts field (Element)
   *                              and validationContainer (Element) as parameters
   */
  validateNotEmpty(message) {
    return (field, validationContainer) => {
      if (field.value.length === 0) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates a callback for "Not in list" validation method for a field.
   *
   * @param   {Array} list      - List of items to check uniqness
   * @param   {String} message  - Validation message
   * @returns {Function}        - Validation callback, that accepsts field (Element)
   *                              and validationContainer (Element) as parameters
   */
  validateNotInList(list, message) {
    return (field, validationContainer) => {
      const inList = list.find((item) => item === field.value);
      if (field.value.length === 0 || inList) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates a callback for "Not in list" validation method for a field.
   *
   * @param   {Data} data                   - Data object fot validation
   * @param   {Function} validationCallback - Callback for validation
   * @param   {String} excludeId            - Id of the record that should not be taken into account
   * @param   {String} message              - Validation message
   * @returns {Function}                    - Validation callback, that accepsts field (Element)
   *                                          and validationContainer (Element) as parameters
   */
  validateUniqueData(data, validationCallback, excludeId, message) {
    return (field, validationContainer) => {
      const inList = data
        .get(true)
        .filter((item) => item.id !== excludeId)
        .find(validationCallback(field.value));
      if (field.value.length === 0 || inList) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates "Not empty" validation metod with a dependancy on another field
   * (at least one of the fields shouldn't be empty).
   *
   * @param   {String} otherFieldSelector               - Node element of the dependant field
   * @param   {String} otherValidationContainerSelector - Node element of the dependant field's
   *                                                      validation container
   * @returns {Function}        - Validation callback, that accepsts field (Element)
   *                              and validationContainer (Element) as parameters
   */
  validateOneNotEmpty(otherFieldSelector, otherValidationContainerSelector, message) {
    return (field, validationContainer) => {
      const otherField = document.querySelector(otherFieldSelector);
      if (!otherField) {
        error(this._errorMessage.FIELD_NOT_FOUND, otherFieldSelector);
        return
      }

      const otherValidationContainer = document.querySelector(otherValidationContainerSelector);
      if (!otherValidationContainer) {
        error(this._errorMessage.VALIDATION_CONTAINER_NOT_FOUND);
        return
      }

      const otherFieldLength = (otherField instanceof Element) ? otherField.value.length : 0;
      if (field.value.length === 0 && otherFieldLength === 0) {
        this.showValidationMessage(
          field,
          validationContainer,
          message
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
      this.hideValidationMessage(otherField, otherValidationContainer);
    }
  }
}