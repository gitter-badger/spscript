
var List 		= require("./list");
var Web 		= require("./web");
var Profiles 	= require("./profiles")
var Search 		= require("./search");
var utils 		= require("./utils");

/**
 * Abstract class. You'll never work with this directly. 
 * @abstract
 * @private
 * @property {Web} web - Allows interacting with the SharePoint site you connected to
 * @property {Search} search - Allows querying through the SP Search Service
 * @property {Profiles} profiles - Allows interacting with the SP Profile Service
 */
var BaseDao = function() {
	this.web = new Web(this);
	this.search = new Search(this);
	this.profiles = new Profiles(this);
};

BaseDao.prototype.executeRequest = function() {
	throw "Not implemented exception";
};

/**
 * Generic helper to make AJAX GET request
  * @example <caption>Use generic GET method to retrieve a site's content types</caption>
 * dao.get('/web/contentTypes').then(function(data) { console.log(data.d.results)})
 * @param {string} relativeQueryUrl - the API url relative to "/_api"
 * @param {Object} [extendedOptions] - AJAX options (like custom request headers)
 * @returns {Promise} - An ES6 Promise that resolves to the an object probably in the form of data.d
 */
BaseDao.prototype.get = function(relativeQueryUrl, extendedOptions) {
	var options = Object.assign({}, {
		method: "GET"
	}, extendedOptions);
	return this.executeRequest(relativeQueryUrl, options).then(utils.parseJSON);
};

BaseDao.prototype.getRequestDigest = function() {
	return this.web.getRequestDigest();
};
/**
 * If a list name is passed, an SPScript.List object, otherwise performs a request to get all the site's lists
 * @param {string} [listname] - If a list name is passed, method is synchronous returning an SPScript.List
 * @returns {List|Promise} - SPScript.List object or a Promise that resolves to an Array of lists
 * @example <caption>Option 1: No List Name gets all the lists of a site</caption>
 * dao.lists().then(function(lists) { console.log(lists)});
 * @example <caption>Option 2: Pass a List Name to get a list object</caption>
 * var list = dao.lists('MyList');
 * list.getItemById(12).then(function(item) { console.log(item)});
 */
BaseDao.prototype.lists = function(listname) {
	if (!listname) {
		return this.get("/web/lists").then(utils.validateODataV2);
	}
	return new List(listname, this);
};

/**
 * Generic helper to make AJAX POST request
 * @param {string} relativeQueryUrl - the API url relative to "/_api"
 * @param {Object} [extendedOptions] - AJAX options (like custom request headers)
 * @returns {Promise} - An ES6 Promise
 */
BaseDao.prototype.post = function(relativePostUrl, body, extendedOptions) {
	var strBody = JSON.stringify(body);
	var options = {
		method: "POST",
		data: strBody,
		contentType: "application/json;odata=verbose"
	};
	options = Object.assign({}, options, extendedOptions);
	return this.executeRequest(relativePostUrl, options).then(utils.parseJSON);
};

module.exports = BaseDao;