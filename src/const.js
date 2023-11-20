export const Selector = {
  PAGE_CONTENT: '.page__content',
  UPLOAD_BUTTON: '.panel__file-submit',
  WRAPPER: {
    TRANSACTION: {
      ROW: '.transactions',
      LIST: '.result__records',
      DATE: '.transactions__date',
      CATEGORY: '.transactions__category',
      COUNTERPARTY: '.transactions__counterpart',
      PAYER: '.transactions__payer',
      PAYEE: '.transactions__payee',
      SUM: '.transactions__sum',
      COMMENT: '.transactions__comment'
    },
    RESULT : {
      RECORDS: '.result'
    }
  },
  TEMPLATE: {
    RESULT: {
      RECORDS: '#result-records',
      CONTENT: '#result'
    },
    TRANSACTION: {
      LIST: '#transactions',
      ROW: '#transactions-row'
    }
  },
  BUTTON: {
    TRANSACTION: {
      EDIT: '.transactions__edit-button',
      DELETE: '.transactions__delete-button',
      EXPAND: '.transactions__expand-button'
    }
  }
};

export const Id = {
  TRANSACTIONS_TABLE: 'transactions-table'
}

export const Value = {
  TRANSACTION_EMPTY_STRING: '<span class="transactions__empty">&mdash;</span>',
  EXPANDED_TRANSACTION_ROW: 'transactions__row--expanded'
};
