describe("tab_stats", function () {

    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    });

    afterEach(function (done) {
        chrome.storage.local.clear(done);
    });

    describe("functions", function () {

    });

    describe("behavior", function () {
        var wid1;
        var wid2;
        var tid1_1;
        var tid2_1;

        beforeEach(function (done) {
            // Setup two default windows and add 1 tab to each.
            chrome.windows.create({"focused": false}, function (window1) {
                wid1 = window1.id;

                chrome.tabs.create({
                    "windowId": wid1
                }, function (tab1_1) {
                    tid1_1 = tab1_1.id;
                    chrome.windows.create({"focused": false}, function (window2) {
                        wid2 = window2.id;
                        chrome.tabs.create({
                            "windowId": wid2
                        }, function (tab2_1) {
                            tid2_1 = tab2_1.id;
                            // Wait a little time to allow the event handlers in tab stats to work.
                            setTimeout(done, 500);
                        });
                    });
                });
            });
        });

        afterEach(function (done) {
            chrome.windows.remove(wid1, function () {
                chrome.windows.remove(wid2, function () {
                    setTimeout(done, 500);
                });
            });
        });

        it("Window storage is created for a newly created window and tab", function (done) {
            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                expect(items["_tab__" + tid1_1].opened_time).toBeDefined();
                done();
            });
        });

        it("Closing a tab will remove the tab data", function (done) {
            chrome.tabs.remove(tid1_1, function () {
                // wait a little time to let the event handlers in tab_stat work.
                setTimeout(function () {
                    chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                        expect(items["_tab__" + tid1_1]).toBeUndefined();
                        done();
                    });
                }, 1500);
            });
        });

    });
});
