import {Selector, Value} from './const';
import NodeComposer from './node-composer';
import error from './helpers/error';

export default class Records {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object"
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
   * Shows success notification.
   * 
   * @param {String} message      - String with {0}, {1} and etc. values which
   *                                will be replaced by further passed arguments
   * @param {String} arguments...
   * @returns void
   */
  showSuccess(message, ...args) {
    const formattedMessage = message.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });

    const notificationNode = this._composer.composeNode({
      id: Selector.NOTIFICATION.ID,
      wrapper: Selector.NOTIFICATION.WRAPPER,
      template: Selector.NOTIFICATION.TEMPLATE,
      values: [{
        wrapper: Selector.NOTIFICATION.CONTENT,
        innerText: formattedMessage
      }],
      incremental: false
    });

    this._reveal(notificationNode);
  }

  /**
   * Shows error notification.
   * 
   * @param {String} message      - String with {0}, {1} and etc. values which
   *                                will be replaced by further passed arguments
   * @param {String} arguments...
   * @returns void
   */
  showError(message, ...args) {
    const formattedMessage = message.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });

    const notificationNode = this._composer.composeNode({
      id: Selector.NOTIFICATION.ID,
      wrapper: Selector.NOTIFICATION.WRAPPER,
      template: Selector.NOTIFICATION.TEMPLATE,
      values: [{
        wrapper: Selector.NOTIFICATION.CONTENT,
        innerText: formattedMessage
      }],
      incremental: false
    });
    notificationNode.classList.add(Value.ERROR_NOTIFICATION);

    this._reveal(notificationNode);
  }

  /**
   * Private method. Adds visibility class to the notification Node and adds
   * callback for the onclick event.
   * 
   * @param  {Element} notificationNode - Node of the notification
   * @returns void
   */
  _reveal(notificationNode) {
    const closeButton = notificationNode.querySelector(Selector.NOTIFICATION.CLOSE_BUTTON);
    if (closeButton) {
      closeButton.onclick = (evt) => {
        notificationNode.classList.remove(Value.VISIBLE_NOTIFICATION);
        setTimeout(() => {
          evt.target.onclick = undefined;
          this._composer.removeNode(notificationNode);
        }, Value.NOTIFICATION_REVEAL_TIMEOUT)
      }
    }

    setTimeout(() => {
      notificationNode.classList.add(Value.VISIBLE_NOTIFICATION);
    }, Value.NOTIFICATION_REVEAL_TIMEOUT)
  }
}