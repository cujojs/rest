/*
 * Copyright (c) 2012-2013 VMware, Inc. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
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
