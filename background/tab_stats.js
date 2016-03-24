tab_stats = {};

tab_stats = {
    "_tabCreated" : function(wid, tid) {
        var currTime = new Date().getTime();
        var json = {};
        json["_tab__" + tid] = {
            "last_active": currTime,
            "last_updated": currTime,
            "opened_time": currTime,
            "times_activated": 1
        };

        chrome_utilities.storage.window.set(wid, json);
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
chrome.tabs.onDetached.addListener(function(tid, detachInfo) {
    chrome_utilities.storage.window.remove(detachInfo.oldWindowId, "_tab__" + tid);
});

// TODO: Test this
chrome.tabs.onReplaced.addListener(function(addedTid, removedTid) {
    chrome.tabs.get(addedTid, function(tab) {
        var wid = tab.windowId;
        tab_stats._tabCreated(wid, addedTid);
        chrome_utilities.window.remove(wid, "_tab__" + removedTid);
    });
});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
    var wid = tab.windowId;

    chrome_utilities.storage.window.get(wid, "_tab__" + tid, function (items) {
        /*
         If the tab is created along with a new window there might not be an 'window' storage entry for this window yet.
         In this case we will just ignore this event.
         */
        if (items === undefined) {
            return;
        }
        items = items["_tab__" + tid];
        if (items === undefined) {
            /*
             If the tab is just created, it might not have an entry in the storage yet.
             In this case we won't update anything.
             */
            return;
        } else {
            items.last_updated = new Date().getTime();
            var json = {};
            json["_tab__" + tid] = items;
            chrome_utilities.storage.window.set(wid, json);
        }
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    var tid = activeInfo.tabId;
    var wid = activeInfo.windowId;

    chrome_utilities.storage.window.get(wid, "_tab__" + tid, function (items) {
        /*
        If the tab is created along with a new window there might not be an 'window' storage entry for this window yet.
        In this case we will just ignore this event.
         */
        if (items === undefined) {
            return;
        }
        items = items["_tab__" + tid];
        if (items === undefined) {
            /*
             If the tab is just created, it might not have an entry in the storage yet.
             In this case we won't update anything.
             */
            return;
        } else {
            items.last_active = new Date().getTime();
            items.times_activated = items.times_activated + 1;
            var json = {};
            json["_tab__" + tid] = items;
            chrome_utilities.storage.window.set(wid, json);
        }
    });
});


