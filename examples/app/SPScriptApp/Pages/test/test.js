(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
mocha.setup('bdd');
chai.should();

describe("SPScript.RestDao", function () {
    this.timeout(10000);
    var url = _spPageContextInfo.webAbsoluteUrl;
    var dao = new SPScript.RestDao(url);

    var webTests = require("./webTests");
    webTests.run(dao);
    
    var listTests = require("./listTests");
    listTests.run(dao);

    var searchTests = require("./searchTests");
    searchTests.run(dao);

    var profileTests = require("./profileTests");
    profileTests.run(dao);
});

var queryStringTests = require("./queryStringTests");
queryStringTests.run();

mocha.run();
},{"./listTests":2,"./profileTests":3,"./queryStringTests":4,"./searchTests":5,"./webTests":6}],2:[function(require,module,exports){
exports.run = function (dao) {
	describe("SPScript.RestDao.lists()", function () {
        var results = null;
        before(function(done){
            dao.lists().then(function(data){
                results = data;
                done();
            });
        });
        it("Should return a promise that resolves to an array of lists", function () {
            results.should.be.an("array");
            results.should.not.be.empty;
        });
        it("Should bring back list info like Title, ItemCount, and ListItemEntityTypeFullName", function () {
            var firstItem = results[0];
            firstItem.should.have.property("Title");
            firstItem.should.have.property("ItemCount");
            firstItem.should.have.property("ListItemEntityTypeFullName");
        });
    });

    describe("SPScript.RestDao.lists(listname)", function () {
        var list = dao.lists("TestList");
        describe("SPScript.RestDao.lists(listname).info()", function () {
            var listInfo = null;
            before(function (done) {
                list.info().then(function (info) {
                    listInfo = info;
                    done();
                });
            });
            it("Should return a promise that resolves to list info", function () {
                listInfo.should.be.an("object");
            });
            it("Should bring back list info like Title, ItemCount, and ListItemEntityTypeFullName", function () {
                listInfo.should.have.property("Title");
                listInfo.should.have.property("ItemCount");
                listInfo.should.have.property("ListItemEntityTypeFullName");
            });
        });

        describe("SPScript.RestDao.lists(listname).getItems()", function () {
            var items = null;
            before(function (done) {
                list.getItems().then(function (results) {
                    items = results;
                    done();
                });
            });

            it("Should return a promise that resolves to an array of items", function () {
                items.should.be.an("array");
                items.should.not.be.empty;
            });
            it("Should return all the items in the list", function (done) {
                list.info().then(function (listInfo) {
                    items.length.should.equal(listInfo.ItemCount);
                    done();
                });
            });
        });

        describe("SPScript.RestDao.lists(listname).getItemById(id)", function () {
            var item = null;
            var validId = -1;
            before(function (done) {
                list.getItems()
                    .then(function (allItems) {
                        validId = allItems[0].Id;
                        return validId;
                    })
                    .then(function (id) {
                        return list.getItemById(id);
                    })
                    .then(function (result) {
                        item = result;
                        done();
                    });
            });
            it("Should return a promise that resolves to a single item", function () {
                item.should.be.an("object");
                item.should.have.property("Title");
            });
            it("Should resolve an item with a matching ID", function () {
                item.should.have.property("Id");
                item.Id.should.equal(validId);
            });
        });

        describe("SPScript.RestDao.lists(listname).getItems(odata) - OData support", function () {
            //Get items where BoolColumn == TRUE
            var odata = "$filter=BoolColumn eq 1";
            var items = null;
            before(function (done) {
                list.getItems(odata).then(function (results) {
                    items = results;
                    done();
                });
            });
            it("Should return a promise that resolves to an array of items", function () {
                items.should.be.an("array");
            });
            it("Should return only items that match the OData params", function () {
                items.forEach(function (item) {
                    item.should.have.property("BoolColumn");
                    item.BoolColumn.should.be.true;
                });
            });
        });

        describe("SPScript.RestDao.lists(listname).findItems(key, value)", function () {
            var matches = null;
            before(function (done) {
                list.findItems("BoolColumn", 1).then(function (results) {
                    matches = results;
                    done();
                });
            });
            it("Should return a promise that resolves to an array of list items", function () {
                matches.should.be.an("array");
                matches.should.not.be.empty;
            });
            it("Should only bring back items the match the key value query", function () {
                matches.forEach(function (item) {
                    item.should.have.property("BoolColumn");
                    item.BoolColumn.should.be.true;
                });
            });
            it("Should support string filters", function (done) {
                var stringValue = "Required data";
                list.findItems("RequiredColumn", stringValue).then(function (items) {
                    items.should.be.an("array");
                    items.should.not.be.empty;
                    items.forEach(function (item) {
                        item.should.have.property("RequiredColumn");
                        item.RequiredColumn.should.equal(stringValue);
                    });
                    done();
                });
            });

            it("Should support number (and bool) filters", function () {
                //first 2 tests test this
                return true;
            });
        });
        describe("SPScript.RestDao.lists(listname).findItem(key, value)", function () {
            var match = null;
            before(function (done) {
                list.findItem("BoolColumn", 1).then(function (result) {
                    match = result;
                    done();
                });
            });
            it("Should resolve to one list item", function () {
                match.should.be.an("object");
            });
            it("Should only bring back an item if it matches the key value query", function () {
                match.should.have.property("BoolColumn");
                match.BoolColumn.should.be.true;
            });
        });

        describe("SPScript.RestDao.lists(listname).addItem()", function () {
            it("Should return a promise that resolves with the new list item");
        });
        describe("SPScript.RestDao.lists(listname).updateItem()", function () {
            it("Should return a promise");
            it("Should update only the properties that were passed");
        });

        describe("SPScript.RestDao.lists(listname).permissions()", function () {
            var permissions = null;
            before(function (done) {
                list.permissions().then(function (privs) {
                    permissions = privs;
                    console.log("Permission:");
                    console.log(privs);
                    done();
                });
            });
            it("Should return a promise that resolves to an array of objects", function () {
                permissions.should.be.an("array");
                permissions.should.not.be.empty;
            });
            it("Should return objects that each have a member and a roles array", function () {
                permissions.forEach(function (permission) {
                    permission.should.have.property("member");
                    permission.should.have.property("roles");
                    permission.roles.should.be.an("array");
                });
            });
            it("Should return permission objects that contain member.name, member.login, and member.id", function () {
                permissions.forEach(function (permission) {
                    permission.member.should.have.property("name");
                    permission.member.should.have.property("login");
                    permission.member.should.have.property("id");
                });
            });
            it("Should return permission objects, each with a roles array that has a name and description", function () {
                permissions.forEach(function (permission) {
                    permission.roles.forEach(function (role) {
                        role.should.have.property("name");
                        role.should.have.property("description");
                    });
                });
            });
        });

    });
};
},{}],3:[function(require,module,exports){
exports.run = function(dao) {
	describe("SPScript.RestDao.profiles.current()", function () {
        var profile = null;
        before(function (done) {
            dao.profiles.current().then(function (result) {
                profile = result;
                done();
            });
        });
        it("Should return a promise that resolves to a profile properties object", function () {
            profile.should.be.an("object");
            profile.should.have.property("AccountName");
            profile.should.have.property("Email");
            profile.should.have.property("PreferredName");
        });
    });

   describe("SPScript.RestDao.profiles.getByEmail(email)", function () {
        var profile = null;
        var email = "andrew@andrewpetersen.onmicrosoft.com";
        before(function (done) {
            dao.profiles.getByEmail(email).then(function (result) {
                profile = result;
                done();
            });
        });
        it("Should return a promise that resolves to a profile properties object", function () {
            profile.should.be.an("object");
            profile.should.have.property("AccountName");
            profile.should.have.property("Email");
            profile.should.have.property("PreferredName");
        });

        it("Should give you the matching person", function () {
            profile.should.have.property("Email");
            profile.Email.should.equal(email);
        });

        it("Should resolve to null for an invalid email", function (done) {
            dao.profiles.getByEmail("invalid@invalid123.com")
            .then(function (result) {
                result.should.be.null;
                done();
            });
        });
    });
}
},{}],4:[function(require,module,exports){
exports.run = function() {
	describe("SPScript.queryString", function () {
	    this.timeout(5000);
	    var qs = "key1=value1&key2=value2&key3=value3";
	    describe("SPScript.queryString.contains(key)", function () {
	        it("Should return the true for a valid key", function () {
	            var contains = SPScript.queryString.contains('key1', qs);
	            contains.should.be.true;
	        });
	        it("Should return false for an invalid key", function () {
	            var contains = SPScript.queryString.contains('invalidKey', qs);
	            contains.should.be.false;
	        });
	    });
	    describe("SPScript.queryString.getValue(key)", function () {
	        it("Should return the value of a valid key", function () {
	            var val = SPScript.queryString.getValue("key1", qs);
	            val.should.equal("value1");
	        });
	        it("Should return an empty string for an invalid key", function () {
	            var val = SPScript.queryString.getValue("invalidKey", qs);
	            val.should.equal("");
	        });
	    });
	    describe("SPScript.queryString.getAll()", function () {
	        it("Should return an object with querystring keys as properties", function () {
	            var values = SPScript.queryString.getAll(qs);
	            console.log(values);
	            values.should.have.property('key1');
	            values.key1.should.equal('value1');
	            values.should.have.property('key2');
	            values.key2.should.equal('value2');
	            values.should.have.property('key3');
	            values.key3.should.equal('value3');
	        });
	    });
	});
};
},{}],5:[function(require,module,exports){
exports.run = function(dao) {
	describe("SPScript.RestDao.search.query(queryText)", function () {
        it("Should return promise that resolves to a SearchResults object", function (done) {
            var queryText = "seed";
            dao.search.query(queryText).then(function (searchResults) {
                searchResults.should.be.an("object");
                searchResults.should.have.property("resultsCount");
                searchResults.should.have.property("totalResults");
                searchResults.should.have.property("items");
                searchResults.items.should.be.an("array");
                searchResults.items.should.not.be.empty;
                done();
            });
        });
    });
    describe("SPScript.RestDao.search.query(queryText, queryOptions)", function () {
        it("Should return promise that resolves to an array of SearchResults");
        it("Should obey the extra query options that were passed");
    });
};
},{}],6:[function(require,module,exports){
exports.run = function(dao) {
    describe("SPScript.RestDao.web", function () {
        describe("SPScript.RestDao.web.info()", function () {
            it("Should return a promise that resolves to web info", function (done) {
                dao.web.info().then(function (webInfo) {
                    webInfo.should.have.property("Url");
                    webInfo.should.have.property("Title");
                    done();
                });
            });
        });

        describe("SPScript.RestDao.web.subsites()", function () {
            it("Should return a promise that resolves to an array of subsite web infos.", function (done) {
                dao.web.subsites().then(function (subsites) {
                    subsites.should.be.an("array");
                    if (subsites.length) {
                        subsites[0].should.have.property("Title");
                        subsites[0].should.have.property("ServerRelativeUrl");
                    }
                    done();
                });
            });
        });

        describe("SPScript.RestDao.web.permissions()", function () {
            var permissions = null;
            before(function (done) {
                dao.web.permissions().then(function (privs) {
                    permissions = privs;
                    console.log("Permission:");
                    console.log(privs);
                    done();
                });
            });
            it("Should return a promise that resolves to an array of objects", function () {
                permissions.should.be.an("array");
                permissions.should.not.be.empty;
            });
            it("Should return objects that each have a member and a roles array", function () {
                permissions.forEach(function (permission) {
                    permission.should.have.property("member");
                    permission.should.have.property("roles");
                    permission.roles.should.be.an("array");
                });
            });
            it("Should return permission objects that contain member.name, member.login, and member.id", function () {
                permissions.forEach(function (permission) {
                    permission.member.should.have.property("name");
                    permission.member.should.have.property("login");
                    permission.member.should.have.property("id");
                });
            });
            it("Should return permission objects, each with a roles array that has a name and description", function () {
                permissions.forEach(function (permission) {
                    permission.roles.forEach(function (role) {
                        role.should.have.property("name");
                        role.should.have.property("description");
                    });
                });
            });
        });

        describe("SPScript.RestDao.web.permissions(email)", function () {
            var permissions = null;
            var email = "andrew@andrewpetersen.onmicrosoft.com"
            before(function (done) {
                dao.web.permissions(email).then(function (privs) {
                    permissions = privs;
                    done();
                });
            });
            it("Should return a promise that resolves to an array of base permission strings", function () {
                permissions.should.be.an("array");
                permissions.should.not.be.empty;
            });

            it("Should resolve null for an invalid email", function (done) {

                try {
                    dao.web.permissions("invalid@invalid123.com")
                    .then(function (privs) {
                        privs.should.be.null;
                        done();
                    })
                } catch (ex) {
                    "one".should.equal("two");
                    done();
                }
            });
        });
    });
};
    

},{}]},{},[1])