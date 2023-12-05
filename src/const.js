export const Selector = {
  PAGE: '.page',
  PAGE_CONTENT: '.page__content',
  UPLOAD_BUTTON: '.panel__file-submit',
  RESULT: {
    ID: '#result',
    TEMPLATE: '#result-template',
    WRAPPER: '.result',
  },
  TRANSACTIONS: {
    WRAPPER: '.result__transactions',
    TEMPLATE: '#result-transactions-template',
    LIST: {
      ID: '#transactions-table',
      TEMPLATE: '#transactions-table-template',
      WRAPPER: '.transactions'
    },
    ITEM: {
      ID: '#transaction',
      TEMPLATE: '#transaction-row-template',
      DATE: '.transactions__date',
      CATEGORY: '.transactions__category',
      COUNTERPARTY: '.transactions__counterpart',
      PAYER: '.transactions__payer',
      PAYEE: '.transactions__payee',
      SUM: '.transactions__sum',
      COMMENT: '.transactions__comment',
      EDIT_BUTTON: '.transactions__edit-button',
      DELETE_BUTTON: '.transactions__delete-button',
      EXPAND_BUTTON: '.transactions__expand-button'
    },
    EMPTY_VALUE: '<span class="transactions__empty">&mdash;</span>'
  },
  COUNTERPARTIES: {
    WRAPPER: '.result__counterparties',
    AMOUNT: '.result__counterparties .header__badge',
    LIST: {
      ID: '#counterparties-list',
      TEMPLATE: '#result-counterparty-list-template',
      WRAPPER: '.result__card-list'
    },
    ITEM: {
      ID: '#counterparty',
      TEMPLATE: '#result-counterparty-item-template',
      KEY: '.card__description-definition'
    },
    NEW: {
      ID: '#new-counterparty',
      TEMPLATE: '#result-counterparty-item-template',
      KEY: '.card__description-definition'
    }
  },
  CATEGORIES: {
    ITEM: {
      ID: '#category'
    }
  },
  ACCOUNTS: {
    ITEM: {
      ID: '#category'
    }
  },
  MODAL: {
    ID: '#modal',
    WRAPPER: '.page__modal',
    TEMPLATE: '#modal-template',
    CONTENT: {
      WRAPPER: '.modal__content',
      HEADER: '.modal__header'
    },
    BUTTON: {
      ACCEPT: 'button[type=submit]',
      DECLINE: 'button[type=reset]',
      CLOSE: '.modal__close'
    },
    CONFIRMATION_DIALOG: {
      TEMPLATE: '#modal-confirmation-dialog-template'
    }
  },
  TRANSACTION_EDIT_FORM: {
    TEMPLATE: '#transaction-edit-form-template',
    DATE: {
      FIELD: '#field--date',
      VALIDATION_CONTAINER: '#field--date ~ .form__validation-container:first-of-type'
    }
  },
  MESSAGE: {
    WRAPPER: '.message',
    ERROR: {
      TEMPLATE: '#message-error-template'
    },
    SUCCESS: {
      TEMPLATE: '#message-success-template'
    }
  },
  NOTIFICATION: {
    WRAPPER: '.notification',
    TEMPLATE: '#notification-template',
    CONTENT: '.notification__content'
  }
};

export const Value = {
  EXPANDED_TRANSACTION_ROW: 'transactions__row--expanded',
  PAGE_NOSCROLL_MODIFIER: 'page--noscroll',
  FORM_INPUT_ERROR_CLASS: 'form__text-input--error'
};

export const Copy = {
  MODAL: {
    REMOVE_TRANSACTION: {
      HEADER: 'Удалить транзакцию?',
      ACCEPT_BUTTON: 'Удалить',
      DECLINE_BUTTON: 'Отмена',
    }
  },
  TRANSACTION_EDIT_FORM: {
    HEADER: 'Редактирование транзакции',
    ERROR: {
      INCORRECT_DATE: 'Некорректная дата'
    }
  }
};
