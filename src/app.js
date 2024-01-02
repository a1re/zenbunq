import { Copy, Selector, Value } from './const';
import NodeComposer from './node-composer';
import Records from './records';
import { CSV, RESOURCE } from './config';
import getTransactionsAdapter from './helpers/get-transactions-adapter';
import Data from './data';
import Notification from './notification';
import error from './helpers/error';
import Papa from 'papaparse';
import Settings from './settings';

const _errorMessage = {
  FILE_NOT_FOUND: "Uploaded file not defined",
  FILE_LABEL_NOT_FOUND: "File label field not found"
};

const composer = new NodeComposer;
const notification = new Notification(composer);

const loadResources = () => Promise.all(
    [RESOURCE.ACCOUNTS, RESOURCE.CATEGORIES, RESOURCE.COUNTERPARTIES]
    .map((url) => fetch(url, { headers: { "Content-Type": "application/json" } }))
  ).then((responses) => {
  const responseErrors = [Copy.ACCOUNTS_NOT_LOADED, Copy.CATEGORIES_NOT_LOADED, Copy.COUNTERPARTIES_NOT_LOADED];
  responses.forEach((response, i) => {
    if (!response.ok) {
      throw new Error(responseErrors[i]);
    }
  });
  
  return Promise.all(responses.map(response => response.json()));
});

const showTransactions = (evt) => {
  if (!evt.target.result) {
    notification.showError(Copy.FILE_UPLOAD.FILE_NOT_LOADED);
    return;
  }

  loadResources().then((responses) => {
    const accounts = new Data({ name: Selector.ACCOUNTS.ITEM.ID, data: responses[0] });
    const categories = new Data({ name: Selector.CATEGORIES.ITEM.ID, data: responses[1] });
    const counterparties = new Data({ name: Selector.COUNTERPARTIES.ITEM.ID, data: responses[2] });

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

    if (document.querySelector(Selector.SETTINGS.ID)) {
      composer.removeNode(Selector.SETTINGS.ID);
    }
  
    composer.composeNode({
      id: Selector.RESULT.ID,
      wrapper: Selector.PAGE_CONTENT,
      template: Selector.RESULT.TEMPLATE
    });
  
    const records = new Records(composer);
    records.counterparties = counterparties;
    records.categories = categories;
    records.accounts = accounts;
    records.transactions = transactions;
    records.insertNewCounterparties(Selector.COUNTERPARTIES.LIST.ID, Selector.RESULT.WRAPPER);
    records.insertTable(Selector.TRANSACTIONS.LIST.ID, Selector.RESULT.WRAPPER);
  }).catch(({message}) => {
    notification.showError(message);
  });
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

const settingsButton = document.querySelector(Selector.SETTINGS.BUTTON);
settingsButton.onclick = (evt) => {
  evt.preventDefault();

  fileLabel.innerText = Copy.FILE_UPLOAD.FILE_NOT_SELECTED;
  fileLabel.classList.add(Value.EMPTY_UPLOADED_FILE);
  loadResources().then((data) => {
    const settings = new Settings(composer);

    settings.accounts = new Data({ name: Selector.ACCOUNTS.ITEM.ID, data: data[0] });
    settings.categories = new Data({ name: Selector.CATEGORIES.ITEM.ID, data: data[1] });
    settings.counterparties = new Data({ name: Selector.COUNTERPARTIES.ITEM.ID, data: data[2] });

    composer.composeNode({
      id: Selector.SETTINGS.ID,
      wrapper: Selector.PAGE_CONTENT,
      template: Selector.SETTINGS.TEMPLATE,
      incremental: false
    });
  
    settings.insertAccounts(Selector.SETTINGS.ACCOUNTS.WRAPPER);
    settings.insertCategories(Selector.SETTINGS.CATEGORIES.WRAPPER);
    settings.insertCounterparties(Selector.SETTINGS.COUNTERPARTIES.WRAPPER);

  }).catch(({message}) => {
    notification.showError(message);
  });
}