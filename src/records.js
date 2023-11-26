import {Selector, Value, Id} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';

export default class Records {
  /**
   * Array for imported raw transactions data
   */
  transactions = [];

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
    COUNTERPARTY_AMOUNT: Selector.WRAPPER.COUNTERPARTY.AMOUNT
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
    EMPTY_STRING: Value.TRANSACTION_EMPTY_STRING
  }

  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_UPLOADED_DATA: "Uploaded data has invalid format",
    MISSING_VALUE: "Missing {0} for transaction row",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found",
    INVALID_CATEGORIES: "Invalid categories data",
    INVALID_ACCOUNTS: "Invalid accounts data",
    INVALID_ACCOUNT_OBJECT: "Invalid account object",
    INVALID_COUNTERPARTS: "Invalid counterparties data",
    INVALID_COUNTERPART_OBJECT: "Invalid counterparty object",
    EXISTING_COUNTERPART: "Counterpart with a key '{0}' is already existing and cannot be added",
    EXISTING_CATEGORY: "Category '{0}' is already existing and cannot be added",
    EXISTING_ACCOUNT: "Account a key '{0}' is already existing and cannot be added"
  }

  constructor(composer) {
    if (!(composer instanceof NodeComposer)) {
      error(this._errorMessage.INVALID_COMPOSER);
      return;
    }

    this._composer = composer;
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
    const rows = this.transactions.map((transaction) => {
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
        console.log('added #' + element.id);

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
            console.log(`Delete '${id}'`);
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
        console.log('removed #' + element.id);

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

    this.transactions.forEach((transaction) => {
      const isUnknown = !transaction.value["counterpartyLabel"];
      const isUnique = !counterpartyList.some((counterparty) => {
        return counterparty.values[0].innerText === transaction.value["counterparty"]
      });

      if (isUnknown && isUnique) {
        counterpartyList.push({
          id: Id.NEW_COUNTERPARTY + counterpartyList.length,
          wrapper: this._container.COUNTERPARTY_LIST,
          template: this._template.COUNTERPARTY_ITEM,
          values: [
            {
              wrapper: this._container.COUNTERPARTY_ID,
              innerText: transaction.value["counterparty"]
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

  // transactions.getUnknownCounterparties()
  // transactions.saveCounterpart()
  // transactions.addRecordItem()
  // transactions.records
  // transactions.counterparties
  // transactions.removeRecordItem(id)
  // transactions.showRecordEdit()
  // transactions.saveRecordItem(id, {})
}
