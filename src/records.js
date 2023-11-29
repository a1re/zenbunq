import {Selector, Value, Id, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';

export default class Records {
  /**
   * Selectors for wrappers
   */
  _container = {
    TRANSACTION_LIST: Selector.WRAPPER.TRANSACTION.LIST,
    COUNTERPARTY_LIST: Selector.WRAPPER.RESULT.CARD_LIST,
    RESULT_RECORDS: Selector.WRAPPER.RESULT.RECORDS,
    DATE: Selector.WRAPPER.TRANSACTION.DATE,
    CATEGORY: Selector.WRAPPER.TRANSACTION.CATEGORY,
    COUNTERPARTY: Selector.WRAPPER.TRANSACTION.COUNTERPARTY,
    PAYER: Selector.WRAPPER.TRANSACTION.PAYER,
    PAYEE: Selector.WRAPPER.TRANSACTION.PAYEE,
    SUM: Selector.WRAPPER.TRANSACTION.SUM,
    COMMENT: Selector.WRAPPER.TRANSACTION.COMMENT,
    COUNTERPARTY_ID: Selector.WRAPPER.COUNTERPARTY.ID,
    COUNTERPARTY_AMOUNT: Selector.WRAPPER.COUNTERPARTY.AMOUNT,
    MODAL: Selector.WRAPPER.MODAL.MODAL,
    MODAL_HEADER: Selector.WRAPPER.MODAL.HEADER,
    MODAL_CONTENT: Selector.WRAPPER.MODAL.CONTENT,
    MODAL_ACCEPT_BUTTON: Selector.WRAPPER.MODAL.ACCEPT_BUTTON,
    MODAL_DECLINE_BUTTON: Selector.WRAPPER.MODAL.DECLINE_BUTTON
  }

  /**
   * Selectors for templates
   */
  _template = {
    RESULT_RECORDS: Selector.TEMPLATE.RESULT.RECORDS,
    COUNTERPARTY_LIST: Selector.TEMPLATE.RESULT.COUNTERPARTY_LIST,
    COUNTERPARTY_ITEM: Selector.TEMPLATE.RESULT.COUNTERPARTY_ITEM,
    TRANSACTION_LIST: Selector.TEMPLATE.TRANSACTION.LIST,
    TRANSACTION_ROW: Selector.TEMPLATE.TRANSACTION.ROW,
    EMPTY_STRING: Value.TRANSACTION_EMPTY_STRING,
    MODAL: Selector.TEMPLATE.MODAL.WINDOW,
    MODAL_CONFIRMATION_DIALOG: Selector.TEMPLATE.MODAL.CONFIRMATION_DIALOG
  }

  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found"
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
   * Insert table with data to container node. Template is set by
   * this._template.RESULT_RECORDS for wrapper, this._template.TRANSACTION_LIST
   * for table tag and this._template.TRANSACTION_ROW for a row.
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
      template: this._template.RESULT_RECORDS,
      children: [{
        id,
        wrapper: this._container.RESULT_RECORDS,
        template: this._template.TRANSACTION_LIST,
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
      wrapper: this._container.TRANSACTION_LIST,
      template: this._template.TRANSACTION_ROW,
      values: [
        {
          wrapper: this._container.DATE,
          innerHTML: transaction.date || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: this._container.CATEGORY,
          innerHTML: transaction.category || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.COUNTERPARTY,
          innerHTML: transaction.counterpartyLabel || transaction.counterparty || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.PAYER,
          innerHTML: transaction.outcomeAccountLabel || transaction.outcomeAccount || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.PAYEE,
          innerHTML: transaction.incomeAccountLabel || transaction.incomeAccount || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.SUM,
          innerHTML: (transaction.income !== undefined)
            ? transaction.income.toFixed(2)
            : transaction.outcome.toFixed(2)
        },
        {
          wrapper: this._container.COMMENT,
          innerHTML: transaction.comment || ''
        }
      ],
      afterInsert: (element) => {
        //console.log('added #' + element.id);

        const expandButton = element.querySelector(Selector.BUTTON.TRANSACTION.EXPAND);
        if (!expandButton) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EXPAND, id);
          return;
        }

        expandButton.onclick = () => {
          element.classList.toggle(Value.EXPANDED_TRANSACTION_ROW);
        }

        const deleteButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.DELETE);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.DELETE, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = () => {
            this.showConfirmationDialog(
              Id.MODAL_DIALOG,
              () => {
                this._composer.removeNode(id);
                this._transactions.remove(id);
                this.hideConfirmationDialog(Id.MODAL_DIALOG);
              },
              () => {
                this.hideConfirmationDialog(Id.MODAL_DIALOG);
              }
            );
          }
        });

        const editButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EDIT);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EDIT, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = () => {
            console.log(`Edit '${id}'`);
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
   * Inserts a list of new counterparties to container node. Template is set by
   * this._template.COUNTERPARTY_LIST for wrapper, this._template.COUNTERPARTY_ITEM
   * for a card.
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
          wrapper: this._container.COUNTERPARTY_LIST,
          template: this._template.COUNTERPARTY_ITEM,
          values: [
            {
              wrapper: this._container.COUNTERPARTY_ID,
              innerText: transaction.counterparty
            }
          ]
        });
      }
    });

    this._composer.composeNode({
      id,
      wrapper: container,
      template: this._template.COUNTERPARTY_LIST,
      children: counterpartyList,
      values: [
        {
          wrapper: this._container.COUNTERPARTY_AMOUNT,
          innerText: counterpartyList.length
        }
      ]
    });

  }

  /**
   * Shows a confirmation dialog with callbacks for "Submit" and "Decline" buttons.
   *
   * @param   {String} id                - Id of the modal window
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showConfirmationDialog(id, acceptCallback, declineCallback) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.composeNode({
      id,
      wrapper: this._container.MODAL,
      template: this._template.MODAL,
      children: [{
        id: 'aaa',
        wrapper: this._container.MODAL_CONTENT,
        template: this._template.MODAL_CONFIRMATION_DIALOG,
        values: [
          {
            wrapper: this._container.MODAL_ACCEPT_BUTTON,
            innerText: Copy.MODAL_DIALOG_ACCEPT_BUTTON
          },
          {
            wrapper: this._container.MODAL_DECLINE_BUTTON,
            innerText: Copy.MODAL_DIALOG_DECLINE_BUTTON
          }
        ]
      }],
      values: [{
        wrapper: this._container.MODAL_HEADER,
        innerText: Copy.MODAL_DIALOG_REMOVE_TRANSACTION_HEADER
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        const closeButton = element.querySelector(Selector.BUTTON.MODAL.CLOSE);
        const acceptButton = element.querySelector(Selector.BUTTON.MODAL.ACCEPT);
        const declineButton = element.querySelector(Selector.BUTTON.MODAL.DECLINE);

        acceptButton.onclick = acceptCallback;
        declineButton.onclick = declineCallback;

        closeButton.onclick = () => {
          this.hideConfirmationDialog(id);
        };

        document.onkeyup = (evt) => {
          if (evt.key === 'Escape') {
            this.hideConfirmationDialog(id);
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
  hideConfirmationDialog(id) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.remove(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.removeNode(id);
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
