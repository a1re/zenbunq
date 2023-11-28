export const Selector = {
  PAGE: '.page',
  PAGE_CONTENT: '.page__content',
  UPLOAD_BUTTON: '.panel__file-submit',

  WRAPPER: {
    TRANSACTION: {
      LIST: '.transactions',
      DATE: '.transactions__date',
      CATEGORY: '.transactions__category',
      COUNTERPARTY: '.transactions__counterpart',
      PAYER: '.transactions__payer',
      PAYEE: '.transactions__payee',
      SUM: '.transactions__sum',
      COMMENT: '.transactions__comment'
    },
    RESULT: {
      RESULT: '.result',
      RECORDS: '.result__records',
      COUNTERPARTIES: '.result__counterparties',
      CARD_LIST: '.result__card-list'
    },
    COUNTERPARTY: {
      AMOUNT: '.result__counterparties .header__badge',
      ID: '.card__description-definition'
    },
    MODAL: {
      MODAL: '.page__modal',
      HEADER: '.modal__header',
      ACCEPT_BUTTON: '.modal button[type=submit]',
      DECLINE_BUTTON: '.modal button[type=reset]'
    }
  },
  TEMPLATE: {
    RESULT: {
      RECORDS: '#result-records',
      COUNTERPARTY_LIST: '#result-counterparty-list',
      COUNTERPARTY_ITEM: '#result-counterparty-item',
      RESULT: '#result'
    },
    TRANSACTION: {
      LIST: '#transactions',
      ROW: '#transaction-row'
    },
    MODAL_DIALOG: '#modal-dialog'
  },
  BUTTON: {
    TRANSACTION: {
      EDIT: '.transactions__edit-button',
      DELETE: '.transactions__delete-button',
      EXPAND: '.transactions__expand-button'
    },
    MODAL: {
      ACCEPT: '.modal button[type=submit]',
      DECLINE: '.modal button[type=reset]',
      CLOSE: '.modal__close'
    }
  }
};

export const Id = {
  RECORDS: 'records',
  TRANSACTIONS_TABLE: 'transactions-table',
  COUNTERPARTIES_LIST: 'counterparties-list',
  MODAL_DIALOG: 'modal-dialog',
  NEW_COUNTERPARTY: 'new-counterparty',
  COUNTERPARTY: 'counterparty',
  TRANSACTION: 'transaction',
  CATEGORY: 'category',
  ACCOUNT: 'account'
}

export const Value = {
  TRANSACTION_EMPTY_STRING: '<span class="transactions__empty">&mdash;</span>',
  EXPANDED_TRANSACTION_ROW: 'transactions__row--expanded',
  PAGE_NOSCROLL_MODIFIER: 'page--noscroll'
};

export const Copy = {
  MODAL_DIALOG_REMOVE_TRANSACTION_HEADER: 'Удалить транзакцию?',
  MODAL_DIALOG_ACCEPT_BUTTON: 'Удалить',
  MODAL_DIALOG_DECLINE_BUTTON: 'Отмена',
};
