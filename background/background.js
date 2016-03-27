// settings:
var max_tabs = {};

max_tabs.defaultSettings = {
    // default values
    maxTabs: 5,
    exceedAction: "closeLeftmost",
    countPinned: false,
    closePinned: false
};
max_tabs.notificationId = "numOfTabsExceededWarning";

max_tabs.onTabAddedOrUnpinned = function() {
    chrome.storage.sync.get(["maxTabs", "exceedAction", "closePinned", "countPinned"],
        /**
         * @param {
         * {maxTabs:int},
         * {exceedAction:string},
         * {closePinned:boolean},
         * {countPinned:boolean}
         * } items
         */
        function (items) {
            chrome.tabs.query({
                "currentWindow": true
            }, function (tabs) {
                if (!items.countPinned) {
                    tabs = tabs.filter(function (tab) {
                        return !tab.pinned;
                    });
                }

                var numOfTabs = tabs.length;
                if (numOfTabs > items.maxTabs) {
                    if (items.exceedAction === "closeLeftmost") {
                        var numToClose = numOfTabs - items.maxTabs;
                        var tabsToClose = tabs.splice(0, numToClose);
                        var idsToClose = [];
                        tabsToClose.forEach(function (tab) {
                            idsToClose.push(tab.id)
                        });
                        chrome.tabs.remove(idsToClose);
                    } else if (items.exceedAction === "showWarning") {
                        chrome.notifications.create(max_tabs.notificationId, {
                            type: "basic",
                            title: chrome.i18n.getMessage("warning_title"),
                            iconUrl: "/icons/exclamation.png",
                            message: chrome.i18n.getMessage("warning_msg"),
                            buttons: [{
                                title: chrome.i18n.getMessage("change_limit"),
                                iconUrl: "/icons/glyphicons-390-new-window-alt.png"
                            }]
                        });
                    }
                }
            });
        });
};

chrome.tabs.onCreated.addListener(function () {
    max_tabs.onTabAddedOrUnpinned();
});

chrome.tabs.onUpdated.addListener(function(tid, changeInfo, tab) {
    /*
    If a tab is pinned changeInfo.pinned = true,
    If a tab is unpinned changeInfo.pinned = false,
    If pinned status is unchanged changeInfo.pinned = undefined
     */

    /*
    If we do not count pinned tabs, and a pinned tab is unpinned,
    the window could potential exceed the number of allowed tabs
     */
    if(changeInfo.pinned === false) {
        max_tabs.onTabAddedOrUnpinned();
    }
});

chrome.notifications.onButtonClicked.addListener(function (notificationId, btnIndex) {
    if (notificationId === max_tabs.notificationId) {
        if (btnIndex === 0) {
            chrome.runtime.openOptionsPage();
            chrome.notifications.clear(notificationId);
        }
    }
});

chrome.tabs.onRemoved.addListener(function() {
    chrome.storage.sync.get({
            maxTabs: 5 // default value
        },
        /**
         * @param {
         * {maxTabs:int},
         * {exceedAction:string},
         * {closePinned:boolean},
         * {countPinned:boolean}
         * } items
         */
        function (items) {
            chrome.tabs.query({
                "currentWindow": true
            }, function (tabs) {
                if(!items.countPinned) {
                    tabs = tabs.filter(function(tab) { return !tab.pinned });
                }

                var numOfTabs = tabs.length;
                if (numOfTabs <= items.maxTabs) {
                    chrome.notifications.clear(max_tabs.notificationId);
                }
            });
        });
});