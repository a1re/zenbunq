import {Selector, Value} from './const';
import NodeComposer from './node-composer';

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
    MISSING_VALUE: "Missing {0} for transaction row"
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

    this.transactions = data; // TEMPORARY WITHOUT PROCESSING
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
      ]
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
