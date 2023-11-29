import {Selector, Value, Id, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';

export default class Records {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found",
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
   * Setter for this._counterparties
   */
  set counterparties(counterparties) {
    if (!(counterparties instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Id.COUNTERPARTY);
      return;
    }

    this._counterparties = counterparties;
  }

  /**
   * Setter for this._categories
   */
  set categories(categories) {
    if (!(categories instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Id.CATEGORY);
      return;
    }

    this._categories = categories;
  }

  /**
   * Setter for this._accounts
   */
  set accounts(accounts) {
    if (!(accounts instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Id.ACCOUNT);
      return;
    }

    this._accounts = accounts;
  }

  /**
   * Setter for this._transactions
   */
  set transactions(transactions) {
    if (!(transactions instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Id.TRANSACTION);
      return;
    }

    this._transactions = transactions;
  }

  /**
   * Insert table with data to container node.
   *
   * @param   {String} id        - Id of the table node
   * @param   {String} container - Element where table will be inserted
   * @returns void
   */
  insertTable(id, container) {
    const rows = this._transactions.get(true).map((transaction) => {
      return this.composeRow(transaction.id, transaction.value);
    });

    this._composer.composeNode({
      wrapper: container,
      template: Selector.TEMPLATE.RESULT.RECORDS,
      children: [{
        id,
        wrapper: Selector.WRAPPER.RESULT.RECORDS,
        template: Selector.TEMPLATE.TRANSACTION.LIST,
        children: rows
      }]
    });
  }

  /**
   * Converts transaction from CSV to Object suitable for page integraion
   *
   * @param   {String} id           - Id of the record
   * @param   {Array} bunqCsvRecord - Raw transaction record from bunq CSV export
   * @returns {Object} - Object with node values for NodeComposer
   */
  composeRow(id, transaction) {
    return {
      id,
      wrapper: Selector.WRAPPER.TRANSACTION.LIST,
      template: Selector.TEMPLATE.TRANSACTION.ROW,
      values: [
        {
          wrapper: Selector.WRAPPER.TRANSACTION.DATE,
          innerHTML: transaction.date || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.CATEGORY,
          innerHTML: transaction.category || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.COUNTERPARTY,
          innerHTML: transaction.counterpartyLabel || transaction.counterparty || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.PAYER,
          innerHTML: transaction.outcomeAccountLabel || transaction.outcomeAccount || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.PAYEE,
          innerHTML: transaction.incomeAccountLabel || transaction.incomeAccount || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.SUM,
          innerHTML: (transaction.income !== undefined)
            ? transaction.income.toFixed(2)
            : transaction.outcome.toFixed(2)
        },
        {
          wrapper: Selector.WRAPPER.TRANSACTION.COMMENT,
          innerHTML: transaction.comment || ''
        }
      ],
      afterInsert: (element) => {
        //console.log('added #' + element.id);

        const expandButton = element.querySelector(Selector.BUTTON.TRANSACTION.EXPAND);
        if (!expandButton) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.BUTTON.TRANSACTION.EXPAND, id);
          return;
        }

        expandButton.onclick = () => {
          element.classList.toggle(Value.EXPANDED_TRANSACTION_ROW);
        }

        const deleteButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.DELETE);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.BUTTON.TRANSACTION.DELETE, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = () => {
            this.showConfirmationModal(
              Copy.MODAL_DIALOG_REMOVE_TRANSACTION_HEADER,
              Copy.MODAL_DIALOG_ACCEPT_BUTTON,
              Copy.MODAL_DIALOG_DECLINE_BUTTON,
              () => {
                this._composer.removeNode(id);
                this._transactions.remove(id);
                this.hideModal();
              },
              () => {
                this.hideModal();
              }
            );
          }
        });

        const editButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EDIT);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.BUTTON.TRANSACTION.EDIT, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = () => {
            this.showTransactionEditModal(
              transaction,
              () => {
                console.log(`Edit form ${id}`);
              },
              () => {
                this.hideModal();
              }
            )
          }
        });
      },
      beforeUnset: (element) => {
        //console.log('removed #' + element.id);

        const expandButton = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EXPAND);
        if (!expandButton) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EXPAND, id);
          return;
        }

        expandButton.onclick = null;

        const deleteButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.DELETE);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.DELETE, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = null;
        });

        const editButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EDIT);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EDIT, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = null;
        });
      }
    }
  }

  /**
   * Inserts a list of new counterparties to container node.
   *
   * @param   {String} id        - Id of the element with the counterpartoes
   * @param   {String} container - Wrapper where the list will be inserted
   * @returns void
   */
  insertNewCounterparties(id, container) {
    const counterpartyList = [];

    this._transactions.get().forEach((transaction) => {
      const isUnknown = !transaction.counterpartyLabel;
      const isUnique = !counterpartyList.some((counterparty) => {
        return counterparty.values[0].innerText === transaction.counterparty;
      });

      if (isUnknown && isUnique) {
        counterpartyList.push({
          id: Id.NEW_COUNTERPARTY + counterpartyList.length,
          wrapper: Selector.WRAPPER.RESULT.CARD_LIST,
          template: Selector.TEMPLATE.RESULT.COUNTERPARTY_ITEM,
          values: [
            {
              wrapper: Selector.WRAPPER.COUNTERPARTY.ID,
              innerText: transaction.counterparty
            }
          ]
        });
      }
    });

    this._composer.composeNode({
      id,
      wrapper: container,
      template: Selector.TEMPLATE.RESULT.COUNTERPARTY_LIST,
      children: counterpartyList,
      values: [
        {
          wrapper: Selector.WRAPPER.COUNTERPARTY.AMOUNT,
          innerText: counterpartyList.length
        }
      ]
    });
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
      id: Id.MODAL_DIALOG,
      wrapper: Selector.WRAPPER.MODAL.MODAL,
      template: Selector.TEMPLATE.MODAL.WINDOW,
      children: [{
        wrapper: Selector.WRAPPER.MODAL.CONTENT,
        template: Selector.TEMPLATE.MODAL.CONFIRMATION_DIALOG,
        values: [
          {
            wrapper: Selector.WRAPPER.MODAL.ACCEPT_BUTTON,
            innerText: acceptButtonCopy
          },
          {
            wrapper: Selector.WRAPPER.MODAL.DECLINE_BUTTON,
            innerText: declineButtonCopy
          }
        ]
      }],
      values: [{
        wrapper: Selector.WRAPPER.MODAL.HEADER,
        innerText: promptCopy
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        const closeButton = element.querySelector(Selector.BUTTON.MODAL.CLOSE);
        const acceptButton = element.querySelector(Selector.BUTTON.MODAL.ACCEPT);
        const declineButton = element.querySelector(Selector.BUTTON.MODAL.DECLINE);

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
        const closeButton = element.querySelector(Selector.BUTTON.MODAL.CLOSE);
        closeButton.onclick = null;
        document.onkeyup = null;
      }
    });
  }

  /**
   * Shows a confirmation dialog with callbacks for "Submit" and "Decline" buttons.
   *
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showTransactionEditModal(transacton, acceptCallback, declineCallback) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.composeNode({
      id: Id.MODAL_DIALOG,
      wrapper: Selector.WRAPPER.MODAL.MODAL,
      template: Selector.TEMPLATE.MODAL.WINDOW,
      children: [{
        wrapper: Selector.WRAPPER.MODAL.CONTENT,
        template: Selector.TEMPLATE.MODAL.TRANSACTION_EDIT_FORM
      }],
      values: [{
        wrapper: Selector.WRAPPER.MODAL.HEADER,
        innerText: Copy.MODAL_TRANSACTION_EDIT_FORM_HEADER
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        const dateField = element.querySelector(Selector.FORM.TRANSACTION_EDIT.FIELD.DATE);
        dateField.value = transacton.date;

        const dateValidation = element.querySelector(Selector.FORM.TRANSACTION_EDIT.VALIDATION_CONTAINER.DATE);
        dateValidation.innerHTML = transacton.date;

        const closeButton = element.querySelector(Selector.BUTTON.MODAL.CLOSE);
        const acceptButton = element.querySelector(Selector.BUTTON.MODAL.ACCEPT);
        const declineButton = element.querySelector(Selector.BUTTON.MODAL.DECLINE);

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
        const closeButton = element.querySelector(Selector.BUTTON.MODAL.CLOSE);
        closeButton.onclick = null;
        document.onkeyup = null;
      }
    });
  }

  /**
   * Hides confirmation dialog.
   *
   * @param   {String} id - Id of the window to hide
   * @returns void
   */
  hideModal() {
    const page = document.querySelector(Selector.PAGE);
    page.classList.remove(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.removeNode(Id.MODAL_DIALOG);
  }

  // transactions.getUnknownCounterparties()
  // transactions.saveCounterpart()
  // transactions.addRecordItem()
  // transactions.records
  // transactions.counterparties
  // transactions.removeRecordItem(id)
  // transactions.showRecordEdit()
  // transactions.saveRecordItem(id, {})
}
