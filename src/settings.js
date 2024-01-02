import {Selector, Value, Copy} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';
import Data from './data';

export default class Settings {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    INVALID_DATA: "Invalid data connection: '{0}' should be an instance of Data",
  }

  /**
   * Class constructor. Needs an instance of NodeComposer to be initialized.
   *
   * @param   {NodeComposer} composer  - Instance of NodeComposer for the page
   * @returns void
   */
  constructor(composer) {
    if (!(composer instanceof NodeComposer)) {
      error(this._errorMessage.INVALID_COMPOSER);
      return;
    }

    this._composer = composer;
  }

  /**
   * Setter for this._accounts
   */
  set accounts(accounts) {
    if (!(accounts instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.ACCOUNTS.ITEM.ID);
      return;
    }

    this._accounts = accounts;
  }

  /**
   * Setter for this._categories
   */
  set categories(categories) {
    if (!(categories instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.CATEGORIES.ITEM.ID);
      return;
    }

    this._categories = categories;
  }


  /**
   * Setter for this._counterparties
   */
  set counterparties(counterparties) {
    if (!(counterparties instanceof Data)) {
      error(this._errorMessage.INVALID_DATA, Selector.COUNTERPARTIES.ITEM.ID);
      return;
    }

    this._counterparties = counterparties;
  }

  /**
   * Inserts the list of account cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of accounts
   * @returns @void
   */
  insertAccounts(wrapper) {
    const accounts = this._accounts.get(true).map((account) => {
      return {
        id: account.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.ACCOUNTS.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.ACCOUNTS.CARD.KEY,
            innerText: account.value.key
          },
          {
            wrapper: Selector.SETTINGS.ACCOUNTS.CARD.NAME,
            innerText: account.value.label
          }
        ]
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.ACCOUNTS.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: accounts,
      incremental: false
    });
  }

  /**
   * Inserts the list of account cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of accounts
   * @returns @void
   */
  insertCategories(wrapper) {
    const categories = this._categories.get(true).map((category) => {
      return {
        id: category.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.CATEGORIES.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.CATEGORIES.CARD.NAME,
            innerText: account.value.category
          }
        ]
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.ACCOUNTS.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: categories,
      incremental: false
    });
  }

  /**
   * Inserts the list of category cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of categories
   * @returns @void
   */
  insertCategories(wrapper) {
    const categories = this._categories.get(true).map((category) => {
      return {
        id: category.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.CATEGORIES.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.CATEGORIES.CARD.NAME,
            innerText: category.value
          }
        ]
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.CATEGORIES.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: categories,
      incremental: false
    });
  }

  /**
   * Inserts the list of counterparty cards to the page.
   * 
   * @param  {String/Element} wrapper - Selector of the DOM Node or Node itself that
   *                                    will be filled with the list of counterparties
   * @returns @void
   */
  insertCounterparties(wrapper) {
    const counterparties = this._counterparties.get(true).map((counterparty) => {
      return {
        id: counterparty.id,
        wrapper: Selector.SETTINGS.LIST.WRAPPER,
        template: Selector.SETTINGS.COUNTERPARTIES.TEMPLATE,
        values: [
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.CATEGORY,
            innerText: counterparty.value.category
          },
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.KEY,
            innerText: counterparty.value.key
          },
          {
            wrapper: Selector.SETTINGS.COUNTERPARTIES.CARD.NAME,
            innerText: counterparty.value.label
          }
        ]
      }
    });

    this._composer.composeNode({
      id: Selector.SETTINGS.COUNTERPARTIES.ID,
      wrapper: wrapper,
      template: Selector.SETTINGS.LIST.TEMPLATE,
      children: counterparties,
      incremental: false
    });
  }
}