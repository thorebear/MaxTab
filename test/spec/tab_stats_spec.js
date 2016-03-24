describe("tab_stats", function () {

    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
        chrome.storage.local.clear(done);
    });

    describe("functions", function() {

    });

    describe("behavior", function() {
        var wid1;
        var wid2;
        var tid1_1;
        var tid2_1;

        beforeEach(function(done) {
            // Setup two default windows and add 1 tab to each.
            chrome.windows.create(function (window1) {
                wid1 = window1.id;

                chrome.tabs.create({
                    "windowId" : wid1
                }, function (tab1_1) {
                    tabid1_1 = tab1_1.id;
                    chrome.windows.create(function (window2) {
                        wid2 = window2.id;
                        chrome.tabs.create({
                            "windowId" : wid2
                        }, function (tab2_1) {
                            tabid2_1 = tab2_1.id;
                            done();
                        });
                    });
                });
            });
        });

        afterEach(function(done) {
            chrome.windows.remove(wid1, function() {
                chrome.windows.remove(wid2, done);
            });
        });

        it("Window storage is created for a newly created window and tab", function(done) {
            chrome_utilities.storage.window.get(wid1, "_tab__" + tabid1_1, function(items) {
                expect(items["_tab__" + tabid1_1].opened_time).toBeDefined();
                done();
            });
        });

    });
});
