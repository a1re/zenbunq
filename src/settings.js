import {Selector, Value, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';

export default class Settings {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
    BADGE_WRAPPER_NOT_FOUND: "Badge wrapper count for '{0}' not found",
    BADGE_NOT_FOUND: "Badge count for '{0}' not found"
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
            this.showConfirmationModal(
              Copy.MODAL.REMOVE_ACCOUNT.HEADER,
              Copy.MODAL.REMOVE_ACCOUNT.ACCEPT_BUTTON,
              Copy.MODAL.REMOVE_ACCOUNT.DECLINE_BUTTON,
              () => {
                this._composer.removeNode(account.id);
                this._accounts.remove(account.id);

                this.hideModal();

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
              () => {
                this.hideModal();
              }
            );
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
    const categories = this._categories.get(true).map((category) => {
      return {
        id: category.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.CATEGORIES.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.CATEGORIES.CARD.NAME,
            innerText: category.value
          }
        ],
        afterInsert: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = () => {
            this.showConfirmationModal(
              Copy.MODAL.REMOVE_CATEGORY.HEADER,
              Copy.MODAL.REMOVE_CATEGORY.ACCEPT_BUTTON,
              Copy.MODAL.REMOVE_CATEGORY.DECLINE_BUTTON,
              () => {
                this._composer.removeNode(category.id);
                this._categories.remove(category.id);

                this.hideModal();

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
              () => {
                this.hideModal();
              }
            );
          }
        },
        beforeUnset: (element) => {
          const deleteButton = element.querySelector(Selector.SETTINGS.LIST.DELETE_BUTTON);
          deleteButton.onclick = undefined;
        }
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.CATEGORIES.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: categories,
      incremental: false
    });

    this._setCounterBadge(Selector.SETTINGS.BADGE.CATEGORIES, categories.length);
  }

  /**
   * Inserts the list of counterparty cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of counterparties
   * @returns @void
   */
  insertCounterparties(wrapper) {
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
            this.showConfirmationModal(
              Copy.MODAL.REMOVE_COUNTERPARTY.HEADER,
              Copy.MODAL.REMOVE_COUNTERPARTY.ACCEPT_BUTTON,
              Copy.MODAL.REMOVE_COUNTERPARTY.DECLINE_BUTTON,
              () => {
                this._composer.removeNode(counterparty.id);
                this._counterparties.remove(counterparty.id);

                this.hideModal();

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
              () => {
                this.hideModal();
              }
            );
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
   * Shows a confirmation dialog with callbacks for "Submit" and "Decline" buttons.
   *
   * @param   {String} promptCopy        - Copy of the prompt to show
   * @param   {String} acceptButtonCopy  - Copy of the prompt to show
   * @param   {String} declineButtonCopy - Copy of the prompt to show
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showConfirmationModal(promptCopy, acceptButtonCopy, declineButtonCopy, acceptCallback, declineCallback) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.composeNode({
      id: Selector.MODAL.ID,
      wrapper: Selector.MODAL.WRAPPER,
      template: Selector.MODAL.TEMPLATE,
      children: [{
        wrapper: Selector.MODAL.CONTENT.WRAPPER,
        template: Selector.MODAL.CONFIRMATION_DIALOG.TEMPLATE,
        values: [
          {
            wrapper: Selector.MODAL.BUTTON.ACCEPT,
            innerText: acceptButtonCopy
          },
          {
            wrapper: Selector.MODAL.BUTTON.DECLINE,
            innerText: declineButtonCopy
          }
        ]
      }],
      values: [{
        wrapper: Selector.MODAL.CONTENT.HEADER,
        innerText: promptCopy
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        const closeButton = element.querySelector(Selector.MODAL.BUTTON.CLOSE);
        const acceptButton = element.querySelector(Selector.MODAL.BUTTON.ACCEPT);
        const declineButton = element.querySelector(Selector.MODAL.BUTTON.DECLINE);

        acceptButton.onclick = acceptCallback;
        declineButton.onclick = declineCallback;

        closeButton.onclick = () => {
          this.hideModal();
        };

        document.onkeyup = (evt) => {
          if (evt.key === 'Escape') {
            this.hideModal();
          }
        }
      },
      beforeUnset: (element) => {
        const closeButton = element.querySelector(Selector.MODAL.BUTTON.CLOSE);
        closeButton.onclick = null;
        document.onkeyup = null;
      }
    });
  }

  /**
   * Hides confirmation dialog.
   *
   * @returns void
   */
  hideModal() {
    const page = document.querySelector(Selector.PAGE);
    page.classList.remove(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.removeNode(Selector.MODAL.ID);
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