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
    LIST: {
      ID: '#counterparties-list',
      TEMPLATE: '#result-counterparty-list-template',
      WRAPPER: '.result__card-list'
    },
    ITEM: {
      ID: '#counterparty',
      TEMPLATE: '#result-counterparty-item-template',
      KEY: '.card__description-definition',
      DELETE_BUTTON: '.card__delete-button',
      ADD_BUTTON: '.card__add-button'
    },
    NEW: {
      ID: '#new-counterparty',
      TEMPLATE: '#result-counterparty-item-template',
      KEY: '.card__description-definition',
      AMOUNT: '.result__counterparties .header__badge'
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
    ID: '#transaction-edit-form',
    TEMPLATE: '#transaction-edit-form-template',
    DATE: {
      FIELD: '#field--date',
      VALIDATION_CONTAINER: '#field--date ~ .form__validation-container'
    },
    CATEGORY: {
      FIELD: '#field--category',
      LIST: '#list--category',
      VALIDATION_CONTAINER: '#field--category ~ .form__validation-container'
    },
    COUNTERPARTY: {
      FIELD: '#field--counterparty',
      LIST: '#list--counterparty',
      VALIDATION_CONTAINER: '#field--counterparty ~ .form__validation-container'
    },
    OUTCOME_ACCOUNT: {
      FIELD: '#field--outcome-account',
      LIST: '#list--outcome-account',
      VALIDATION_CONTAINER: '#field--outcome-account ~ .form__validation-container'
    },
    INCOME_ACCOUNT: {
      FIELD: '#field--income-account',
      LIST: '#list--income-account',
      VALIDATION_CONTAINER: '#field--income-account ~ .form__validation-container'
    },
    AMOUNT: {
      FIELD: '#field--amount',
      VALIDATION_CONTAINER: '#field--amount ~ .form__validation-container'
    },
    COMMENT: {
      FIELD: '#field--comment',
      VALIDATION_CONTAINER: '#field--comment ~ .form__validation-container'
    },
    DATALIST: {
      WRAPPER: 'option',
      TEMPLATE: '#form-datalist-option-template'
    }
  },
  COUNTERPARTY_ADD_FORM: {
    ID: '#counterparty-add-form-with-context',
    TEMPLATE: '#counterparty-add-form-with-context-template',
    KEY: {
      FIELD: '#field--key',
      VALIDATION_CONTAINER: '#field--key ~ .form__validation-container'
    },
    CATEGORY: {
      FIELD: '#field--category',
      LIST: '#list--category',
      VALIDATION_CONTAINER: '#field--category ~ .form__validation-container'
    },
    NAME: {
      FIELD: '#field--name',
      VALIDATION_CONTAINER: '#field--name ~ .form__validation-container'
    },
    TRANSACTIONS_TABLE: {
      ID: '#counterparty-transactions',
      TEMPLATE: '#counterparty-transactions-table-template'
    },
    TRANSACTIONS_ROW: {
      TEMPLATE: '#counterparty-transactions-row-template',
      DATE: '.transactions__date',
      PAYER: '.transactions__payer',
      PAYEE: '.transactions__payee',
      SUM: '.transactions__sum',
      COMMENT: '.transactions__comment'
    }
  },
  MESSAGE: {
    CONTENT: {
      WRAPPER: '.message'
    },
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
    },
    REMOVE_COUNTERPARTY: {
      HEADER: 'Удалить контрагента?',
      ACCEPT_BUTTON: 'Удалить',
      DECLINE_BUTTON: 'Отмена',
    }
  },
  TRANSACTION_EDIT_FORM: {
    HEADER: 'Редактирование транзакции',
    ERROR: {
      INCORRECT_DATE: 'Некорректная дата',
      INCORRECT_AMOUNT: 'Некорректная сумма',
      EMPTY_CATEGORY: 'Укажите категорию',
      EMPTY_COUNTERPARTY: 'Укажите контрагента',
      EMPTY_ACCOUNT: 'Укажите один из счетов'
    }
  },
  COUNTERPARTY_ADD_FORM: {
    HEADER: 'Добавление контрагента',
    ERROR: {
      EMPTY_KEY: 'Укажите уникальный идентификатор',
      EMPTY_CATEGORY: 'Укажите категорию',
      EMPTY_NAME: 'Укажите имя'
    }
  }
};
