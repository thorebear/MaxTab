chrome.tabs.onCreated.addListener(function (tab) {
    var tid = tab.id;
    var wid = tab.windowId;
    var json = {};
    json["_tab__" + tid] = {
        "last_active" : new Date().getTime(),
        "times_activated" : 1
    };
    chrome_utilities.storage.window.set(wid, json);
});

chrome.tabs.onRemoved.addListener(function (tid, removeInfo) {
    /*
        As of now we does not remove data from the window-storage when a tab is removed.
        The reason: Closing a tab as the last in a window, will create conflicting events.
        The data for the tabs will instead be removed when the window is closed.
        Notice that we cannot use chrome.tabs.tab.isWindowClosing, since this property is
        only true if the tab is closing because of the window closing and not the other way around.
     */

    chrome_utilities.storage.window.remove(removeInfo.windowId, "__tab_" + tid, function(){

    });
});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab){
    /*

     */
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
    var tid = activeInfo.tabId;
    var wid = activeInfo.windowId;

    chrome_utilities.storage.window.get(wid, "_tab__" + tid, function(items) {
        items = items["_tab__" + tid];
        if (items === undefined) {
            /*
                If the tab is just created, it might not have an entry in the storage yet.
                In this case we won't update anything.
             */
        } else {
            items.last_active = new Date().getTime();
            items.times_activated = items.times_activated + 1;
            var json = {};
            json["_tab__" + tid] = items;
            chrome_utilities.storage.window.set(wid, json);
        }
    });
});