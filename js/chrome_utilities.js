/*
    Created by: TODO
 */
chrome_utilities = {};

/* chrome_utilities.js.storage */
chrome_utilities.storage = {};

chrome_utilities.storage.getWinStorageId = function(wid) {
    return "_window__" + wid;
}

chrome_utilities.storage.window = {
    /**
     *
     * @param {int} wid - WindowId to get data from.
     * @param {(string|string[]|object)} keys - A single key to get, list of keys to get, or a dictionary specifying
     * default values. Pass in null to get the entire contents of storage.
     * @param {function} callback - callback with storage items, or on failure (in which case runtime.lastError will be set).
     */
    "get": function (wid, keys, callback) {
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);
        chrome.storage.local.get(storageId, function(items) {
            items = items[storageId];
            if (typeof keys === "string") {
                // key-type: string
                var json = {};
                json[keys] = items[keys];
                callback(json);
            } else if (typeof keys === "object") {
                if (typeof keys[0] === "string") {
                    // key-type: array of strings
                    var json = {};
                    keys.forEach(function(_k) {
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

                    Object.keys(keys).forEach(function(_k) {
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
    "remove": function (wid, toRemove, callback) {
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);

        chrome.storage.local.get(storageId, function (items) {
            var json = items[storageId];
            if (json !== undefined) {
                if (typeof toRemove === "string") {
                    delete json[toRemove];
                } else {
                    toRemove.forEach(function(key) {
                        delete json[key];
                    });
                }
            }

            var newJson = {};
            newJson[storageId] = json;
            chrome.storage.local.set(newJson, callback);
        });
    },
    "clear": function (wid, callback) {
        chrome.storage.local.remove(chrome_utilities.storage.getWinStorageId(wid), callback);
    }
};

/* Window event listeners */
chrome.windows.onRemoved.addListener(function(wid) {
    chrome_utilities.storage.window.clear(wid);
});