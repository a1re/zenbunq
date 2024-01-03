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
    BADGE_WRAPPER_NOT_FOUND: "Badge wrapper count for '{0}' not found",
    BADGE_NOT_FOUND: "Badge count for '{0}' not found",
    CATEGORY_FORM_NOT_FOUND: "Category form not found",
    ACCOUNT_FORM_NOT_FOUND: "Account form not found",
    COUNTERPARTY_FORM_NOT_FOUND: "Counterparty form not found"
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
   * Inserts the list of account cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of accounts
   * @returns @void
   */
  insertAccounts(wrapper) {
    const modal = new ModalWindow(this._composer);
    const accounts = this._accounts.get(true).map((account) => {
      return {
        id: account.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.ACCOUNTS.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.ACCOUNTS.CARD.KEY,
            innerText: account.value.key
          },
          {
            wrapper: Selector.SETTINGS.ACCOUNTS.CARD.NAME,
            innerText: account.value.label
          }
        ],
        afterInsert: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = () => {
            modal.showConfirmationModal({
              prompt: Copy.MODAL.REMOVE_ACCOUNT.HEADER,
              acceptButtonCopy: Copy.MODAL.REMOVE_ACCOUNT.ACCEPT_BUTTON,
              declineButtonCopy: Copy.MODAL.REMOVE_ACCOUNT.DECLINE_BUTTON,
              acceptCallback: () => {
                this._composer.removeNode(account.id);
                this._accounts.remove(account.id);

                modal.hideModal();

                const header = document.querySelector(Selector.SETTINGS.BADGE.ACCOUNTS);
                if (!header) {
                  error(this._errorMessage.BADGE_WRAPPER_NOT_FOUND, 'accounts');
                  return;
                }

                const amountBadge = header.querySelector(Selector.SETTINGS.BADGE.COUNT);
                if (!amountBadge) {
                  error(this._errorMessage.BADGE_NOT_FOUND, 'accounts');
                  return;
                }

                const accountCount = parseInt(amountBadge.innerText, 10);
                this._setCounterBadge(Selector.SETTINGS.BADGE.ACCOUNTS, accountCount - 1);
              },
              declineCallback: () => {
                modal.hideModal();
              }
            });
          }
        },
        beforeUnset: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = undefined;
        }
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.ACCOUNTS.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: accounts,
      incremental: false
    });

    this._setCounterBadge(Selector.SETTINGS.BADGE.ACCOUNTS, accounts.length);
  }

  /**
   * Inserts the list of account cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of accounts
   * @returns void
   */
  insertCategories(wrapper) {
    this._composer.composeNode({
      id: Selector.SETTINGS.CATEGORIES.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      incremental: false
    });

    const categories = this._categories.get(true).map((category) => {
      this._addCategoryCard(category.id, category.value);
    });

    const addCategoryButton = document.querySelector(Selector.SETTINGS.CATEGORIES.ADD_BUTTON);
    if (addCategoryButton) {
      const modal = new ModalWindow(this._composer);

      addCategoryButton.onclick = () => {
        modal.showForm({
          header: Copy.SETTINGS.CATEGORY.EDIT,
          template: Selector.SETTINGS.CATEGORIES.FORM.TEMPLATE,
          fields: [
            {
              fieldSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD,
              validationContainerSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.VALIDATION_CONTAINER,
              fieldValue: '',
              validationCallback: modal.formField.validateNotInList(
                this._categories.get(),
                Copy.SETTINGS.ERROR.EXISTING_NAME
              )
            },
          ],
          acceptCallback: (evt) => {
            evt.preventDefault();

            const categoryEditForm = document.querySelector(Selector.SETTINGS.CATEGORIES.FORM.ID);
            if (!categoryEditForm) {
              error(this._errorMessage.CATEGORY_FORM_NOT_FOUND);
              return;
            }

            const changeEvent = new Event('change');

            const fields = [
              categoryEditForm.querySelector(Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD)
            ];

            fields.forEach((field) => {
              field.dispatchEvent(changeEvent);
            });

            if (categoryEditForm.reportValidity() === false) {
              return;
            }

            const categoryEditFormData = new FormData(categoryEditForm);
            const formValues = Object.fromEntries(categoryEditFormData);

            const newCategoryValue = formValues[Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD.replace(/^(\#)/s, '')];

            const categoryId = this._categories.add(newCategoryValue);

            this._addCategoryCard(categoryId, newCategoryValue);
            this._setCounterBadge(Selector.SETTINGS.BADGE.CATEGORIES, this._categories.get().length);
            modal.hideModal();
          },
          declineCallback: () => {
            modal.hideModal();
          }
        })
      }
    }

    this._setCounterBadge(Selector.SETTINGS.BADGE.CATEGORIES, categories.length);
  }

  /**
   * Private method of inserting a category card in the list.
   * 
   * @param   {String} categoryId     - Category id
   * @param   {String} categoryValue  - Name of the category
   * @returns void
   */
  _addCategoryCard(categoryId, categoryValue) {
    const modal = new ModalWindow(this._composer);
    this._composer.composeNode({
      id: categoryId,
      wrapper: Selector.SETTINGS.LIST.WRAPPER,
      template: Selector.SETTINGS.CATEGORIES.TEMPLATE,
      values: [
        {
          wrapper: Selector.SETTINGS.CATEGORIES.CARD.NAME,
          innerText: categoryValue
        }
      ],
      afterInsert: (element) => {
        const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
        deleteButton.onclick = () => {
          modal.showConfirmationModal({
            prompt: Copy.MODAL.REMOVE_CATEGORY.HEADER,
            acceptButtonCopy: Copy.MODAL.REMOVE_CATEGORY.ACCEPT_BUTTON,
            declineButtonCopy: Copy.MODAL.REMOVE_CATEGORY.DECLINE_BUTTON,
            acceptCallback: () => {
              this._composer.removeNode(categoryId);
              this._categories.remove(categoryId);

              modal.hideModal();

              const header = document.querySelector(Selector.SETTINGS.BADGE.CATEGORIES);
              if (!header) {
                error(this._errorMessage.BADGE_WRAPPER_NOT_FOUND, 'categories');
                return;
              }

              const amountBadge = header.querySelector(Selector.SETTINGS.BADGE.COUNT);
              if (!amountBadge) {
                error(this._errorMessage.BADGE_NOT_FOUND, 'categories');
                return;
              }

              const categoryCount = parseInt(amountBadge.innerText, 10);
              this._setCounterBadge(Selector.SETTINGS.BADGE.CATEGORIES, categoryCount - 1);
            },
            declineCallback: () => {
              modal.hideModal();
            }
          });
        }
        const editButton = element.querySelector(Selector.SETTINGS.LIST.EDIT_BUTTON);
        editButton.onclick = () => {
          modal.showForm({
            header: Copy.SETTINGS.CATEGORY.EDIT,
            template: Selector.SETTINGS.CATEGORIES.FORM.TEMPLATE,
            fields: [
              {
                fieldSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD,
                validationContainerSelector: Selector.SETTINGS.CATEGORIES.FORM.NAME.VALIDATION_CONTAINER,
                fieldValue: categoryValue,
                validationCallback: modal.formField.validateNotInList(
                  this._categories.get(),
                  Copy.SETTINGS.ERROR.EXISTING_NAME
                )
              },

            ],
            acceptCallback: (evt) => {
              evt.preventDefault();

              const categoryEditForm = document.querySelector(Selector.SETTINGS.CATEGORIES.FORM.ID);
              if (!categoryEditForm) {
                error(this._errorMessage.CATEGORY_FORM_NOT_FOUND);
                return;
              }

              const changeEvent = new Event('change');

              const fields = [
                categoryEditForm.querySelector(Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD)
              ];

              fields.forEach((field) => {
                field.dispatchEvent(changeEvent);
              });

              if (categoryEditForm.reportValidity() === false) {
                return;
              }

              const categoryEditFormData = new FormData(categoryEditForm);
              const formValues = Object.fromEntries(categoryEditFormData);

              const newCategoryValue = formValues[Selector.SETTINGS.CATEGORIES.FORM.NAME.FIELD.replace(/^(\#)/s, '')];
              this._categories.update(categoryId, newCategoryValue);

              const categoryCard = document.querySelector(categoryId);
              const categoryWrapper = categoryCard.querySelector(Selector.SETTINGS.CATEGORIES.CARD.NAME);
              categoryWrapper.innerText = newCategoryValue;
              
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
        if (deleteButton) {
          deleteButton.onclick = undefined;
        }

        const editButton = element.querySelector(Selector.SETTINGS.LIST.EDIT_BUTTON);
        if (editButton) {
          editButton.onclick = undefined;
        }
      }
    })
  }

  /**
   * Inserts the list of counterparty cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of counterparties
   * @returns @void
   */
  insertCounterparties(wrapper) {
    const modal = new ModalWindow(this._composer);
    const counterparties = this._counterparties.get(true).map((counterparty) => {
      return {
        id: counterparty.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.COUNTERPARTIES.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.CATEGORY,
            innerText: counterparty.value.category
          },
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.KEY,
            innerText: counterparty.value.key
          },
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.NAME,
            innerText: counterparty.value.label
          }
        ],
        afterInsert: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = () => {
            modal.showConfirmationModal({
              prompt: Copy.MODAL.REMOVE_COUNTERPARTY.HEADER,
              acceptButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.ACCEPT_BUTTON,
              declineButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.DECLINE_BUTTON,
              acceptCallback: () => {
                this._composer.removeNode(counterparty.id);
                this._counterparties.remove(counterparty.id);

                modal.hideModal();

                const header = document.querySelector(Selector.SETTINGS.BADGE.COUNTERPARTIES);
                if (!header) {
                  error(this._errorMessage.BADGE_WRAPPER_NOT_FOUND, 'counterparties');
                  return;
                }

                const amountBadge = header.querySelector(Selector.SETTINGS.BADGE.COUNT);
                if (!amountBadge) {
                  error(this._errorMessage.BADGE_NOT_FOUND, 'counterparties');
                  return;
                }

                const counterpartyCount = parseInt(amountBadge.innerText, 10);
                this._setCounterBadge(Selector.SETTINGS.BADGE.COUNTERPARTIES, counterpartyCount - 1);
              },
              declineCallback: () => {
                modal.hideModal();
              }
            });
          }
        },
        beforeUnset: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = undefined;
        }
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.COUNTERPARTIES.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: counterparties,
      incremental: false
    });

    this._setCounterBadge(Selector.SETTINGS.BADGE.COUNTERPARTIES, counterparties.length);
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