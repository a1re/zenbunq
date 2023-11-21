import {Selector, Value} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';

export default class Records {

  /**
   * Array for imported raw transactions data
   */
  transactions = [];

  /**
   * Array for counterparties objects
   */
  counterparties = [];

  /**
   * Array for categories objects
   */
  categories = [];

  /**
   * Array for accounts
   */
  accounts = [];
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
   * Setting for raising error messages in console
   */
  _showErrors = true;

  /**
   * Prefix for transaction rows
   */
  _transactionIdPrefix = "transaction-";

  /**
   * Prefix for counterparty rows
   */
  _counterpartyIdPrefix = "counterparty-";

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
   * Counterparties setter
   *
   * @param  {Array} counterparties
   * @returns void
   */
  addCounterparties(counterparties) {
    if (!Array.isArray(counterparties)) {
      error(this._errorMessage.INVALID_COUNTERPARTS);
      return;
    }

    counterparties.forEach((counterparty) => {
      if (!counterparty.key || !counterparty.label || !counterparty.category) {
        error(this._errorMessage.INVALID_COUNTERPART_OBJECT);
        return;
      }
      if (this.counterparties.some((c) => c.key === counterparty.key)) {
        error(this._errorMessage.EXISTING_COUNTERPART, counterparty.key);
        return;
      }
      this.counterparties.push(counterparty);
    });
  }

  /**
   * Removes a counterparty from this.counterparties by its key
   *
   * @param   {String} counterpartyKey
   * @returns {Boolean} - true if counterparty was found and removed, false if not
   */
  removeCounterparty(counterpartyKey) {
    let isCounterpartyRemoved = false;
    for (let i = this.counterparties.length - 1; i >= 0; i--) {
      if (this.counterparties[i].key === counterpartyKey) {
        this.counterparties = [
          ...this.counterparties.slice(0, i),
          ...this.counterparties.slice(i + 1)
        ];

        isCounterpartyRemoved = true;
      }
    }

    return isCounterpartyRemoved;
  }

  /**
   * Catagories setter
   *
   * @param  {Array} categories
   * @returns void
   */
  addCategories(categories) {
    if (!Array.isArray(categories)) {
      error(this._errorMessage.INVALID_CATEGORIES);
      return;
    }

    categories.forEach((category) => {
      if (this.categories.includes(category)) {
        error(this._errorMessage.EXISTING_CATEGORY, category);
        return;
      }
      this.categories.push(category);
    });
  }

  /**
   * Removes a category from this.categories
   *
   * @param   {String} category
   * @returns {Boolean} - true if the category was found and removed, false if not
   */
  removeCategory(category) {
    let isCategoryRemoved = false;
    for (let i = this.categories.length - 1; i >= 0; i--) {
      if (this.categories[i] === category) {
        this.categories = [
          ...this.categories.slice(0, i),
          ...this.categories.slice(i + 1)
        ];

        isCategoryRemoved = true;
      }
    }

    return isCategoryRemoved;
  }

  /**
   * Accounts setter
   *
   * @param  {Array} accounts
   * @returns void
   */
  addAccounts(accounts) {
    if (!Array.isArray(accounts)) {
      error(this._errorMessage.INVALID_ACCOUNTS);
      return;
    }

    accounts.forEach((account) => {
      if (!account.key || !account.label) {
        error(this._errorMessage.INVALID_ACCOUNT_OBJECT);
        return;
      }
      if (this.accounts.some((a) => a.key === account.key)) {
        error(this._errorMessage.EXISTING_ACCOUNT, account.key);
        return;
      }
      this.accounts.push(account);
    });
  }

  /**
   * Removes an account from this.accounts by its key
   *
   * @param   {String} accountKey
   * @returns {Boolean} - true if the account was found and removed, false if not
   */
  removeAccount(accountKey) {
    let isAccountRemoved = false;
    for (let i = this.accounts.length - 1; i >= 0; i--) {
      if (this.accounts[i].key === accountKey) {
        this.accounts = [
          ...this.accounts.slice(0, i),
          ...this.accounts.slice(i + 1)
        ];

        isAccountRemoved = true;
      }
    }

    return isAccountRemoved;
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
    const rows = this.transactions.map((transaction, i) => {
      return this.composeRow(this._transactionIdPrefix + i, transaction);
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

    for (let i = 0; i < this.transactions.length; i++) {
      const isUnknown = !this.transactions[i]["counterpartyLabel"];
      const isUnique = !counterpartyList.some((counterparty) => {
        return counterparty.values[0].innerText === this.transactions[i]["counterparty"]
      });

      if (isUnknown && isUnique) {
        counterpartyList.push({
          id: this._counterpartyIdPrefix + counterpartyList.length,
          wrapper: this._container.COUNTERPARTY_LIST,
          template: this._template.COUNTERPARTY_ITEM,
          values: [
            {
              wrapper: this._container.COUNTERPARTY_ID,
              innerText: this.transactions[i]["counterparty"]
            }
          ]
        });
      }
    }

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
