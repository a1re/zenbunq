import {Selector, Value} from './const';
import NodeComposer from './node-composer';
import adaptBunqCsv from './helpers/adapt-bunq-csv';

export default class Records {

  /**
   * Array for transaction objects
   */
  transactions = [];

  /**
   * Array for counterparts objects
   */
  counterparts = [];

  /**
   * Array for categories objects
   */
  categories = [];

  /**
   * Array for accounts
   */
  accounts = [];

  /**
   * Flag for skipping header in raw data
   */
  _isSkipHeader = true;

  /**
   * Selectors for wrappers
   */
  _container = {
    ROW: Selector.WRAPPER.TRANSACTION.ROW,
    TRANSACTIONS: Selector.WRAPPER.TRANSACTION.LIST,
    DATE: Selector.WRAPPER.TRANSACTION.DATE,
    CATEGORY: Selector.WRAPPER.TRANSACTION.CATEGORY,
    COUNTERPART: Selector.WRAPPER.TRANSACTION.COUNTERPART,
    PAYER: Selector.WRAPPER.TRANSACTION.PAYER,
    PAYEE: Selector.WRAPPER.TRANSACTION.PAYEE,
    SUM: Selector.WRAPPER.TRANSACTION.SUM,
    COMMENT: Selector.WRAPPER.TRANSACTION.COMMENT
  }

  /**
   * Selectors for templates
   */
  _template = {
    TRANSACTIONS: Selector.TEMPLATE.RESULT.RECORDS,
    TABLE: Selector.TEMPLATE.TRANSACTION.LIST,
    ROW: Selector.TEMPLATE.TRANSACTION.ROW,
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
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with this._error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_UPLOADED_DATA: "Uploaded data has invalid format",
    MISSING_VALUE: "Missing {0} for transaction row",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found",
    INVALID_CATEGORIES: "Invalid categories data",
    INVALID_ACCOUNTS: "Invalid accounts data",
    INVALID_ACCOUNT_OBJECT: "Invalid account object",
    INVALID_COUNTERPARTS: "Invalid counterparts data",
    INVALID_COUNTERPART_OBJECT: "Invalid counterpart object",
    EXISTING_COUNTERPART: "Counterpart with a key '{0}' is already existing and cannot be added",
    EXISTING_CATEGORY: "Category '{0}' is already existing and cannot be added",
    EXISTING_ACCOUNT: "Account a key '{0}' is already existing and cannot be added"
  }

  constructor(composer) {
    if (!(composer instanceof NodeComposer)) {
      this._error(this._errorMessage.INVALID_COMPOSER);
      return;
    }

    this._composer = composer;
  }

