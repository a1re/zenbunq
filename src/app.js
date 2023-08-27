import {Selector} from './const';
import NodeComposer from './node-composer';

const composer = new NodeComposer(NodeComposer.ERROR_MODE);
composer.composeNode({
  wrapper: Selector.PAGE_CONTENT,
  template: Selector.RESULT_TEMPLATE,
  children: [{
    wrapper: Selector.RESULT_RECORDS_WRAPPER,
    template: Selector.RESULT_RECORDS_TEMPLATE,
    children: [{
      wrapper: Selector.TRANSACTIONS_WRAPPER,
      template: Selector.TRANSACTIONS_TEMPLATE
    }]
  }]
});
