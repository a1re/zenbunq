import { Copy, Selector, Value } from './const';
import NodeComposer from './node-composer';
import Records from './records';
import { mockData } from './mock-data';
import { CSV } from './config';
import getTransactionsAdapter from './helpers/get-transactions-adapter';
import Data from './data';
import Notification from './notification';
import error from './helpers/error';
import Papa from 'papaparse';

const _errorMessage = {
  FILE_NOT_FOUND: "Uploaded file not defined",
  FILE_LABEL_NOT_FOUND: "File label field not found"
};

const composer = new NodeComposer;
const records = new Records(composer);
const notification = new Notification(composer);

const counterparties = new Data({ name: Selector.COUNTERPARTIES.ITEM.ID, data: mockData.counterparties });
const categories = new Data({ name: Selector.CATEGORIES.ITEM.ID, data: mockData.categories });
const accounts = new Data({ name: Selector.ACCOUNTS.ITEM.ID, data: mockData.accounts });

const showTransactions = (evt) => {
  if (!evt.target.result) {
    notification.showError(Copy.FILE_UPLOAD.FILE_NOT_LOADED);
    return;
  }

  const parsedCSV = Papa.parse(evt.target.result);

  if (parsedCSV.errors.length > 0) {
    notification.showError(Copy.FILE_UPLOAD.FILE_NOT_LOADED);
    return;
  }

  const transactions = new Data({
    name: Selector.TRANSACTIONS.ITEM.ID,
    data: parsedCSV.data,
    adapterCallback: getTransactionsAdapter(counterparties.get(), accounts.get()),
    skipFirstEntry: CSV.HAS_HEADER
  });

  if (transactions.length === 0) {
    notification.showError(Copy.FILE_UPLOAD.FILE_NOT_LOADED);
    return;
  }

  notification.showSuccess(Copy.FILE_UPLOAD.SUCCESS, transactions.length, parsedCSV.data.length);

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


const selectFileButton = document.querySelector(Selector.FILE_FORM);
const fileLabel = document.querySelector(Selector.FILE_LABEL);
selectFileButton.onchange = (evt) => {
  if (!fileLabel) {
    error(_errorMessage.FILE_LABEL_NOT_FOUND);
  }

  if (!evt.target.files[0]) {
    fileLabel.classList.add(Value.UPLOAD_FILE_EMPTY);
    return
  }

  const selectedFile = evt.target.files[0];

  fileLabel.innerText = selectedFile ? selectedFile.name : '';
  fileLabel.classList.remove(Value.EMPTY_UPLOADED_FILE);
  
  if (selectedFile.type !== "text/csv") {
    notification.showError(Copy.FILE_UPLOAD.INCORRECT_FILE_TYPE);
    return;
  }
  
  if (selectedFile.size > Value.FILE_UPLOAD_LIMIT) {
    notification.showError(Copy.FILE_UPLOAD.INCORRECT_FILE_SIZE);
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = showTransactions
  fileReader.readAsText(selectedFile);
}
