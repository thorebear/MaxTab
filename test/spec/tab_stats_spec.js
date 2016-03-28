describe("tab_stats", function () {

    var wid1;
    var wid2;
    var tid1_1;
    var tid2_1;

    beforeEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

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
                        setTimeout(done, 1500);
                    });
                });
            });
        });
    });

    afterEach(function (done) {
        chrome.windows.remove(wid1, function () {
            chrome.windows.remove(wid2, function () {
                setTimeout(function () {
                    chrome.storage.local.clear(done)
                }, 1500);
            });
        });
    });

    describe("functions", function () {
        xit("Can add tab_stats to tabs", function(done) {

        });
    });

    describe("behavior", function () {


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

        it("Activating a tab will update the 'last_active' and 'times_activated' value", function (done) {
            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                var oldVal = items["_tab__" + tid1_1].last_active;
                var oldVal2 = items["_tab__" + tid1_1].times_activated;
                chrome.tabs.create({
                    "windowId": wid1,
                    "active": true
                }, function (tab) {
                    chrome.tabs.update(tid1_1, {active: true}, function () {
                        setTimeout(function () {
                            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items2) {
                                var newVal = items2["_tab__" + tid1_1].last_active;
                                var newVal2 = items2["_tab__" + tid1_1].times_activated;
                                expect(newVal).toBeGreaterThan(oldVal);
                                expect(oldVal2 + 1).toEqual(newVal2);
                                done();
                            });
                        }, 1000);
                    });
                });
            })
        });

        it("Updating a tab will update the 'last_updated' value", function (done) {
            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                var oldVal = items["_tab__" + tid1_1].last_updated;
                chrome.tabs.create({
                    "windowId": wid1,
                    "active": true
                }, function (tab) {
                    chrome.tabs.update(tid1_1, {"url": "127.0.0.1"}, function () {
                        setTimeout(function () {
                            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items2) {
                                var newVal = items2["_tab__" + tid1_1].last_updated;
                                expect(newVal).toBeGreaterThan(oldVal);
                                done();
                            });
                        }, 1000);
                    });
                });
            })
        });

        it("Moving a tab away from a window will remove the tab data from the win storage", function (done) {
            chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                expect(items["_tab__" + tid1_1]).toBeDefined();

                chrome.tabs.move(tid1_1, {
                    "windowId": wid2,
                    "index": -1
                }, function (tab) {
                    setTimeout(function () {
                        chrome_utilities.storage.window.get(wid1, "_tab__" + tid1_1, function (items) {
                            expect(items["_tab__" + tid1_1]).toBeUndefined();
                            done();
                        });
                    }, 1500);
                });
            });
        });

        it("Moving a tab to a new window will create tab data in the new win storage", function (done) {
            chrome_utilities.storage.window.get(wid2, "_tab__" + tid1_1, function (items) {
                expect(items["_tab__" + tid1_1]).toBeUndefined();

                chrome.tabs.move(tid1_1, {
                    "windowId": wid2,
                    "index": -1
                }, function (tab) {
                    setTimeout(function () {
                        chrome_utilities.storage.window.get(wid2, "_tab__" + tid1_1, function (items) {
                            expect(items["_tab__" + tid1_1]).toBeDefined();
                            done();
                        });
                    }, 1500);
                });
            });
        });

        xit("When a tab is replaced, the data is removed", function (done) {

        });

        xit("When a tab is replacing, tab data is added", function (done) {

        });

    });
});
