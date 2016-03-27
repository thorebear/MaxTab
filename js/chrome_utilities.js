/*
 Copyright (c) 2016 Thorbjørn Søgaard Christensen <cvcv90@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

chrome_utilities = {};

/* chrome_utilities.js.storage */
chrome_utilities.storage = {};

chrome_utilities.storage.getWinStorageId = function (wid) {
    return "_window__" + wid;
};

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
        chrome_utilities.storage._exeQueue.push("_get", wid,
            [keys, chrome_utilities.storage._exeQueue.wrapCallback(wid, callback)]);
    },
    /**
     * Insert on or more values into a window storage.
     * @param {int} wid - WindowId to set data in.
     * @param {object} obj - An object which gives each key/value pair to update storage with.
     * Any other key/value pairs in storage will not be affected.
     * @param {function} callback - Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "set": function (wid, obj, callback) {
        chrome_utilities.storage._exeQueue.push("_set", wid,
            [obj, chrome_utilities.storage._exeQueue.wrapCallback(wid, callback)]);
    },
    /**
     * Remove a or more items from a single window storage.
     * @param {int} wid - WindowId to remove from.
     * @param {string|string[]} keys - A single key or a list of keys for items to remove.
     * @param {function} callback - Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "remove": function (wid, keys, callback) {
        chrome_utilities.storage._exeQueue.push("_remove", wid,
            [keys, chrome_utilities.storage._exeQueue.wrapCallback(wid, callback)]);
    },
    /**
     * Update a value in the given window storage.
     * @param {int} wid - WindowId to update in.
     * @param {string} key - 'key' of the value to update
     * @param {function} updateValue - A function which take the old value
     * as parameter and update the value to the new value.
     * @param {function} callback - Callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "update": function (wid, key, updateValue, callback) {
        chrome_utilities.storage._exeQueue.push("_update", wid,
            [key, updateValue, chrome_utilities.storage._exeQueue.wrapCallback(wid, callback)]);
    },
    /**
     * Remove all items from a single window storage
     * @param {int} wid - WindowId to clear all data in
     * @param {function} callback - callback on success, or on failure (in which case runtime.lastError will be set).
     */
    "clear": function (wid, callback) {
        chrome_utilities.storage._exeQueue.push("_clear", wid,
            [chrome_utilities.storage._exeQueue.wrapCallback(wid, callback)]);
    },
    /**
     * Private method: Intended only for internal use.
     * @private
     */
    "_get": function(wid, keys, callback){
        var storageId =
            chrome_utilities.storage.getWinStorageId(wid);
        chrome.storage.local.get(storageId, function (items) {
            items = items[storageId];

            if (keys === null) {
                callback(items);
                return;
            }
            var json = {};
            if (typeof keys === "string") {
                // key-type: string
                if (items === undefined) {
                    callback();
                    return;
                }
                
                json[keys] = items[keys];
                callback(json);
            } else if (typeof keys === "object") {
                if (typeof keys[0] === "string") {
                    // key-type: array of strings
                    if (items === undefined) {
                        callback();
                    }

                    keys.forEach(function (_k) {
                        json[_k] = items[_k];
                    });
                    callback(json);
                } else {
                    // key-type: dictionary specifying default values

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
     * Private method: Intended only for internal use.
     * @private
     */
    "_set": function (wid, obj, callback) {
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
     * Private method: Intended only for internal use.
     * @private
     */
    "_remove": function (wid, keys, callback) {
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
     * Private method: Intended only for internal use.
     * @private
     */
    "_clear": function (wid, callback) {
        chrome.storage.local.remove(chrome_utilities.storage.getWinStorageId(wid), callback);
    },
    /**
     * Private method: Intended only for internal use.
     * @private
     */
    "_update": function (wid, key, updateValue, callback) {
        chrome_utilities.storage.window._get(wid, key, function(items) {
            if (items === undefined) {
                callback();
                return;
            }

            if (items[key] === undefined) {
                callback();
                return;
            }
            
            updateValue(items[key]);
            chrome_utilities.storage.window._set(wid, items, callback);
        });
    }
};

chrome_utilities.storage._exeQueue = {
    "executing": false,
    "queue": {},
    "wrapFunction": function(fn, params) {
        return function() {
            fn.apply(this, params);
        };
    },
    "push" : function(fn_name, wid, params) {
        if (this.queue[wid] === undefined) {
            this.queue[wid] = [];
        }
        var fn = chrome_utilities.storage.window[fn_name];
        params.unshift(wid);
        this.queue[wid].push(this.wrapFunction(fn, params));
        this.execNext(wid);
    },
    "execNext" : function(wid) {
        if (this.queue[wid].length > 0 && !this.executing) {
            this.executing = true;
            (this.queue[wid].shift())();
        }
    },
    "execEnd" : function(wid) {
        this.executing = false;
        this.execNext(wid);
    },
    "wrapCallback" : function(wid, callback) {
        return function(params) {
            if (callback !== undefined) {
                callback.call(this, params);
            }
            chrome_utilities.storage._exeQueue.execEnd(wid);
        };
    }
};


/* Window event listeners */
chrome.windows.onRemoved.addListener(function (wid) {
    chrome_utilities.storage.window.clear(wid);
});