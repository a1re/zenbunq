import {Selector, Id} from './const';
import NodeComposer from './node-composer';
import Records from './records';
import {mockData} from './mock-data';

const composer = new NodeComposer;
const records = new Records(composer);



const showTransactions = (evt) => {
  evt.preventDefault();

  records.addCounterparties(mockData.counterparts);
  records.addCategories(mockData.categories);
  records.addAccounts(mockData.accounts);

  records.rawData = mockData.transactionsCsv;
  records.insertTable(Id.TRANSACTIONS_TABLE, Selector.PAGE_CONTENT);
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.onclick = showTransactions;
