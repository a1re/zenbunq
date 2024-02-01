import {Selector, Value, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';
import ModalWindow from './helpers/modal-window';

export default class Records {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
    TRANSACTION_FORM_NOT_FOUND: "Transaction edit form not found",
    COUNTERPARTY_FORM_NOT_FOUND: "Counterparty add form not found",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found",
    COUNTERPARTY_BUTTON_NOT_FOUND: "Button '{0}' for counterparty '{1}' not found",
    DOWNLOAD_BUTTON_NOT_FOUND: "Download CSV button not found"
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
      error(this._errorMessage.INVALID_DATA, Selector.COUNTERPARTIES.ITEM.ID);
      return;
    }

    this._counterparties = counterparties;
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
   * Setter for this._transactions
   */
  set transactions(transactions) {
    if (!(transactions instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.TRANSACTIONS.ITEM.ID);
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
      template: Selector.TRANSACTIONS.TEMPLATE,
      children: [{
        id,
        wrapper: Selector.TRANSACTIONS.WRAPPER,
        template: Selector.TRANSACTIONS.LIST.TEMPLATE,
        children: rows
      }],
      values: [{
        wrapper: Selector.TRANSACTIONS.AMOUNT,
        innerText: rows.length
      }]
    });

    const downloadButton = document.querySelector(Selector.TRANSACTIONS.DOWNLOAD_BUTTON);
    if (!downloadButton) {
      error(this._errorMessage.DOWNLOAD_BUTTON_NOT_FOUND);
      return;
    }

    downloadButton.onclick = () => {
      let earlisetTransaction, latestTransaction;
      const csv = this._transactions.get().map((transaction) => {
        const transactionDateParts = transaction.date.split('-').map((part) => parseInt(part, 10));
        const transactionDate = new Date(transactionDateParts[0], transactionDateParts[1]-1, transactionDateParts[2]);

        if (!earlisetTransaction || transactionDate < earlisetTransaction) {
          earlisetTransaction = transactionDate;
        }

        if (!latestTransaction || transactionDate > latestTransaction) {
          latestTransaction = transactionDate;
        }

        const row = [
          transactionDateParts.length > 0 ? transaction.date.replace(/(\d{4})-(\d{2})-(\d{2})/g, "$3.$2.$1") : '',
          transaction.category || '',
          transaction.counterpartyLabel || transaction.counterparty || '',
          transaction.outcomeAccountLabel || transaction.outcomeAccount || '',
          transaction.outcome ? transaction.outcome.toFixed(2).toString().replace('.', ',') : '',
          transaction.incomeAccountLabel || transaction.incomeAccount || '',
          transaction.income ? transaction.income.toFixed(2).toString().replace('.', ',') : '',
          transaction.comment || ''
        ];

        return row.map((element) => {
          let v = element.toString();

          if (v.includes('"')) {
            v = v.replace('"', '""');
          }

          if (v.includes(Value.CSV_FILENAME.DELIMITER)) {
            v = '"' + v + '"';
          }

          return v;
        }).join(Value.CSV_FILENAME.DELIMITER);
      });

      const monthsNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      earlisetTransaction = new Date(earlisetTransaction);
      latestTransaction = new Date(latestTransaction);
      const filename = Value.CSV_FILENAME.PREFIX +
        monthsNames[earlisetTransaction.getMonth()] + earlisetTransaction.getDate() + '-' +
        monthsNames[latestTransaction.getMonth()] + latestTransaction.getDate() + '.' +
        Value.CSV_FILENAME.EXTENSION;

      const blob = new Blob([csv.join("\n")], {type: "text/csv;charset=utf-8;"});

      if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
      } else {
          const link = document.createElement("a");
          if (link.download !== undefined) {
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", filename);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
      }
    }
  }

  /**
   * Converts transaction from CSV to Object suitable for page integraion
   *
   * @param   {String} id           - Id of the record
   * @param   {Array} bunqCsvRecord - Raw transaction record from bunq CSV export
   * @returns {Object} - Object with node values for NodeComposer
   */
  composeRow(id, transaction) {
    const modal = new ModalWindow(this._composer);

    return {
      id,
      wrapper: Selector.TRANSACTIONS.LIST.WRAPPER,
      template: Selector.TRANSACTIONS.ITEM.TEMPLATE,
      values: [
        {
          wrapper: Selector.TRANSACTIONS.ITEM.DATE,
          innerHTML: transaction.date || Selector.TRANSACTIONS.EMPTY_VALUE
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.CATEGORY,
          innerHTML: transaction.category || Selector.TRANSACTIONS.EMPTY_VALUE
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.COUNTERPARTY,
          innerHTML: transaction.counterpartyLabel || Selector.TRANSACTIONS.EMPTY_VALUE
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.PAYER,
          innerHTML: transaction.outcomeAccountLabel || Selector.TRANSACTIONS.EMPTY_VALUE
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.PAYEE,
          innerHTML: transaction.incomeAccountLabel || Selector.TRANSACTIONS.EMPTY_VALUE
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.SUM,
          innerHTML: (transaction.income !== undefined)
            ? transaction.income.toFixed(2)
            : transaction.outcome.toFixed(2)
        },
        {
          wrapper: Selector.TRANSACTIONS.ITEM.COMMENT,
          innerHTML: transaction.comment || ''
        }
      ],
      afterInsert: (element) => {
        const expandButton = element.querySelector(Selector.TRANSACTIONS.ITEM.EXPAND_BUTTON);
        if (!expandButton) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.EXPAND_BUTTON, id);
          return;
        }

        expandButton.onclick = () => {
          element.classList.toggle(Value.EXPANDED_TRANSACTION_ROW);
        }

        const deleteButtonList = element.querySelectorAll(Selector.TRANSACTIONS.ITEM.DELETE_BUTTON);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.DELETE_BUTTON, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = () => {
            modal.showConfirmationModal({
              prompt: Copy.MODAL.REMOVE_TRANSACTION.HEADER,
              acceptButtonCopy: Copy.MODAL.REMOVE_TRANSACTION.ACCEPT_BUTTON,
              declineButtonCopy: Copy.MODAL.REMOVE_TRANSACTION.DECLINE_BUTTON,
              acceptCallback: () => {
                this._composer.removeNode(id);
                this._transactions.remove(id);

                const amountBadge = document.querySelector(Selector.TRANSACTIONS.AMOUNT);
                if (amountBadge) {
                  const amount = parseInt(amountBadge.innerText, 10) - 1;
                  if (amount > 0) {
                    amountBadge.innerText = amount;
                  } else {
                    const transactions = document.querySelector(Selector.TRANSACTIONS.WRAPPER);
                    this._composer.removeNode(transactions);
                  }
                }

                modal.hideModal();
              },
              declineCallback: () => {
                modal.hideModal();
              }
            });
          }
        });

        const editButtonList = element.querySelectorAll(Selector.TRANSACTIONS.ITEM.EDIT_BUTTON);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.EDIT_BUTTON, id);
          return;
        }

        editButtonList.forEach((editButton) => {
          editButton.onclick = () => {
            this.showTransactionEditModal(
              transaction,
              (evt) => {
                evt.preventDefault();

                const transactionEditForm = document.querySelector(Selector.TRANSACTION_EDIT_FORM.ID);
                if (!transactionEditForm) {
                  error(this._errorMessage.TRANSACTION_FORM_NOT_FOUND);
                  return;
                }

                const changeEvent = new Event('change');

                const fields = [
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.DATE.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.CATEGORY.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.COUNTERPARTY.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD),
                  transactionEditForm.querySelector(Selector.TRANSACTION_EDIT_FORM.COMMENT.FIELD)
                ];

                fields.forEach((field) => {
                  field.dispatchEvent(changeEvent);
                })


                if (transactionEditForm.reportValidity() === false) {
                  return;
                }

                const transactionEditFormData = new FormData(transactionEditForm);
                const formValues = Object.fromEntries(transactionEditFormData);
                const originalTransactionValues = this._transactions.findById(id);

                const transaction = {
                  date: formValues[Selector.TRANSACTION_EDIT_FORM
                    .DATE.FIELD.replace(/^(\#)/s, '')],
                  category: formValues[Selector.TRANSACTION_EDIT_FORM
                    .CATEGORY.FIELD.replace(/^(\#)/s, '')] || undefined,
                  comment: formValues[Selector.TRANSACTION_EDIT_FORM
                    .COMMENT.FIELD.replace(/^(\#)/s, '')] || undefined
                }

                const counterpartyLabel = formValues[Selector.TRANSACTION_EDIT_FORM
                  .COUNTERPARTY.FIELD.replace(/^(\#)/s, '')];

                if (counterpartyLabel.trim().length > 0) {
                  transaction.counterpartyLabel = counterpartyLabel;
                } else {
                  transaction.counterpartyLabel = undefined;
                }

                const amount = formValues[Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD.replace(/^(\#)/s, '')]
                  ? parseFloat(formValues[Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD.replace(/^(\#)/s, '')], 10)
                  : undefined;

                const incomeAccount = formValues[Selector.TRANSACTION_EDIT_FORM
                  .INCOME_ACCOUNT.FIELD.replace(/^(\#)/s, '')];

                if (incomeAccount.trim().length > 0) {
                  transaction.incomeAccountLabel = incomeAccount;
                  transaction.income = amount;
                } else {
                  transaction.incomeAccountLabel = undefined;
                  transaction.income = undefined;
                }

                const outcomeAccount = formValues[Selector.TRANSACTION_EDIT_FORM
                  .OUTCOME_ACCOUNT.FIELD.replace(/^(\#)/s, '')];

                if (outcomeAccount.trim().length > 0) {
                  transaction.outcomeAccountLabel = outcomeAccount;
                  transaction.outcome = amount;
                } else {
                  transaction.outcomeAccountLabel = undefined;
                  transaction.outcome = undefined;
                }

                transaction.counterparty = originalTransactionValues.counterparty;
                transaction.outcomeAccount = originalTransactionValues.outcomeAccount;
                transaction.incomeAccount = originalTransactionValues.incomeAccount;

                this._transactions.update(id, transaction);
                modal.hideModal();

                const updatedTransactionNode = this.composeRow(id, transaction);
                updatedTransactionNode.wrapper = id;
                updatedTransactionNode.replaceWrapper = true;
                this._composer.composeNode(updatedTransactionNode);
              },
              () => {
                modal.hideModal();
              }
            )
          }
        });
      },
      beforeUnset: (element) => {
        const expandButton = element.querySelectorAll(Selector.TRANSACTIONS.ITEM.EXPAND_BUTTON);
        if (!expandButton) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.EXPAND_BUTTON, id);
          return;
        }

        expandButton.onclick = null;

        const deleteButtonList = element.querySelectorAll(Selector.TRANSACTIONS.ITEM.DELETE_BUTTON);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.DELETE_BUTTON, id);
          return;
        }

        deleteButtonList.forEach((deleteButton) => {
          deleteButton.onclick = null;
        });

        const editButtonList = element.querySelectorAll(Selector.TRANSACTIONS.ITEM.EDIT_BUTTON);
        if (deleteButtonList.length === 0) {
          error(this._errorMessage.TRANSACTION_BUTTON_NOT_FOUND, Selector.TRANSACTIONS.ITEM.EDIT_BUTTON, id);
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
   * @param   {String} id        - Id of the element with the counterparties
   * @param   {String} container - Wrapper where the list will be inserted
   * @returns void
   */
  insertNewCounterparties(id, container) {
    const modal = new ModalWindow(this._composer);
    const counterpartyList = [];
    this._transactions.get().forEach((transaction) => {
      const isUnknown = !this._counterparties.find((counterparty) => {
        return counterparty.key === transaction.counterparty;
      });
      const isUnique = !counterpartyList.some((counterparty) => {
        return counterparty.values[0].innerText === transaction.counterparty;
      });

      if (isUnknown && isUnique) {
        counterpartyList.push({
          id: Selector.COUNTERPARTIES.NEW.ID + counterpartyList.length,
          wrapper: Selector.COUNTERPARTIES.LIST.WRAPPER,
          template: Selector.COUNTERPARTIES.ITEM.TEMPLATE,
          values: [
            {
              wrapper: Selector.COUNTERPARTIES.ITEM.KEY,
              innerText: transaction.counterparty
            }
          ],
          afterInsert: (element) => {
            const id = element.id;

            const deleteButton = element.querySelector(Selector.COUNTERPARTIES.ITEM.DELETE_BUTTON);
            if (!deleteButton) {
              error(this._errorMessage.COUNTERPARTY_BUTTON_NOT_FOUND, Selector.COUNTERPARTIES.ITEM.DELETE_BUTTON, id);
              return;
            }

            deleteButton.onclick = () => {

              modal.showConfirmationModal({
                prompt: Copy.MODAL.REMOVE_COUNTERPARTY.HEADER,
                acceptButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.ACCEPT_BUTTON,
                declineButtonCopy: Copy.MODAL.REMOVE_COUNTERPARTY.DECLINE_BUTTON,
                acceptCallback: () => {
                  this._composer.removeNode('#' + id);

                  const amountBadge = document.querySelector(Selector.COUNTERPARTIES.NEW.AMOUNT);
                  if (amountBadge) {
                    const amount = parseInt(amountBadge.innerText, 10) - 1;
                    if (amount > 0) {
                      amountBadge.innerText = amount;
                    } else {
                      this._composer.removeNode(Selector.COUNTERPARTIES.LIST.ID);
                    }
                  }
                  modal.hideModal();
                },
                declineCallback: () => {
                  modal.hideModal();
                }
              });
            }

            const addButton = element.querySelector(Selector.COUNTERPARTIES.ITEM.ADD_BUTTON);
            if (!addButton) {
              error(this._errorMessage.COUNTERPARTY_BUTTON_NOT_FOUND, Selector.COUNTERPARTIES.ITEM.ADD_BUTTON, id);
              return;
            }

            addButton.onclick = () => {
              this.showCounterpartyAddModal(
                transaction.counterparty,
                (evt) => {
                  evt.preventDefault();

                  const counterpartyAddForm = document.querySelector(Selector.COUNTERPARTY_ADD_FORM.ID);
                  if (!counterpartyAddForm) {
                    error(this._errorMessage.COUNTERPARTY_FORM_NOT_FOUND);
                    return;
                  }

                  const changeEvent = new Event('change');

                  const fields = [
                    counterpartyAddForm.querySelector(Selector.COUNTERPARTY_ADD_FORM.KEY.FIELD),
                    counterpartyAddForm.querySelector(Selector.COUNTERPARTY_ADD_FORM.CATEGORY.FIELD),
                    counterpartyAddForm.querySelector(Selector.COUNTERPARTY_ADD_FORM.NAME.FIELD)
                  ];

                  fields.forEach((field) => {
                    field.dispatchEvent(changeEvent);
                  })

                  if (counterpartyAddForm.reportValidity() === false) {
                    return;
                  }

                  const counterpartyAddFormData = new FormData(counterpartyAddForm);
                  const formValues = Object.fromEntries(counterpartyAddFormData);

                  const counterparty = {
                    key: formValues[Selector.COUNTERPARTY_ADD_FORM
                      .KEY.FIELD.replace(/^(\#)/s, '')],
                    category: formValues[Selector.COUNTERPARTY_ADD_FORM
                      .CATEGORY.FIELD.replace(/^(\#)/s, '')] || undefined,
                    name: formValues[Selector.COUNTERPARTY_ADD_FORM
                      .NAME.FIELD.replace(/^(\#)/s, '')]
                  };

                  this._counterparties.add(counterparty);
                  this._composer.removeNode('#' + id);

                  const transactionsToUpdate = this._transactions.filter(
                    (transaction) => transaction.counterparty == counterparty.key,
                    true
                  );

                  transactionsToUpdate.forEach((transaction) => {
                    const updatedTransaction = {
                      ...transaction.value,
                      category: counterparty.category,
                      counterparty: counterparty.key,
                      counterpartyLabel: counterparty.name,
                    };

                    this._transactions.update(transaction.id, updatedTransaction);

                    const updatedTransactionNode = this.composeRow(transaction.id, updatedTransaction);
                    updatedTransactionNode.wrapper = transaction.id;
                    updatedTransactionNode.replaceWrapper = true;
                    this._composer.composeNode(updatedTransactionNode);
                  });

                  const amountBadge = document.querySelector(Selector.COUNTERPARTIES.NEW.AMOUNT);
                  if (amountBadge) {
                    const amount = parseInt(amountBadge.innerText, 10) - 1;
                    if (amount > 0) {
                      amountBadge.innerText = amount;
                    } else {
                      this._composer.removeNode(Selector.COUNTERPARTIES.LIST.ID);
                    }
                  }
                  modal.hideModal();
                },
                () => {
                  modal.hideModal();
                }
              )
            }
          }
        });
      }
    });

    this._composer.composeNode({
      id,
      wrapper: container,
      template: Selector.COUNTERPARTIES.LIST.TEMPLATE,
      children: counterpartyList,
      values: [
        {
          wrapper: Selector.COUNTERPARTIES.NEW.AMOUNT,
          innerText: counterpartyList.length
        }
      ]
    });
  }

  /**
   * Shows a modal with a transaction edit form.
   *
   * @param   {Object} transacton        - Values of the transaction to edit
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showTransactionEditModal(transacton, acceptCallback, declineCallback) {
    const modal = new ModalWindow(this._composer);
    modal.showForm({
      header: Copy.TRANSACTION_EDIT_FORM.HEADER,
      template: Selector.TRANSACTION_EDIT_FORM.TEMPLATE,
      fields: [
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.DATE.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.DATE.VALIDATION_CONTAINER,
          fieldValue: transacton.date,
          validationCallback: modal.formField.validateDate(Copy.TRANSACTION_EDIT_FORM.ERROR.INCORRECT_DATE)
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.CATEGORY.FIELD,
          fieldValue: transacton.category,
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.CATEGORY.LIST,
          datalist: this._categories.get()
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.COUNTERPARTY.FIELD,
          fieldValue: transacton.counterpartyLabel,
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.COUNTERPARTY.LIST,
          datalist: this._counterparties.get().map((counterparty) => counterparty.label)
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.outcomeAccountLabel,
          validationCallback: modal.formField.validateOneNotEmpty(
            Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD,
            Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.VALIDATION_CONTAINER,
            Copy.TRANSACTION_EDIT_FORM.ERROR.EMPTY_ACCOUNT
          ),
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.LIST,
          datalist: this._accounts.get().map((account) => account.label)
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.incomeAccountLabel,
          validationCallback: modal.formField.validateOneNotEmpty(
            Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD,
            Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.VALIDATION_CONTAINER,
            Copy.TRANSACTION_EDIT_FORM.ERROR.EMPTY_ACCOUNT
          ),
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.LIST,
          datalist: this._accounts.get().map((account) => account.label)
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.AMOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.outcome || transacton.income,
          validationCallback: modal.formField.validateAmount(Copy.TRANSACTION_EDIT_FORM.ERROR.INCORRECT_AMOUNT)
        },
        {
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.COMMENT.FIELD,
          fieldValue: transacton.comment
        }
      ],
      acceptCallback,
      declineCallback
    });
  }

  /**
   * Shows a modal with a counterparty add form.
   *
   * @param   {Object} counterpartyKey   - Key value of the counterparty to be added
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showCounterpartyAddModal(counterpartyKey, acceptCallback, declineCallback) {
    const transactions = this._transactions.filter((transaction) => transaction.counterparty === counterpartyKey);

    const transactionNodes = transactions.map((transaction) => {
      return {
        wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_TABLE.ID,
        template: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.TEMPLATE,
        values: [
          {
            wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.DATE,
            innerText: transaction.date
          },
          {
            wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.PAYER,
            innerHTML: transaction.outcomeAccountLabel || transaction.outcomeAccount || Selector.TRANSACTIONS.EMPTY_VALUE
          },
          {
            wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.PAYEE,
            innerHTML: transaction.incomeAccountLabel || transaction.incomeAccount || Selector.TRANSACTIONS.EMPTY_VALUE
          },
          {
            wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.SUM,
            innerText: parseFloat(transaction.outcome || transaction.income, 10).toFixed(2)
          },
          {
            wrapper: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_ROW.COMMENT,
            innerText: transaction.comment
          }
        ]
      };
    });

    const modal = new ModalWindow(this._composer);
    modal.showForm({
      header: Copy.COUNTERPARTY_ADD_FORM.HEADER,
      template: Selector.COUNTERPARTY_ADD_FORM.TEMPLATE,
      fields: [
        {
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.KEY.FIELD,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.KEY.VALIDATION_CONTAINER,
          fieldValue: counterpartyKey,
          validationCallback: modal.formField.validateNotInList(
            this._counterparties.get().map((counterparty) => counterparty.key),
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_KEY
          )
        },
        {
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.FIELD,
          datalistSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.LIST,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.VALIDATION_CONTAINER,
          datalist: this._categories.get(),
          validationCallback: modal.formField.validateNotEmpty(
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_CATEGORY
          )
        },
        {
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.NAME.FIELD,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.NAME.VALIDATION_CONTAINER,
          validationCallback: modal.formField.validateNotEmpty(
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_NAME
          )
        }
      ],
      acceptCallback,
      declineCallback
    });

    const modalWindow = document.querySelector(Selector.MODAL.WINDOW);
    if (modalWindow) {
      modalWindow.classList.add(Value.MODAL_WINDOW_WIDE_MODIFIER);
    }

    this._composer.composeNode({
      wrapper: Selector.MODAL.CONTENT.WRAPPER,
      template: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_TABLE.TEMPLATE,
      children: transactionNodes
    });
  }
}
