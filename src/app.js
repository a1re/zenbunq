import {Selector, Id} from './const';
import NodeComposer from './node-composer';
import Transactions from './transactions';
import {mockData} from './mock-data';

const composer = new NodeComposer;
const transactions = new Transactions(composer);

const showTransactions = (evt) => {
  evt.preventDefault();

  transactions.uploadData(mockData.transactions);
  transactions.insertTable(Id.TRANSACTIONS_TABLE, Selector.PAGE_CONTENT);
};

const uploadButton = document.querySelector(Selector.UPLOAD_BUTTON);
uploadButton.onclick = showTransactions;
