import {Selector, Value, Copy} from './const';
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
    TRANSACTION_FORM_NOT_FOUND: "Transaction edit form not found",
    COUNTERPARTY_FORM_NOT_FOUND: "Counterparty add form not found",
    TRANSACTION_BUTTON_NOT_FOUND: "Button '{0}' for transaction row '{1}' not found",
    COUNTERPARTY_BUTTON_NOT_FOUND: "Button '{0}' for counterparty '{1}' not found",
    VALIDATION_CONTAINER_NOT_FOUND: "Validation container for the field is not found",
    FIELD_NOT_FOUND: "Field '{0}' is not found",
    INCORRECT_SCOPE: "Incorrect scope for querying elemengs"
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
            this.showConfirmationModal(
              Copy.MODAL.REMOVE_TRANSACTION.HEADER,
              Copy.MODAL.REMOVE_TRANSACTION.ACCEPT_BUTTON,
              Copy.MODAL.REMOVE_TRANSACTION.DECLINE_BUTTON,
              () => {
                this._composer.removeNode(id);
                this._transactions.remove(id);
                  
                const amountBadge = document.querySelector(Selector.TRANSACTIONS.AMOUNT);
                console.log(amountBadge);
                if (amountBadge) {
                  const amount = parseInt(amountBadge.innerText, 10) - 1;
                  if (amount > 0) {
                    amountBadge.innerText = amount;
                  } else {
                    const transactions = document.querySelector(Selector.TRANSACTIONS.WRAPPER);
                    this._composer.removeNode(transactions);
                  }
                }

                this.hideModal();
              },
              () => {
                this.hideModal();
              }
            );
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
                this.hideModal();

                const updatedTransactionNode = this.composeRow(id, transaction);
                updatedTransactionNode.wrapper = id;
                updatedTransactionNode.replaceWrapper = true;
                this._composer.composeNode(updatedTransactionNode);
              },
              () => {
                this.hideModal();
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
              this.showConfirmationModal(
                Copy.MODAL.REMOVE_COUNTERPARTY.HEADER,
                Copy.MODAL.REMOVE_COUNTERPARTY.ACCEPT_BUTTON,
                Copy.MODAL.REMOVE_COUNTERPARTY.DECLINE_BUTTON,
                () => {
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
                  this.hideModal();
                },
                () => {
                  this.hideModal();
                }
              );
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
                  this.hideModal();
                },
                () => {
                  this.hideModal();
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
   * Shows a modal with a transaction edit form.
   *
   * @param   {Object} transacton        - Values of the transaction to edit
   * @param   {Function} acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showTransactionEditModal(transacton, acceptCallback, declineCallback) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.composeNode({
      id: Selector.MODAL.ID,
      wrapper: Selector.MODAL.WRAPPER,
      template: Selector.MODAL.TEMPLATE,
      children: [{
        wrapper: Selector.MODAL.CONTENT.WRAPPER,
        template: Selector.TRANSACTION_EDIT_FORM.TEMPLATE
      }],
      values: [{
        wrapper: Selector.MODAL.CONTENT.HEADER,
        innerText: Copy.TRANSACTION_EDIT_FORM.HEADER
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.DATE.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.DATE.VALIDATION_CONTAINER,
          fieldValue: transacton.date,
          validationCallback: this.validateDate.bind(this)
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.CATEGORY.FIELD,
          fieldValue: transacton.category,
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.CATEGORY.LIST,
          datalist: this._categories.get()
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.COUNTERPARTY.FIELD,
          fieldValue: transacton.counterpartyLabel,
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.COUNTERPARTY.LIST,
          datalist: this._counterparties.get().map((counterparty) => counterparty.label)
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.outcomeAccountLabel,
          validationCallback: this.makeOneNotEmptyValidation(
            element.querySelector(Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD),
            element.querySelector(Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.VALIDATION_CONTAINER),
            Copy.TRANSACTION_EDIT_FORM.ERROR.EMPTY_ACCOUNT
          ),
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.LIST,
          datalist: this._accounts.get().map((account) => account.label)
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.incomeAccountLabel,
          validationCallback: this.makeOneNotEmptyValidation(
            element.querySelector(Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD),
            element.querySelector(Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.VALIDATION_CONTAINER),
            Copy.TRANSACTION_EDIT_FORM.ERROR.EMPTY_ACCOUNT
          ),
          datalistSelector: Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.LIST,
          datalist: this._accounts.get().map((account) => account.label)
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD,
          validationContainerSelector: Selector.TRANSACTION_EDIT_FORM.AMOUNT.VALIDATION_CONTAINER,
          fieldValue: transacton.outcome || transacton.income,
          validationCallback: this.validateAmount.bind(this)
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.TRANSACTION_EDIT_FORM.COMMENT.FIELD,
          fieldValue: transacton.comment
        });

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

        this.unsetFormFields(
          element,
          Selector.TRANSACTION_EDIT_FORM.DATE.FIELD,
          Selector.TRANSACTION_EDIT_FORM.OUTCOME_ACCOUNT.FIELD,
          Selector.TRANSACTION_EDIT_FORM.INCOME_ACCOUNT.FIELD,
          Selector.TRANSACTION_EDIT_FORM.AMOUNT.FIELD,
        );
      }
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
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

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

    this._composer.composeNode({
      id: Selector.MODAL.ID,
      wrapper: Selector.MODAL.WRAPPER,
      template: Selector.MODAL.TEMPLATE,
      children: [
        {
          wrapper: Selector.MODAL.CONTENT.WRAPPER,
          template: Selector.COUNTERPARTY_ADD_FORM.TEMPLATE
        },
        {
          wrapper: Selector.MODAL.CONTENT.WRAPPER,
          template: Selector.COUNTERPARTY_ADD_FORM.TRANSACTIONS_TABLE.TEMPLATE,
          children: transactionNodes
        }
      ],
      values: [{
        wrapper: Selector.MODAL.CONTENT.HEADER,
        innerText: Copy.COUNTERPARTY_ADD_FORM.HEADER
      }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        this.setFormField({
          scope: element,
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.KEY.FIELD,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.KEY.VALIDATION_CONTAINER,
          fieldValue: counterpartyKey,
          validationCallback: this.makeNotInListValidation(
            this._counterparties.get().map((counterparty) => counterparty.key),
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_KEY
          )
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.FIELD,
          datalistSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.LIST,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.CATEGORY.VALIDATION_CONTAINER,
          datalist: this._categories.get(),
          validationCallback: this.makeNotEmptyValidation(
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_CATEGORY
          )
        });

        this.setFormField({
          scope: element,
          fieldSelector: Selector.COUNTERPARTY_ADD_FORM.NAME.FIELD,
          validationContainerSelector: Selector.COUNTERPARTY_ADD_FORM.NAME.VALIDATION_CONTAINER,
          validationCallback: this.makeNotEmptyValidation(
            Copy.COUNTERPARTY_ADD_FORM.ERROR.EMPTY_NAME
          )
        });

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

        this.unsetFormFields(
          element,
          Selector.COUNTERPARTY_ADD_FORM.KEY.FIELD,
          Selector.COUNTERPARTY_ADD_FORM.CATEGORY.FIELD,
          Selector.COUNTERPARTY_ADD_FORM.NAME.FIELD
        );
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

    this._composer.removeNode(Selector.MODAL.ID);
  }

  /**
   * Sets up a form field with a value and validation callback
   *
   * @param   {String} options.fieldSelector               - DOM Selector of the field
   * @param   {*}      options.fieldValue                  - Default value (optional)
   * @param   {String} options.validationContainerSelector - DOM Selector of the validation container
   *                                                         (required if validationCallback is set)
   * @param   {Function} options.validationCallback        - Callback that will be called for validation as
   *                                                         'onchange' event with evt.target as a first
   *                                                         parameter, fieldSelector as a second parameter, and
   *                                                         validationContainerSelector as a third parameter
   *                                                         (if set, validationContainerSelector is required)
   * @param   {Array}    options.datalistSelector          - DOM Selector of the options for the field (optional)
   * @param   {Array}    options.datalist                  - List of options for the field (if set,
   *                                                         datalistSelector is required)
   * @param   {HTMLNode} options.scope                     - Scope for elements operations (optional)
   * @returns void
   */
  setFormField(options) {
    const scope = options.scope || document;
    const field = scope.querySelector(options.fieldSelector);

    if (!field) {
      error(this._errorMessage.FIELD_NOT_FOUND, options.fieldSelector);
      return;
    }

    if (options.fieldValue) {
      field.value = options.fieldValue;
    }

    if (options.datalistSelector && options.datalist) {
      options.datalist.forEach((datalistOption) => {
        this._composer.composeNode({
          wrapper: options.datalistSelector,
          template: Selector.TRANSACTION_EDIT_FORM.DATALIST.TEMPLATE,
          values: [{
            wrapper: Selector.TRANSACTION_EDIT_FORM.DATALIST.WRAPPER,
            attributes: [{
              name: 'value',
              value: datalistOption
            }]
          }]
        })
      });
    }

    if (options.validationContainerSelector && typeof options.validationCallback === "function") {
      const validationContainer = scope.querySelector(options.validationContainerSelector);
      field.onchange = () => {
        options.validationCallback(field, validationContainer);
      }
      field.onkeyup = field.onchange;
    }
  }

  /**
   * Unnregisters onChange listeners for the field(s).
   *
   * @param  {element} scope       - Node in the document tree that is parent
   *                                 to the elements defined as selectors
   * @param  {String} ...selectors - Selector(s) of the field(s) to unse
   */
  unsetFormFields(scope, ...selectors) {
    if (!(scope instanceof Element)) {
      error(this._errorMessage.INCORRECT_SCOPE);
      return;
    }

    selectors.forEach((selector) => {
      const field = scope.querySelector(selector);
      if (field) {
        field.onchange = null;
      }
    });
  }

  /**
   * Shows validation message for the field.
   *
   * @param   {Element} field              - Node element of the input/select field
   * @param   {String} validationContainer - Node element of the validation message containter
   * @param   {String} message             - Message to show in the containter
   * @returns void
   */
  showValidationMessage(field, validationContainer, message) {
    if (!validationContainer) {
      error(this._errorMessage.VALIDATION_CONTAINER_NOT_FOUND);
      return;
    }

    this._composer.composeNode({
      wrapper: validationContainer,
      template: Selector.MESSAGE.ERROR.TEMPLATE,
      values: [{
        wrapper: Selector.MESSAGE.CONTENT.WRAPPER,
        innerText: message
      }],
      incremental: false
    });

    field.classList.add(Value.FORM_INPUT_ERROR_CLASS);
    field.setCustomValidity(message);
  }

  /**
   * Hides validation message for the field.
   *
   * @param   {Element} field              - Node element of the input/select field
   * @param   {String} validationContainer - Node element of the validation message containter
   * @returns void
   */
  hideValidationMessage(field, validationContainer) {
    field.setCustomValidity('');
    field.classList.remove(Value.FORM_INPUT_ERROR_CLASS);
    this._composer.emptyNode(validationContainer)
  }

  /**
   * Validates the valude of the date input.
   *
   * @param   {Element} field               - Node element of the field to validate
   * @param   {Element} validationContainer - Node element of the container for validation message
   * @returns void
   */
  validateDate(field, validationContainer) {
    if (!field.valueAsDate || isNaN(field.valueAsDate.getTime())) {
      this.showValidationMessage(
        field,
        validationContainer,
        Copy.TRANSACTION_EDIT_FORM.ERROR.INCORRECT_DATE
      );
      return;
    }

    const today = Math.round(Date.now() / 1000);
    const transactionDate = Math.round(
      field.valueAsDate.getTime() / 1000 + field.valueAsDate.getTimezoneOffset() * 60
    );

    if (today < transactionDate) {
      this.showValidationMessage(
        field,
        validationContainer,
        Copy.TRANSACTION_EDIT_FORM.ERROR.INCORRECT_DATE
      );
      return;
    }

    this.hideValidationMessage(field, validationContainer);
  }

  /**
   * Validates the value of the transaction amount input.
   *
   * @param   {Element} field               - Node element of the field to validate
   * @param   {Element} validationContainer - Node element of the container for validation message
   * @returns void
   */
  validateAmount(field, validationContainer) {
    if (isNaN(field.value) || field.value <= 0) {
      this.showValidationMessage(
        field,
        validationContainer,
        Copy.TRANSACTION_EDIT_FORM.ERROR.INCORRECT_AMOUNT
      );
      return;
    }

    this.hideValidationMessage(field, validationContainer);
  }

  /**
   * Creates "Not empty" validation metod for a field.
   *
   * @param   {String} copy    - Validation message copy
   * @returns void
   */
  makeNotEmptyValidation(copy) {
    return (field, validationContainer) => {
      if (field.value.length === 0) {
        this.showValidationMessage(
          field,
          validationContainer,
          copy
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates "Not empty" validation metod for a field.
   *
   * @param   {Array} list    - List of items to check uniqness
   * @param   {String} copy   - Validation message copy
   * @returns void
   */
  makeNotInListValidation(list, copy) {
    return (field, validationContainer) => {
      const inList = list.find((item) => item === field.value);
      if (field.value.length === 0 || inList) {
        this.showValidationMessage(
          field,
          validationContainer,
          copy
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
    }
  }

  /**
   * Creates "Not empty" validation metod with a dependancy on another field
   * (at least one of the fields shouldn't be empty).
   *
   * @param   {Element} otherField               - Node element of the dependant field
   * @param   {Element} otherValidationContainer - Node element of the dependant field's
   *                                               validation container
   * @param   {String} copy                      - Validation message copy
   * @returns void
   */
  makeOneNotEmptyValidation(otherField, otherValidationContainer, copy) {
    return (field, validationContainer) => {
      const otherFieldLength = (otherField instanceof Element) ? otherField.value.length : 0;
      if (field.value.length === 0 && otherFieldLength === 0) {
        this.showValidationMessage(
          field,
          validationContainer,
          copy
        );
        return;
      }

      this.hideValidationMessage(field, validationContainer);
      this.hideValidationMessage(otherField, otherValidationContainer);
    }
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
