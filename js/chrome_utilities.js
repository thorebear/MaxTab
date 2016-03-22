/*
 Created by: TODO
 */
chrome_utilities = {};

/* chrome_utilities.js.storage */
chrome_utilities.storage = {};

chrome_utilities.storage.getWinStorageId = function (wid) {
    return "_window__" + wid;
}

chrome_utilities.storage.window = {
    /**
     * Get on or more values from a single window storage.
     * @param {int} wid - WindowId to get data from.
     * @param {(string|string[]|object)} keys - A single key to get, list of keys to get, or a dictionary specifying
     * default values. Pass in null to get the entire contents of storage.
     * @param {function} callback - callback with storage items as parameter,
     * or on failure (in which case runtime.lastError will be set).
     */
    "get": function (wid, keys, callback) {
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);
        chrome.storage.local.get(storageId, function (items) {
            items = items[storageId];

            if (keys === null) {
                callback(items);
                return;
            }

            if (typeof keys === "string") {
                // key-type: string
                if (items === undefined) {
                    callback();
                }

                var json = {};
                json[keys] = items[keys];
                callback(json);
            } else if (typeof keys === "object") {
                if (typeof keys[0] === "string") {
                    // key-type: array of strings
                    if (items === undefined) {
                        callback();
                    }

                    var json = {};
                    keys.forEach(function (_k) {
                        json[_k] = items[_k];
                    });
                    callback(json);
                } else {
                    // key-type: dictionary specifying default values
                    var json = {};

                    /*
                     If there exist no values in the storage, items will be undefined,
                     in this case we can just return the 'default' value object.
                     */
                    if (items === undefined) {
                        callback(keys);
                        return;
                    }

                    Object.keys(keys).forEach(function (_k) {
                        if (items[_k] === undefined) {
                            json[_k] = keys[_k];
                        } else {
                            json[_k] = items[_k];
                        }
                    });
                    callback(json);
                }
            }
        });
    },
    /**
     * Insert on or more values into a window storage.
     * @param {int} wid - WindowId to set data in.
     * @param {object} obj - An object which gives each key/value pair to update storage with.
     * Any other key/value pairs in storage will not be affected.
     * @param {function} callback - Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "set": function (wid, obj, callback) {
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);
        chrome.storage.local.get(storageId, function (items) {
            var json = items[storageId];
            if (json === undefined) {
                json = {};
            }
            Object.keys(obj).forEach(function (_k) {
                json[_k] = obj[_k];
            });

            var newJson = {};
            newJson[storageId] = json;
            chrome.storage.local.set(newJson, callback);
        });

    },
    /**
     * Remove a or more items from a single window storage.
     * @param {int} wid - WindowId to - remove from.
     * @param {string|string[]} keys - A single key or a list of keys for items to remove.
     * @param {function} callback - Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "remove": function (wid, keys, callback) {
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);

        chrome.storage.local.get(storageId, function (items) {
            var json = items[storageId];
            if (json !== undefined) {
                if (typeof keys === "string") {
                    delete json[keys];
                } else {
                    keys.forEach(function (key) {
                        delete json[key];
                    });
                }
            }

            var newJson = {};
            newJson[storageId] = json;
            chrome.storage.local.set(newJson, callback);
        });
    },
    /**
     * Remove all items from a single window storage
     * @param {int} wid - WindowId to clear all data in
     * @param {function} callback - callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "clear": function (wid, callback) {
        chrome.storage.local.remove(chrome_utilities.storage.getWinStorageId(wid), callback);
    }

};

/* Window event listeners */
chrome.windows.onRemoved.addListener(function (wid) {
    /*
    We wait a little while before removing the window storage after the
    window is closed to ensure that every other operation working on the
    storage has terminated.
     */
    setTimeout(function() {
        chrome_utilities.storage.window.clear(wid);
    }, 100);
});