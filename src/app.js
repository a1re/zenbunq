import {Selector, Id} from './const';
import NodeComposer from './node-composer';
import Records from './records';
import {mockData} from './mock-data';
import adaptTransactions from './helpers/adapt-transactions';

const composer = new NodeComposer;
const records = new Records(composer);

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

  const transactions = adaptTransactions(
    mockData.transactionsCsv,
    mockData.counterparties,
    mockData.accounts
  );

  records.transactions = transactions;
  records.insertNewCounterparties(Id.COUNTERPARTIES_LIST, Selector.WRAPPER.RESULT.RESULT);
  records.insertTable(Id.TRANSACTIONS_TABLE, Selector.WRAPPER.RESULT.RESULT);
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.onclick = showTransactions;
