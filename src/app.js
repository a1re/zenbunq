import {Selector} from './const';
import {getNode, getNodeFromTemplate, placeNode} from './utils';

const resultsFragment = document.createDocumentFragment();
const resultNode = getNodeFromTemplate(Selector.RESULT_TEMPLATE)
const recordsNode = getNodeFromTemplate(Selector.RESULT_RECORDS_TEMPLATE)
const transactionsNode = getNodeFromTemplate(Selector.TRANSACTIONS_TEMPLATE)

placeNode(resultsFragment, resultNode);
placeNode(getNode(Selector.RESULT_RECORDS_WRAPPER, resultsFragment), recordsNode);
placeNode(getNode(Selector.TRANSACTIONS_WRAPPER, resultsFragment), transactionsNode);
placeNode(getNode(Selector.PAGE_CONTENT), resultsFragment);
