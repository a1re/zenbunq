import {Selector, Value} from '../const';
import NodeComposer from '../node-composer';
import FormField from './form-field';
import error from './error';

export default class ModalWindow {
  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_COMPOSER: "Invalid composer object",
    CLOSE_BUTTON_NOT_FOUND: "Close button not found",
    ACCEPT_BUTTON_NOT_FOUND: "Acccept button not found",
    ACCEPT_CALLBACK_NOT_DEFINED: "Accept callback not defined",
    DECLINE_BUTTON_NOT_FOUND: "Acccept button not found",
    DECLINE_CALLBACK_NOT_DEFINED: "Decline callback not defined",
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
    this.formField = new FormField(composer);
  }

  /**
   * Show a modal window with a form
   * 
   * @param   {String} options.header            - Title of the form in the window
   * @param   {String} options.template          - Selector of the template inside the modal window
   * @param   {Array} options.fields             - List of objects, that describe form fields for
   *                                               the FormField.set method
   * @param   {Function} options.acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} options.declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showForm({header, template, fields, acceptCallback, declineCallback}) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._showModal({
      header,
      template,
      afterInsert: (element) => {
        fields.forEach((fiedData) => {
          this.formField.set({element, ...fiedData})
        });
      },
      beforeUnset: (element) => {
        const fieldSelectors = fields.map(({fieldSelector}) => fieldSelector);
        this.formField.unset(element, ...fieldSelectors);
      },
      acceptCallback,
      declineCallback
    })
  }

  /**
   * Shows a confirmation dialog with callbacks for "Submit" and "Decline" buttons.
   *
   * @param   {String} options.prompt              - Dialog prompt (title of the modal window)
   * @param   {Function} options.acceptButtonCopy  - Function called after showing the modal window
   * @param   {Function} options.declineButtonCopy - Function called after showing the modal window
   * @param   {Function} options.acceptCallback    - Callback to be called on pressing "Submit" button
   * @param   {Function} options.declineCallback   - Callback to be called on pressing "Decline" button
   * @returns void
   */
  showConfirmationModal({prompt, acceptButtonCopy, declineButtonCopy, acceptCallback, declineCallback}) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._showModal({
      header: prompt,
      template: Selector.MODAL.CONFIRMATION_DIALOG.TEMPLATE,
      afterInsert: (element) => {
        const acceptButton = element.querySelector(Selector.MODAL.BUTTON.ACCEPT);
        if (acceptButton) {
          acceptButton.innerText = acceptButtonCopy;
        }

        const declineButton = element.querySelector(Selector.MODAL.BUTTON.DECLINE);
        if (declineButton) {
          declineButton.innerText = declineButtonCopy;
        }
      },
      acceptCallback,
      declineCallback
    });
  }

  /**
   * Private master method for opening a modal window.
   *
   * @param   {String} options.header            - Title of the modal window
   * @param   {String} options.template          - Selector of the template inside the modal window
   * @param   {Function} options.afterInsert     - Function called after showing the modal window
   * @param   {Function} options.beforeUnset     - Function called after showing the modal window
   * @param   {Function} options.acceptCallback  - Callback to be called on pressing "Submit" button
   * @param   {Function} options.declineCallback - Callback to be called on pressing "Decline" button
   * @returns void
   */
  _showModal({header, template, afterInsert, beforeUnset, acceptCallback, declineCallback}) {
    const page = document.querySelector(Selector.PAGE);
    page.classList.add(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.composeNode({
      id: Selector.MODAL.ID,
      wrapper: Selector.MODAL.WRAPPER,
      template: Selector.MODAL.TEMPLATE,
      children: [{ wrapper: Selector.MODAL.CONTENT.WRAPPER, template }],
      values: [{ wrapper: Selector.MODAL.CONTENT.HEADER, innerText: header }],
      afterInsert: (element) => {
        element.style.top = window.scrollY + 'px';

        const closeButton = element.querySelector(Selector.MODAL.BUTTON.CLOSE);
        if (closeButton) {
          closeButton.onclick = () => {
            this.hideModal();
          };
        } else {
          error(this._errorMessage.CLOSE_BUTTON_NOT_FOUND);
        }

        const acceptButton = element.querySelector(Selector.MODAL.BUTTON.ACCEPT);
        if (acceptButton && typeof acceptCallback === 'function') {
          acceptButton.onclick = acceptCallback;
        }

        const declineButton = element.querySelector(Selector.MODAL.BUTTON.DECLINE);
        if (declineButton && typeof declineCallback === 'function') {
          declineButton.onclick = declineCallback;
        }

        document.onkeyup = (evt) => {
          if (evt.key === 'Escape') {
            this.hideModal();
          }
        }

        if (afterInsert) {
          afterInsert(element);
        }

      },
      beforeUnset: (element) => {
        const closeButton = element.querySelector(Selector.MODAL.BUTTON.CLOSE);
        closeButton.onclick = null;
        document.onkeyup = null;

        if (beforeUnset) {
          beforeUnset(element);
        }
      }
    });
  }

  /**
   * Hides confirmation dialog.
   *
   * @param   {String} id - Id of the window to hide
   * @returns void
   */
  hideModal() {
    const page = document.querySelector(Selector.PAGE);
    page.classList.remove(Value.PAGE_NOSCROLL_MODIFIER);

    this._composer.removeNode(Selector.MODAL.ID);
  }
}