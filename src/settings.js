import {Selector, Value, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';
import ModalWindow from './helpers/modal-window';

export default class Settings {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
    BADGE_WRAPPER_NOT_FOUND: "Badge wrapper '{0}' not found",
    FORM_NOT_FOUND: "Form '{0}' not found",
    FIELDS_VALUES_NOT_MATCHING: "Fields and values should match"
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
   * Setter for this._accounts
   */
  set accounts(accounts) {
    if (!(accounts instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.ACCOUNTS.ITEM.ID);
      return;
    }

    this._accounts = accounts;
  }

  /**
   * Setter for this._categories
   */
  set categories(categories) {
    if (!(categories instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.CATEGORIES.ITEM.ID);
      return;
    }

    this._categories = categories;
  }


  /**
   * Setter for this._counterparties
   */
  set counterparties(counterparties) {
    if (!(counterparties instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.COUNTERPARTIES.ITEM.ID);
      return;
    }

    this._counterparties = counterparties;
  }

  /**
   * Inserts account cards.
   *
   * @param {String/HTMLElement} wrapper – Selector or direct HTML Node where to insert
   *                                       account cards
   * @returns void
   */
  insertAccounts(wrapper) {
    const modal = new ModalWindow(this._composer);

    this._insertEntries({
      id: Selector.SETTINGS.ACCOUNTS.ID,
      wrapper,
      template: Selector.SETTINGS.ACCOUNTS.TEMPLATE,
      data: this._accounts,
      fields: [
        {
          key: 'key',
          cardSelector: Selector.SETTINGS.ACCOUNTS.CARD.KEY,
          fieldSelector: Selector.SETTINGS.ACCOUNTS.FORM.KEY.FIELD,
          validationContainerSelector: Selector.SETTINGS.ACCOUNTS.FORM.KEY.VALIDATION_CONTAINER,
          validationUnique: {
            data: this._accounts,
            callback: (value) => (account) => account.value.key === value
          }
        },
        {
          key: 'label',
          cardSelector: Selector.SETTINGS.ACCOUNTS.CARD.NAME,
          fieldSelector: Selector.SETTINGS.ACCOUNTS.FORM.NAME.FIELD,
          validationContainerSelector: Selector.SETTINGS.ACCOUNTS.FORM.NAME.VALIDATION_CONTAINER,
          validationCallback: modal.formField.validateNotEmpty(Copy.SETTINGS.ERROR.EMPTY_NAME)
        }
      ],
      deleteDialog: {
        prompt: Copy.MODAL.REMOVE_ACCOUNT.HEADER,
        acceptButtonCopy: Copy.MODAL.REMOVE_ACCOUNT.ACCEPT_BUTTON,
        declineButtonCopy: Copy.MODAL.REMOVE_ACCOUNT.DECLINE_BUTTON,
      },
      editDialog: {
        header: Copy.SETTINGS.ACCOUNT.EDIT,
        template: Selector.SETTINGS.ACCOUNTS.FORM.TEMPLATE,
        id: Selector.SETTINGS.ACCOUNTS.FORM.ID
      },
      badge: Selector.SETTINGS.BADGE.ACCOUNTS,
      addButton: Selector.SETTINGS.ACCOUNTS.ADD_BUTTON
    });
  }

  /**
   * Inserts category cards.
   *
   * @param {String/HTMLElement} wrapper – Selector or direct HTML Node where to insert
   *                                       category cards
   * @returns void
   */
  insertCategories(wrapper) {
    const modal = new ModalWindow(this._composer);

    this._insertEntries({
      id: Selector.SETTINGS.CATEGORIES.ID,
      wrapper,
      template: Selector.SETTINGS.CATEGORIES.TEMPLATE,
      data: this._categories,
      fields: [{
        cardSelector: Selector.SETTINGS.CATEGORIES.CARD.NAME,
        fieldSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD,
        validationContainerSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.VALIDATION_CONTAINER,
        validationUnique: {
          data: this._categories,
          callback: (value) => (account) => account.value === value
        }
      }],
      deleteDialog: {
        prompt: Copy.MODAL.REMOVE_CATEGORY.HEADER,
        acceptButtonCopy: Copy.MODAL.REMOVE_CATEGORY.ACCEPT_BUTTON,
        declineButtonCopy: Copy.MODAL.REMOVE_CATEGORY.DECLINE_BUTTON,
      },
      editDialog: {
        header: Copy.SETTINGS.CATEGORY.EDIT,
        template: Selector.SETTINGS.CATEGORIES.FORM.TEMPLATE,
        id: Selector.SETTINGS.CATEGORIES.FORM.ID
      },
      badge: Selector.SETTINGS.BADGE.CATEGORIES,
      addButton: Selector.SETTINGS.CATEGORIES.ADD_BUTTON
    });
  }

  /**
   * Inserts counterparty cards.
   *
   * @param {String/HTMLElement} wrapper – Selector or direct HTML Node where to insert
   *                                       counterparty cards
   * @returns void
   */
  insertCounterparties(wrapper) {
    const modal = new ModalWindow(this._composer);

    this._insertEntries({
      id: Selector.SETTINGS.COUNTERPARTIES.ID,
      wrapper,
      template: Selector.SETTINGS.COUNTERPARTIES.TEMPLATE,
      data: this._counterparties,
      fields: [
        {
          key: 'key',
          cardSelector: Selector.SETTINGS.COUNTERPARTIES.CARD.KEY,
          fieldSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.KEY.FIELD,
          validationContainerSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.KEY.VALIDATION_CONTAINER,
          validationUnique: {
            data: this._counterparties,
            callback: (value) => (counterparty) => counterparty.value.key === value
          }
        },
        {
          key: 'category',
          cardSelector: Selector.SETTINGS.COUNTERPARTIES.CARD.CATEGORY,
          fieldSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.CATEGORY.FIELD,
          validationContainerSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.CATEGORY.VALIDATION_CONTAINER,
          validationCallback: modal.formField.validateNotEmpty(Copy.SETTINGS.ERROR.EMPTY_CATEGORY),
          datalistSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.CATEGORY.LIST,
          datalist: this._categories.get()
        },
        {
          key: 'label',
          cardSelector: Selector.SETTINGS.COUNTERPARTIES.CARD.NAME,
          fieldSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.NAME.FIELD,
          validationContainerSelector: Selector.SETTINGS.COUNTERPARTIES.FORM.NAME.VALIDATION_CONTAINER,
          validationCallback: modal.formField.validateNotEmpty(Copy.SETTINGS.ERROR.EMPTY_NAME)
        }
      ],
      deleteDialog: {
        prompt: Copy.MODAL.REMOVE_COUNTERPARTY.HEADER,
        acceptButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.ACCEPT_BUTTON,
        declineButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.DECLINE_BUTTON
      },
      editDialog: {
        header: Copy.SETTINGS.COUNTERPARTY.EDIT,
        template: Selector.SETTINGS.COUNTERPARTIES.FORM.TEMPLATE,
        id: Selector.SETTINGS.COUNTERPARTIES.FORM.ID
      },
      badge: Selector.SETTINGS.BADGE.COUNTERPARTIES,
      addButton: Selector.SETTINGS.COUNTERPARTIES.ADD_BUTTON
    });
  }

  /**
   * Private universal method for inserting a list of entries.
   *
   * @param {String}             options.id           - Assigned id of the contatining element for the entries list
   * @param {String/HTMLElement} options.wrapper      - Selector or direct HTML Node where to insert entries list
   * @param {String}             options.template     - Id of the list wrapper template
   * @param {Data}               options.data         - Data object of entries
   * @param {Array}              options.fields       - Array of fields settings. Each element is an object with
   *                                                    the following settings: key, cardSelector, fieldSelector
   *                                                    validationContainerSelector (optional), validationCallback
   *                                                    (optional), validationUnique (if set, validationCallback is
   *                                                    ignored), datalistSelector (optional), datalist (optional)
   * @param {Object}             options.deleteDialog - Settings object (prompt, acceptButtonCopy, declineButtonCopy)
   * @param {Object}             options.editDialog   - Settings object (header, template, id)
   * @param {String}             options.badge        - Selector of the badge element (optional)
   * @param {String}             options.addButton    - Selector of the add button element
   */
  _insertEntries({id, wrapper, template, data, fields, deleteDialog, editDialog, badge, addButton: addButtonSelector}) {
    this._composer.composeNode({
      id,
      wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      afterInsert: () => {
        const entries = data.get(true);

        entries.forEach((entry) => {
          this._insertCard({
            ...entry,
            wrapper: id,
            template,
            fields,
            deleteDialog,
            editDialog,
            data,
            badge
          });
        });

        this._setCounterBadge(badge, entries.length);

        const addButton = document.querySelector(addButtonSelector);
        if (!addButton) {
          return;
        }

        addButton.onclick = (evt) => {
          const modal = new ModalWindow(this._composer);

          modal.showForm({
            header: editDialog.header,
            template: editDialog.template,
            fields: fields.map((field) => {
              if (field.validationUnique) {
                field.validationCallback = modal.formField.validateUniqueData(
                  field.validationUnique.data,
                  field.validationUnique.callback,
                  '0',
                  Copy.SETTINGS.ERROR.EXISTING_KEY
                );
              }
              return field;
            }),
            acceptCallback: (evt) => {
              evt.preventDefault();

              const addForm = document.querySelector(editDialog.id);
              if (!addForm) {
                error(this._errorMessage.FORM_NOT_FOUND, editDialog.id);
                return;
              }

              const changeEvent = new Event('change');

              fields.forEach((field) => {
                const formField = addForm.querySelector(field.fieldSelector);
                if (formField) {
                  formField.dispatchEvent(changeEvent);
                }
              });

              if (addForm.reportValidity() === false) {
                return;
              }

              const addFormData = new FormData(addForm);
              const formValues = Object.fromEntries(addFormData);

              let entity = {};

              fields.forEach((field, i) => {
                const formValue = formValues[field.fieldSelector.replace(/^(\#)/s, '')];
                if (field.key) {
                  entity[field.key] = formValue;
                } else {
                  entity = formValue;
                }
                fields[i].fieldValue = formValue;
              });

              const itemId = data.add(entity);

              this._insertCard({
                id: itemId,
                value: entity,
                wrapper: id,
                template,
                fields,
                deleteDialog,
                editDialog,
                data,
                badge
              });

              this._setCounterBadge(badge, data.get().length);
              modal.hideModal();
            },
            declineCallback: () => {
              modal.hideModal();
            }
          })
        }

      },
      beforeUnset: (element) => {
        const addButton = element.querySelector(addButtonSelector);
        if (addButton) {
          addButton.onclick = undefined;
        }
      },
      incremental: false
    });
  }


  /**
   * Private universal method for inserting a card enty.
   *
   * @param {String}             options.id           - Assigned id of the card
   * @param {String/Object}      options.value        - Value of the entity (can be an object)
   * @param {String/HTMLElement} options.wrapper      - Selector or direct HTML Node where to insert the card
   * @param {String}             options.template     - Id of the card template
   * @param {Data}               options.data         - Data object of entries
   * @param {Array}              options.fields       - Array of fields settings. Each element is an object with
   *                                                    the following settings: key, cardSelector, fieldSelector
   *                                                    validationContainerSelector (optional), validationCallback
   *                                                    (optional), validationUnique (if set, validationCallback is
   *                                                    ignored), datalistSelector (optional), datalist (optional)
   * @param {Object}             options.deleteDialog - Settings object (prompt, acceptButtonCopy, declineButtonCopy)
   * @param {Object}             options.editDialog   - Settings object (header, template, id)
   * @param {String}             options.badge        - Selector of the badge element (optional)
   */
  _insertCard({id, value, wrapper, template, fields, deleteDialog, editDialog, data, badge}) {
    const modal = new ModalWindow(this._composer);

    const cardValues = fields.map((field) => {
      return {
        wrapper: field.cardSelector,
        innerText: (field.key) ? value[field.key] : value
      }
    });

    const fieldValues = fields.map((field) => {
      const fieldValue =  (field.key) ? value[field.key] : value;

      if (field.validationUnique) {
        field.validationCallback = modal.formField.validateUniqueData(
          field.validationUnique.data,
          field.validationUnique.callback,
          id,
          Copy.SETTINGS.ERROR.EXISTING_KEY
        );
      }

      return {
        ...field,
        fieldValue
      }
    });

    this._composer.composeNode({
      id,
      wrapper,
      template,
      values: cardValues,
      afterInsert: (element) => {
        const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
        deleteButton.onclick = () => {
          modal.showConfirmationModal({
            ...deleteDialog,
            acceptCallback: () => {
              this._composer.removeNode(id);
              data.remove(id);

              modal.hideModal();

              this._setCounterBadge(badge, data.get().length);
            },
            declineCallback: () => {
              modal.hideModal();
            }
          });
        }

        const editButton = element.querySelector(Selector.SETTINGS.LIST.EDIT_BUTTON);
        editButton.onclick = () => {
          modal.showForm({
            header: editDialog.header,
            template: editDialog.template,
            fields: fieldValues,
            acceptCallback: (evt) => {
              evt.preventDefault();

              const editForm = document.querySelector(editDialog.id);
              if (!editForm) {
                error(this._errorMessage.FORM_NOT_FOUND, editDialog.id);
                return;
              }

              const changeEvent = new Event('change');

              fields.forEach((field) => {
                const formField = editForm.querySelector(field.fieldSelector);
                if (formField) {
                  formField.dispatchEvent(changeEvent);
                }
              });

              if (editForm.reportValidity() === false) {
                return;
              }

              const editFormData = new FormData(editForm);
              const formValues = Object.fromEntries(editFormData);

              let entity = {};

              fieldValues.forEach((field, i) => {
                const formValue = formValues[field.fieldSelector.replace(/^(\#)/s, '')];
                if (field.key) {
                  entity[field.key] = formValue;
                } else {
                  entity = formValue;
                }
                fieldValues[i].fieldValue = formValue;
              });

              data.update(id, entity);

              const entityCard = document.querySelector(id);
              fieldValues.forEach((field) => {
                const cardField = entityCard.querySelector(field.cardSelector);
                cardField.innerText = field.fieldValue;
              });

              modal.hideModal();

            },
            declineCallback: () => {
              modal.hideModal();
            }
          })
        }
      },
      beforeUnset: (element) => {

        const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
        deleteButton.onclick = undefined;

        const editButton = element.querySelector(Selector.SETTINGS.LIST.EDIT_BUTTON);
        editButton.onclick = undefined;
      }
    });
  }

  /**
   * Inserts a badge with counter into weapper
   *
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will contain badge
   * @param  {Number}         count   - Number in the badge. If 0 or less, the badge
   *                                    is not shown
   * @returns void
   */
  _setCounterBadge(wrapper, count) {
    if (!document.querySelector(wrapper)) {
      error(this._errorMessage.BADGE_WRAPPER_NOT_FOUND, wrapper);
      return;
    }

    if (count > 0) {
      this._composer.composeNode({
        wrapper: wrapper,
        template: Selector.SETTINGS.BADGE.TEMPLATE,
        values: [{
          wrapper: Selector.SETTINGS.BADGE.COUNT,
          innerText: count
        }],
        incremental: false
      });
    } else {
      this._composer.emptyNode(wrapper);
    }
  }
}
