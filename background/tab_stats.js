chrome.tabs.onCreated.addListener(function (tab) {
    var tid = tab.id;
    var wid = tab.windowId;
    var currTime = new Date().getTime();
    var json = {};
    json["_tab__" + tid] = {
        "last_active" : currTime,
        "opened_time" : currTime,
        "times_activated" : 1
    };

    chrome_utilities.storage.window.set(wid, json);
});

chrome.tabs.onRemoved.addListener(function (tid, removeInfo) {

});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab){

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