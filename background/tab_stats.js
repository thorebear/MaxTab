tab_stats = {};

tab_stats = {
    "addTabStats": function (wid, tabs, callback) {
        var tids = tabs.map(function(tab) { return "_tab__" + tab.id });

        chrome_utilities.storage.window.get(wid, tids, function(tab_stats) {
            tabs.forEach(function(tab) {
                var tab_stat = tab_stats["_tab__" + tab.id];
                if (tab_stat !== undefined) {
                    Object.keys(tab_stat).forEach(function (stat) {
                        tab[stat] = tab_stat[stat];
                    });
                }
            });
            callback(tabs);
        });
    },
    "getLeastRecentlyActivatedTab": function (wid, allowPinned, callback) {
        this._getMin(wid, allowPinned, "last_active", callback);
    },
    "getLeastRecentlyOpenedTab" : function (wid, allowPinned, callback) {
        this._getMin(wid, allowPinned, "opened_time", callback);
    },
    "getLeastRecentlyUpdatedTab" : function (wid, allowPinned, callback) {
        this._getMin(wid, allowPinned, "last_updated", callback);
    },
    "getLeastTimesActivatedTab" : function (wid, allowPinned, callback) {
        this._getMin(wid, allowPinned, "times_activated", callback);
    },
    "_tabCreated": function (wid, tid) {
        var currTime = new Date().getTime();
        var json = {};
        json["_tab__" + tid] = {
            "last_active": currTime,
            "last_updated": currTime,
            "opened_time": currTime,
            "times_activated": 1
        };

        chrome_utilities.storage.window.set(wid, json);
    },
    "_getMin": function (wid, allowPinned, parameter, callback) {
        var _getMineFiltering = function(filteringIds) {
            chrome_utilities.storage.window.get(wid, null, function (items) {
                var minKey = undefined;
                Object.keys(items).forEach(function (key) {
                    if (key.substring(0, 6) === "_tab__") {
                        var tid = parseInt(key.substring(6));
                        if (filteringIds.indexOf(tid) == -1) {
                            if (minKey === undefined ||
                                items[key][parameter] < items[minKey][parameter]) {
                                minKey = key;
                            }
                        }
                    }
                });
                if (minKey === undefined) {
                    callback();
                } else {
                    var minTid = minKey.substring(6);
                    chrome.tabs.get(parseInt(minTid), callback);
                }
            });
        };

        /*
        If we do not allow pinned, we start by getting the id's of all pinned tabs,
        such that we can filter these tabs.
         */
        if (allowPinned) {
            _getMineFiltering([]);
        } else {
            chrome.tabs.query({
                "windowId" : wid,
                "pinned" : true
            }, function(tabs) {
                var pinnedIds = [];
                tabs.forEach(function(tab) {
                    pinnedIds.push(tab.id);
                });
                _getMineFiltering(pinnedIds);
            });
        }
    }

};

chrome.tabs.onCreated.addListener(function (tab) {
    var tid = tab.id;
    var wid = tab.windowId;
    tab_stats._tabCreated(wid, tid);
});

/*
 When a tab is attached to a new window, we treat it as a new tab in the new window.
 */
chrome.tabs.onAttached.addListener(function (tid, attachInfo) {
    var wid = attachInfo.newWindowId;
    tab_stats._tabCreated(wid, tid);
});

chrome.tabs.onRemoved.addListener(function (tid, removeInfo) {
    if (removeInfo.isWindowClosing) {
        return;
    }

    chrome_utilities.storage.window.remove(removeInfo.windowId, "_tab__" + tid);
});

/*
 When a tab is detached from a window we treat it as a removed tab in the window scope.
 */
chrome.tabs.onDetached.addListener(function (tid, detachInfo) {
    chrome_utilities.storage.window.remove(detachInfo.oldWindowId, "_tab__" + tid);
});

// TODO: Test this
chrome.tabs.onReplaced.addListener(function (addedTid, removedTid) {
    chrome.tabs.get(addedTid, function (tab) {
        var wid = tab.windowId;
        tab_stats._tabCreated(wid, addedTid);
        chrome_utilities.window.remove(wid, "_tab__" + removedTid);
    });
});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
    var wid = tab.windowId;

    chrome_utilities.storage.window.update(wid, "_tab__" + tid, function (oldVal) {
        oldVal.last_updated = new Date().getTime();
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    var tid = activeInfo.tabId;
    var wid = activeInfo.windowId;

    chrome_utilities.storage.window.update(wid, "_tab__" + tid, function (oldVal) {
        oldVal.last_active = new Date().getTime();
        oldVal.times_activated = oldVal.times_activated + 1;
    });
});


