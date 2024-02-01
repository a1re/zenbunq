import error from './helpers/error';

export default class Data {

  /**
   * Array for data entries. Each entry is an object
   * with the following structure:
   * {
   *  id: this._name + index number
   *  value: entry values
   * }
   *
   * Entry values can be of any type: Number, Array,
   * Objecs, Function, etc.
   */
  _entries = [];

  /**
   * Private value with error messages to make the code cleaner and get rid of
   * hefty code lines. Used with error().
   */
  _errorMessage = {
    INVALID_DATA: "Data should be an array",
  }

  /**
   * Class constructor. Sets name and passes data with adapter callback (optional)
   * to this.set().
   *
   * @param {String}   options.name            - Name of data (used as a prefix
   *                                             for entry ids)
   * @param {Array}    options.data            - Array of entries (data)
   * @param {Function} options.adapterCallback - Function that should be applied
   *                                             to each entry before is is saved
   *                                             in the this._entries
   * @param {Boolean}  options.skipFirstEntry  - If true, first entry will be skipped
   */
  constructor(options) {
    this._name = options.name || "data";
    const data = options.data || [];
    const adapterCallback = options.adapterCallback || undefined;
    const skipFirstEntry = options.skipFirstEntry || false;
    this.set(data, adapterCallback, skipFirstEntry);
  }

  /**
   * Adds data to this._entries. Parameter 'data' should be an array.
   * if adapterCallback is specified and is a function, it is applied
   * to each array entry as adapterCallback(entry) and the result is
   * pushed to this._entries.
   *
   * @param   {Array}    data            - Array of data to be added to this._entries
   * @param   {Boolean}
   * @param   {Function} adapterCallback - Function that should be applied to each entry
   *                                       before is is saved in the this._entries
   * @returns void
   */
  set(data, adapterCallback, skipFirstEntry) {
    if (!Array.isArray(data)) {
      error(this._errorMessage.INVALID_DATA);
      return;
    }

    data.forEach((entry, i) => {
      const id = this._name + i;

      if (skipFirstEntry && i === 0) {
        return
      }

      if (typeof adapterCallback === 'function') {
        const adaptedEntry = adapterCallback(entry);
        if (adaptedEntry) {
          this._entries.push({id, value: adaptedEntry});
        }
      } else {
        this._entries.push({id, value: entry});
      }
    });
  }

  /**
   * Data retrieval.
   *
   * @param   {Boolean} includeId - If true, this._entries structure is preserved
   *                                and method returns an shallow copy array of objects
   *                                with 'id' and 'value' attributes. If false each
   *                                entry of the array is directly the value of 'value'.
   * @returns {Array} -
   */
  get(includeId) {
    if (includeId == true) {
      return [...this._entries];
    } else {
      return this._entries.map((entry) => entry.value);
    }
  }

  /**
   * Searches the this._entries for the first value with a callback.
   *
   * @param   {Function} callback - Callback that should be applied to each entry
   * @returns {*} - 'value' attribute of the found entry or 'undefined'
   */
  find(callback) {
    const foundEntry = this._entries.find((entry) => callback(entry.value));
    return (foundEntry) ? foundEntry.value : undefined;
  }

  /**
   * Filters the this._entries for the values with a callback.
   *
   * @param   {Function} callback - Callback that should be applied to each entry
   * @param   {Boolean} includeId - If true, this._entries structure is preserved
   *                                and method returns an shallow copy array of objects
   *                                with 'id' and 'value' attributes. If false each
   *                                entry of the array is directly the value of 'value'.
   * @returns {*} - 'value' attribute of the found entry or 'undefined'
   */
  filter(callback, includeId) {
    const foundEntries = [];

    this._entries.forEach((entry) => {
      if(callback(entry.value)) {
        foundEntries.push(includeId ? entry : entry.value);
      }
    });

    return foundEntries;
  }

  /**
   * Searches the this._entries for the value with entryId.
   *
   * @param   {String} entryId - Id of the searched entry
   * @returns {*} - 'value' attribute of the found entry or 'undefined'
   */
  findById(entryId) {
    const foundEntry = this._entries.find((entry) => entry.id === entryId);
    return (foundEntry) ? foundEntry.value : undefined;
  }

  /**
   * Adds a new entry to this._entries and assigns an id to it.
   *
   * @param   {*} entry - New entry for this._entries
   * @returns {Strigs}  - Id of the added entry
   */
  add(entry) {
    const lastIndex = (this._entries.length > 0)
      ? parseInt(this._entries[this._entries.length-1].id.substr(this._name.length), 10)
      : 0;

    const id = this._name + (lastIndex + 1);
    this._entries.push({id, value:entry});

    return id;
  }

  /**
   * Searches for entry with 'entryId' and updates it with 'value'. Returns
   * true if operation succeeded and false if not.
   *
   * @param   {*} entryId  - Id of the searched entry
   * @param   {*} value    - New value of the entry
   * @returns {Boolean} - true if operation succeeded, false if not
   */
  update(entryId, value) {
    const entryIndex = this._entries.findIndex((entry) => entry.id === entryId);

    if (entryIndex === -1) {
      return false;
    }

    this._entries = [
      ...this._entries.slice(0, entryIndex),
      {id:entryId, value},
      ...this._entries.slice(entryIndex + 1)
    ];

    return true;
  }

  /**
   * Searches for entry with 'entryId' and removes it. Returns true if operation
   * succeeded and false if not.
   *
   * @param   {*} entryId  - Id of the searched entry
   * @returns {Boolean} - true if operation succeeded, false if not
   */
  remove(entryId) {
    const entryIndex = this._entries.findIndex((entry) => entry.id === entryId);

    if (entryIndex === -1) {
      return false;
    }

    this._entries = [
      ...this._entries.slice(0, entryIndex),
      ...this._entries.slice(entryIndex + 1)
    ];

    return true;
  }

  /**
   * Sorting method, that uses sortCallback for entry.value, so entry values
   * can be accessed directly from callback.
   *
   * @param {Function} sortCallback - Sorting callback
   */
  sort(sortCallback) {
    this._entries.sort((entry) => sortCallback(entry.value))
  }

  /**
   * Dynamic attribute, representing the amount of entries in data entity.
   *
   * @returns {Number} - amount of rows
   */
  get length() {
    return this._entries.length;
  }
}
