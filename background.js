// settings:
var maxTabs = {}
maxTabs.notificationId = "numOfTabsExceededWarning";

chrome.tabs.onCreated.addListener(function () {
    chrome.storage.sync.get({
        maxTabs: 5, // default value
        exceedAction: "closeLeftmost" // default value
    }, function(items) {
        chrome.tabs.query({
            "currentWindow": true
        }, function (tabs) {
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
                    chrome.notifications.create(maxTabs.notificationId,{
                        type: "basic",
                        title: "Warning!",
                        iconUrl: "icon.png",
                        message: "The number of tabs in the current window is above the specified tab-limit",
                        buttons: [{
                            title: "Change limit",
                            iconUrl: "icons/glyphicons-390-new-window-alt.png"
                        }]
                    });
                }
            }
        });
    });
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, btnIndex) {
    if (notificationId === maxTabs.notificationId) {
        if (btnIndex === 0) {
            chrome.runtime.openOptionsPage();
        }
    }
});

chrome.tabs.onRemoved.addListener(function() {
    chrome.storage.sync.get({
        maxTabs: 5 // default value
    }, function(items) {
        chrome.tabs.query({
            "currentWindow": true
        }, function (tabs) {
            var numOfTabs = tabs.length;
            if (numOfTabs <= items.maxTabs) {
                chrome.notifications.clear("numOfTabsExceededWarning");
            }
        });
    });
});