// Set default settings on new installation!
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.sync.set(max_tabs.defaultSettings);

        chrome.windows.getAll({
            populate: true
        }, function(windows) {
            windows.forEach(function(window) {
                window.tabs.forEach(function (tab) {
                    tab_stats._tabCreated(window.id, tab.id);
                });
            });
        });
    }
});

// settings:
var max_tabs = {};

max_tabs.defaultSettings = {
    // default values
    maxTabs: 5,
    exceedAction: "closeLRActive",
    countPinned: false,
    closePinned: false
};

max_tabs.notificationId = "numOfTabsExceededWarning";

max_tabs.onTabAddedOrUnpinned = function (wid, tid) {
    chrome.storage.sync.get(["maxTabs", "exceedAction", "closePinned", "countPinned"],
        /**
         * @param {
         * {maxTabs:int},
         * {exceedAction:string},
         * {closePinned:boolean},
         * {countPinned:boolean}
         * } options
         */
        function (options) {
            chrome.tabs.query({
                "windowId": wid
            }, function (tabs) {

                if (!options.countPinned) {
                    tabs = tabs.filter(function (tab) {
                        return !tab.pinned;
                    });
                }

                var numOfTabs = tabs.length;
                if (numOfTabs > options.maxTabs) {
                    tab_stats.addTabStats(tabs[0].windowId, tabs, function (tabs) {

                        // filter the tab that was just opened/unpinned:
                        tabs = tabs.filter(function (tab) {
                            return tab.id !== tid;
                        });

                        if (options.exceedAction === "showWarning") {
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
                            return;
                        }

                        if (options.exceedAction === "preventNewTab") {
                            chrome.tabs.remove(tid);
                            return;
                        }

                        var numToClose = numOfTabs - options.maxTabs;
                        var tabsToClose = [];

                        switch (options.exceedAction) {
                            case "closeLeftmost":
                                tabsToClose = tabs.splice(0, numToClose);
                                break;
                            case "closeLRActive":
                                tabsToClose = tabs.sort(function (a, b) {
                                    return b.last_active < a.last_active;
                                }).splice(0, numToClose);
                                break;
                            case "closeLRUpdated":
                                tabsToClose = tabs.sort(function (a, b) {
                                    return b.last_updated < a.last_updated;
                                }).splice(0, numToClose);
                                break;
                            case "closeOldest":
                                tabsToClose = tabs.sort(function (a, b) {
                                    return b.opened_time < a.opened_time;
                                }).splice(0, numToClose);
                                break;
                            case "closeRandom":
                                tabsToClose = tabs.shuffle().splice(0, numToClose);
                                break;
                        }

                        var idsToClose = tabsToClose.map(function (tab) {
                            return tab.id
                        });
                        chrome.tabs.remove(idsToClose);
                    });
                }
            });
        });
};

chrome.tabs.onCreated.addListener(function (tab) {
    var wid = tab.windowId;
    max_tabs.onTabAddedOrUnpinned(wid, tab.id);
});

chrome.tabs.onUpdated.addListener(function (tid, changeInfo, tab) {
    /*
     If a tab is pinned changeInfo.pinned = true,
     If a tab is unpinned changeInfo.pinned = false,
     If pinned status is unchanged changeInfo.pinned = undefined
     */

    /*
     If we do not count pinned tabs, and a pinned tab is unpinned,
     the window could potential exceed the number of allowed tabs
     */
    if (changeInfo.pinned === false) {
        var wid = tab.windowId;
        max_tabs.onTabAddedOrUnpinned(wid, tab.id);
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

chrome.tabs.onRemoved.addListener(function () {
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
                if (!items.countPinned) {
                    tabs = tabs.filter(function (tab) {
                        return !tab.pinned
                    });
                }

                var numOfTabs = tabs.length;
                if (numOfTabs <= items.maxTabs) {
                    chrome.notifications.clear(max_tabs.notificationId);
                }
            });
        });
});