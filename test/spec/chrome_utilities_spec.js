describe("chrome_utilities.storage.window", function () {

    var wid = 123456;

    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;
    });

    afterEach(function(done) {
        chrome_utilities.storage.window.clear(wid, done);
    });

    describe("functions", function() {
        it("Returns only a single value, when ask for a single value", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": 1,
                "v2": 2
            }, function () {
                chrome_utilities.storage.window.get(wid, "v1", function (items) {
                    expect(items.v1).toEqual(1);
                    expect(items.v2).toBe(undefined);
                    done();
                });
            })
        });

        it("Can set/get a single value", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "val": 44
            }, function () {
                chrome_utilities.storage.window.get(wid, "val", function (items) {
                    expect(items.val).toEqual(44);
                    done();
                });
            });
        });

        it("Can get whole storage by passing 'null'", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": 1,
                "v2": 2
            }, function () {
                chrome_utilities.storage.window.get(wid, null, function (items) {
                    expect(items.v1).toEqual(1);
                    expect(items.v2).toEqual(2);
                    done();
                });
            });
        });

        it("Can set/get multiple values", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": 1,
                "v2": 2
            }, function () {
                chrome_utilities.storage.window.get(wid, ["v1", "v2"], function (items) {
                    expect(items.v1).toEqual(1);
                    expect(items.v2).toEqual(2);
                    done();
                });
            })
        });


        it("Getter can define default values", function (done) {
            chrome_utilities.storage.window.get(wid, {
                "v1": "default1",
                "v2": "default2"
            }, function (items) {
                expect(items.v1).toEqual("default1");
                expect(items.v2).toEqual("default2");
                done();
            })
        });

        it("Default values are overridden if existing", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": "value1"
            }, function () {
                chrome_utilities.storage.window.get(wid, {
                    "v1": "default1",
                    "v2": "default2"
                }, function (items) {
                    expect(items.v1).toEqual("value1");
                    expect(items.v2).toEqual("default2");
                    done();
                });
            });
        });

        it("Can remove a single item", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": "value1",
                "v2": "value2"
            }, function () {
                chrome_utilities.storage.window.remove(wid, "v1", function () {
                    chrome_utilities.storage.window.get(wid, {
                        "v1": "default1",
                        "v2": "default2"
                    }, function (items) {
                        expect(items.v1).toEqual("default1");
                        expect(items.v2).toEqual("value2");
                        done();
                    });
                });
            });
        });

        it("Can remove multiple items", function (done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": "value1",
                "v2": "value2"
            }, function () {
                chrome_utilities.storage.window.remove(wid, ["v1", "v2"], function () {
                    chrome_utilities.storage.window.get(wid, {
                        "v1": "default1",
                        "v2": "default2"
                    }, function (items) {
                        expect(items.v1).toEqual("default1");
                        expect(items.v2).toEqual("default2");
                        done();
                    });
                });
            });
        });

        it("Remove info in window storage, will not prevent the storage from being cleared", function(done) {
            chrome_utilities.storage.window.set(wid, {
                "v1": "value1",
                "v2": "value2"
            }, function () {
                chrome_utilities.storage.window.remove(wid, ["v1"]);
                chrome_utilities.storage.window.clear(wid, function() {
                    chrome_utilities.storage.window.get(wid, {
                        "v1": "default1",
                        "v2": "default2"
                    }, function (items) {
                        expect(items.v1).toEqual("default1");
                        expect(items.v2).toEqual("default2");
                        done();
                    });
                });
            });
        });
    });

    describe("behavior", function() {

        it("Closing a window will remove all the storage (after some time).", function (done) {
            chrome.windows.create(function (window) {
                wid = window.id;
                chrome_utilities.storage.window.set(wid, {
                    "v1": "value1",
                    "v2": "value2"
                }, function () {
                    chrome.windows.remove(wid, function () {
                        setTimeout(function () {
                            chrome_utilities.storage.window.get(wid, "v2", function (items) {
                                expect(items).toBe(undefined);
                                done();
                            });
                        }, 1500);
                    });
                });
            });
        });
    });
});
