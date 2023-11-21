import { SHOW_ERRORS } from "../config";

/**
 * Error reporting with a formatted message. Based on this._showErrors, raises
 * error in the console or remains silent. Used for cleaner code  with values
 * from this._errorMessage.
 *
 * Example: this._error(this._errorMessage.INVALID_NODE, '.wrong-selector');
 *
 * @param {String} str  Original string with {0}, {1} and etc. values which
 *                      will be replaced by further passed arguments.
 * @param {String} arguments...
 * @returns void
 */
export default function(message, ...args) {
  if (!SHOW_ERRORS) {
    return;
  }

  const formattedMessage = message.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });

  console.error(formattedMessage);
}
