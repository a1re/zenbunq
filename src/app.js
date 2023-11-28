import { Selector, Id, Value } from './const';
import NodeComposer from './node-composer';
import Records from './records';
import { mockData } from './mock-data';
import { CSV } from './config';
import getTransactionsAdapter from './helpers/get-transactions-adapter';
import Data from './data';

const composer = new NodeComposer;
const records = new Records(composer);

const counterparties = new Data({ name:Id.COUNTERPARTY, data:mockData.counterparties });
const categories = new Data({ name:Id.CATEGORY, data:mockData.categories });
const accounts = new Data({ name:Id.ACCOUNT, data:mockData.accounts });
const transactions = new Data({
  name: Id.TRANSACTION,
  data: mockData.transactionsCsv,
  adapterCallback: getTransactionsAdapter(counterparties.get(), accounts.get()),
  skipFirstEntry: CSV.HAS_HEADER
});

const showTransactions = (evt) => {
  evt.preventDefault();

  if (document.querySelector('#' + Id.RECORDS)) {
    composer.removeNode(Id.RECORDS);
  }

  composer.composeNode({
    id: Id.RECORDS,
    wrapper: Selector.PAGE_CONTENT,
    template: Selector.TEMPLATE.RESULT.RESULT
  });

  records.counterparties = counterparties;
  records.categories = categories;
  records.accounts = accounts;
  records.transactions = transactions;
  records.insertNewCounterparties(Id.COUNTERPARTIES_LIST, Selector.WRAPPER.RESULT.RESULT);
  records.insertTable(Id.TRANSACTIONS_TABLE, Selector.WRAPPER.RESULT.RESULT);
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.onclick = showTransactions;
