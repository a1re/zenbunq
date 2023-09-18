import {Selector, Value} from './const';
import NodeComposer from './node-composer';
import {mockData} from './mock-data';

const composer = new NodeComposer(NodeComposer.ERROR_MODE);

const showTransactions = (evt) => {
  evt.preventDefault();

  const transactionRecords = [];
  const transactionIdPrefix = 'transaction-';

  for (let i = 0; i < mockData.transactions.length; i++) {
    transactionRecords.push({
      id: transactionIdPrefix + i,
      wrapper: Selector.TRANSACTIONS_ROW_WRAPPER,
      template: Selector.TRANSACTIONS_ROW_TEMPLATE,
      values: [
        {
          wrapper: Selector.TRANSACTION_DATE_WRAPPER,
          innerHTML: mockData.transactions[i].date || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.TRANSACTION_CATEGORY_WRAPPER,
          innerHTML: mockData.transactions[i].category || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.TRANSACTION_COUNTERPART_WRAPPER,
          innerHTML: mockData.transactions[i].counterpart || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.TRANSACTION_PAYER_WRAPPER,
          innerHTML: mockData.transactions[i].payer || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.TRANSACTION_PAYEE_WRAPPER,
          innerHTML: mockData.transactions[i].payee || Value.TRANSACTION_EMPTY_STRING
        },
        {
          wrapper: Selector.TRANSACTION_SUM_WRAPPER,
          innerHTML: mockData.transactions[i].sum
        },
        {
          wrapper: Selector.TRANSACTION_COMMENT_WRAPPER,
          innerHTML: mockData.transactions[i].comment || ''
        }
      ]
    });
  }

  composer.composeNode({
    id: 'results',
    wrapper: Selector.PAGE_CONTENT,
    template: Selector.RESULT_TEMPLATE,
    children: [{
      wrapper: Selector.RESULT_RECORDS_WRAPPER,
      template: Selector.RESULT_RECORDS_TEMPLATE,
      children: [{
        id: 'transactions-table',
        wrapper: Selector.TRANSACTIONS_WRAPPER,
        template: Selector.TRANSACTIONS_TEMPLATE,
        children: transactionRecords
      }]
    }],
    incremental: false
  });
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.addEventListener('click', showTransactions);
