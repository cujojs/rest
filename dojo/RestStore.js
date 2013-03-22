/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var SimpleRestStore, queryResults;

		SimpleRestStore = require('./SimpleRestStore');
		queryResults = require('dojo/store/util/QueryResults');

		/**
		 * A REST based object store.
		 *
		 * The base path for requests is commonly provided by the
		 *`rest/interceptor/pathPrefix` interceptor.
		 *
		 * Extends SimpleRestStore, but wraps the query results with Dojo's
		 * QueryResults.
		 *
		 * @param {RestStore} [options] configuration information that will be mixed
		 *   into the store
		 */
		function RestStore(/* options */) {
			SimpleRestStore.apply(this, arguments);
		}

		RestStore.prototype = Object.create(SimpleRestStore.prototype);

		/**
		 * Queries the store for objects. This will trigger a GET request to the
		 * server, with the query added as a query string.
		 *
		 * @param {Object} query params used for the query string
		 * @param {Object} [options] reserved for future use
		 *
		 * @returns {QueryResult} query results
		 */
		RestStore.prototype.query = function query(/* query, options */) {
			return queryResults(SimpleRestStore.prototype.query.apply(this, arguments));
		};

		return RestStore;

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
