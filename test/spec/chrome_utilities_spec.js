describe("chrome_utilities.storage.window", function () {
    var wid = "UnitTestId";

    beforeEach(function (done) {
        // clear storage between each test case!
        chrome.storage.local.clear(done);

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;
    });

    it("Returns only a single value, when ask for a single value", function(done) {
        chrome_utilities.storage.window.set(wid, {
            "v1": 1,
            "v2": 2
        }, function() {
            chrome_utilities.storage.window.get(wid, "v1", function(items) {
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

    it("Can set/get multiple values", function(done) {
        chrome_utilities.storage.window.set(wid, {
            "v1": 1,
            "v2": 2
        }, function() {
            chrome_utilities.storage.window.get(wid, ["v1", "v2"], function(items) {
                expect(items.v1).toEqual(1);
                expect(items.v2).toEqual(2);
                done();
            });
        })
    });

    it("Getter can define default values", function(done) {
        chrome_utilities.storage.window.get(wid, {
            "v1": "default1",
            "v2": "default2"
        }, function(items) {
            expect(items.v1).toEqual("default1");
            expect(items.v2).toEqual("default2");
            done();
        })
    });

    it("Default values are overridden if existing", function(done) {
        chrome_utilities.storage.window.set(wid, {
            "v1": "value1"
        }, function() {
           chrome_utilities.storage.window.get(wid, {
               "v1": "default1",
               "v2": "default2"
           }, function(items) {
               expect(items.v1).toEqual("value1");
               expect(items.v2).toEqual("default2");
               done();
           });
        });
    });
    
    //it("Can ")
});