  /**
   * Error reporting with a formatted message. Based on this._showErrors, raises
   * error in the console or remains silent. Used for cleaner code  with values
   * from this._errorMessage.
   *
   * Example: this._error(this._errorMessage.INVALID_NODE, '.wrong-selector');
   *
   * @param {String} str  Original string with {0}, {1} and etc. values which
   *                      will be replaced by further passed arguments.
   * @param {String} arguments...
   * @returns
   */
  _error(message, ...args) {
    if (!this._showErrors) {
      return;
    }

    const formattedMessage = message.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });

    console.error(formattedMessage);
  }

  /**
   * Add raw transaction data to model. Data should be taken from bunq CSV
   * export. After uploading it is processed and added to this.records
   *
   * @param {Array} data  Transactions from CSV
   */
  uploadData(data) {
    if (!Array.isArray(data)) {
      this._error(this._errorMessage.INVALID_UPLOADED_DATA);
      return;
    }

    this.transactions = [];

    for (let i=0; i<data.length; i++) {
      if (i === 0 && this._isSkipHeader) {
        continue;
      }

      try {
        this.transactions.push(adaptBunqCsv(data[i]));
      } catch ({message}) {
        this._error(message);
      }
    }
  }

  /**
   * Counterparts setter
   * @param {Array} counterparts 
   * @return void
   */
  addCounterparts(counterparts) {
    if (!Array.isArray(counterparts)) {
      this._error(this._errorMessage.INVALID_COUNTERPARTS);
      return;
    }

    counterparts.forEach((counterpart) => {
      if (!counterpart.key || !counterpart.label || !counterpart.category) {
        this._error(this._errorMessage.INVALID_COUNTERPART_OBJECT);
        return;
      }
      if (this.counterparts.find((c) => c.key === counterpart.key)) {
        this._error(this._errorMessage.EXISTING_COUNTERPART, counterpart.key);
        return;
      }
      this.counterparts.push(counterpart);
    });
  }

  /**
   * Removes a counterparty from this.counterparts by its key
   * @param  {String} counterpartyKey 
   * @return {Boolean} - true if counterparty was found and removed, false if not
   */
  removeCounterparty(counterpartyKey) {
    let isCounterpartyRemoved = false;
    for (let i = this.counterparts.length - 1; i >= 0; i--) {
      if (this.counterparts[i].key === counterpartyKey) {
        this.counterparts = [
          ...this.counterparts.slice(0, i),
          ...this.counterparts.slice(i + 1)
        ];

        isCounterpartyRemoved = true;
      }
    }

    return isCounterpartyRemoved;
  }

  /**
   * Catagories setter
   * @param {Array} categories
   * @return void
   */
  addCategories(categories) {
    if (!Array.isArray(categories)) {
      this._error(this._errorMessage.INVALID_CATEGORIES);
      return;
    }

    categories.forEach((category) => {
      if (this.categories.find((c) => c === category)) {
        this._error(this._errorMessage.EXISTING_CATEGORY, category);
        return;
      }
      this.categories.push(category);
    });
  }

  /**
   * Removes a category from this.categories
   * @param  {String} category 
   * @return {Boolean} - true if the category was found and removed, false if not
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
   * @param {Array} accounts 
   * @return void
   */
  addAccounts(accounts) {
    if (!Array.isArray(accounts)) {
      this._error(this._errorMessage.INVALID_ACCOUNTS);
      return;
    }

    accounts.forEach((account) => {
      if (!account.key || !account.label) {
        this._error(this._errorMessage.INVALID_ACCOUNT_OBJECT);
        return;
      }
      if (this.accounts.find((a) => a.key === account.key)) {
        this._error(this._errorMessage.EXISTING_ACCOUNT, account.key);
        return;
      }
      this.accounts.push(account);
    });
  }

  /**
   * Removes an account from this.accounts by its key
   * @param  {String} accountKey 
   * @return {Boolean} - true if the account was found and removed, false if not
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
   * this._template.TRANSACTIONS for wrapper, this._template.TABLE
   * for table tag and this._template.ROW for a row.
   *
   * @param {String} wrapper  Selector of wrapper node to place the table.
   */
  insertTable(id, container) {
    const rows = [];

    for (let i = 0; i < this.transactions.length; i++) {
      const rowObject = this.prepareRow({id: this._transactionIdPrefix + i, ...this.transactions[i]});
      if (rowObject) {
        rows.push(rowObject);
      }
    }

    this._composer.composeNode({
      wrapper: container,
      template: this._template.TRANSACTIONS,
      children: [{
        id,
        wrapper: this._container.TRANSACTIONS,
        template: this._template.TABLE,
        children: rows
      }],
      incremental: false
    })
  }

  /**
   * Prepares row object for insertion via NodeComposer based on transaction data
   *
   * @param {String} options.id         Transaction id
   * @param {Number} options.sum        Transaction sum
   * @param {String} options.date       Transaction date
   * @param {String} options.category   Transaction category (optional)
   * @param {String} options.payer      Transaction payer (optional)
   * @param {String} options.payee      Transaction date (optional)
   * @param {String} options.comment    Transaction date (optional)
   */
  prepareRow({id, date, category, counterpart, payer, payee, sum, comment}) {
    if (!id) {
      this._error(this._errorMessage.MISSING_VALUE, 'id');
      return;
    }

    if (!date) {
      this._error(this._errorMessage.MISSING_VALUE, 'date');
      return;
    }

    if (!sum) {
      this._error(this._errorMessage.MISSING_VALUE, 'sum');
      return;
    }

    return {
      id,
      wrapper: this._container.ROW,
      template: this._template.ROW,
      values: [
        {
          wrapper: this._container.DATE,
          innerHTML: date || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: this._container.CATEGORY,
          innerHTML: category || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.COUNTERPART,
          innerHTML: counterpart || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.PAYER,
          innerHTML: payer || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.PAYEE,
          innerHTML: payee || this._template.EMPTY_STRING
        },
        {
          wrapper: this._container.SUM,
          innerHTML: sum
        },
        {
          wrapper: this._container.COMMENT,
          innerHTML: comment || ''
        }
      ],
      afterInsert: (element) => {
        const expandButton = element.querySelector(Selector.BUTTON.TRANSACTION.EXPAND);
        if (!expandButton) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EXPAND, id);
          return;
        }

        expandButton.onclick = () => {
          element.classList.toggle(Value.EXPANDED_TRANSACTION_ROW);
        }

        const deleteButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.DELETE);
        if (deleteButtonList.length === 0) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.DELETE, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = () => {
            console.log(`Delete '${id}'`);
          }
        });

        const editButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EDIT);
        if (deleteButtonList.length === 0) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EDIT, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = () => {
            console.log(`Edit '${id}'`);
          }
        });
      },
      beforeUnset: (element) => {
        const expandButton = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EXPAND);
        if (!expandButton) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EXPAND, id);
          return;
        }

        expandButton.onclick = null;

        const deleteButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.DELETE);
        if (deleteButtonList.length === 0) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.DELETE, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = null;
        });

        const editButtonList = element.querySelectorAll(Selector.BUTTON.TRANSACTION.EDIT);
        if (deleteButtonList.length === 0) {
          this._error(this._errorMessage.TRANSACTION_ROW_NOT_FOUND, Selector.BUTTON.TRANSACTION.EDIT, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = null;
        });
      }
    }
  }

  // transactions.getUnknownCounterparts()
  // transactions.saveCounterpart()
  // transactions.addRecordItem()
  // transactions.records
  // transactions.counterparts
  // transactions.removeRecordItem(id)
  // transactions.showRecordEdit()
  // transactions.saveRecordItem(id, {})
}
