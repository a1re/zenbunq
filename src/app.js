import { Selector, Copy } from './const';
import NodeComposer from './node-composer';
import Records from './records';
import { mockData } from './mock-data';
import { CSV } from './config';
import getTransactionsAdapter from './helpers/get-transactions-adapter';
import Data from './data';

const composer = new NodeComposer;
const records = new Records(composer);

const counterparties = new Data({ name: Selector.COUNTERPARTIES.ITEM.ID, data: mockData.counterparties });
const categories = new Data({ name: Selector.CATEGORIES.ITEM.ID, data: mockData.categories });
const accounts = new Data({ name: Selector.ACCOUNTS.ITEM.ID, data: mockData.accounts });
const transactions = new Data({
  name: Selector.TRANSACTIONS.ITEM.ID,
  data: mockData.transactionsCsv,
  adapterCallback: getTransactionsAdapter(counterparties.get(), accounts.get()),
  skipFirstEntry: CSV.HAS_HEADER
});

const showTransactions = (evt) => {
  evt.preventDefault();

  if (document.querySelector(Selector.RESULT.ID)) {
    composer.removeNode(Selector.RESULT.ID);
  }

  composer.composeNode({
    id: Selector.RESULT.ID,
    wrapper: Selector.PAGE_CONTENT,
    template: Selector.RESULT.TEMPLATE
  });

  records.counterparties = counterparties;
  records.categories = categories;
  records.accounts = accounts;
  records.transactions = transactions;
  records.insertNewCounterparties(Selector.COUNTERPARTIES.LIST.ID, Selector.RESULT.WRAPPER);
  records.insertTable(Selector.TRANSACTIONS.LIST.ID, Selector.RESULT.WRAPPER);
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.onclick = showTransactions;
