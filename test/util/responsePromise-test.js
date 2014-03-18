/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;

	define('rest/util/responsePromise-test', function (require) {

		var responsePromise = require('rest/util/responsePromise'),
			when = require('when');

		buster.testCase('rest/util/responsePromise', {
			'should be an instance of Promise': function () {
				assert(responsePromise(when()) instanceof when.Promise);
			},

			'should resolve the response entity': function () {
				var response = responsePromise(when({ entity: 43 }));

				return response.entity().then(
					function (entity) {
						assert.equals(43, entity);
					},
					fail
				);
			},
			'should resolve the response entity for a rejected promise': function () {
				var response = responsePromise(when.reject({ entity: 43 }));

				return response.entity().then(
					fail,
					function (entity) {
						assert.equals(43, entity);
					}
				);
			},

			'should resolve the response status code': function () {
				var response = responsePromise(when({ status: { code: 200 } }));

				return response.status().then(
					function (status) {
						assert.equals(200, status);
					},
					fail
				);
			},
			'should resolve the response status code for a rejected promise': function () {
				var response = responsePromise(when.reject({ status: { code: 200 } }));

				return response.status().then(
					fail,
					function (status) {
						assert.equals(200, status);
					}
				);
			},

			'should resolve the response headers': function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise(when({ headers: headers }));

				return response.headers().then(
					function (_headers) {
						assert.same(headers, _headers);
					},
					fail
				);
			},
			'should resolve the response headers for a rejected promise': function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise(when.reject({ headers: headers }));

				return response.headers().then(
					fail,
					function (_headers) {
						assert.same(headers, _headers);
					}
				);
			},

			'should resolve a response header': function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise(when({ headers: headers }));

				return response.header('Content-Type').then(
					function (_header) {
						assert.same(headers['Content-Type'], _header);
					},
					fail
				);
			},
			'should resolve a response header for a rejected promise': function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise(when.reject({ headers: headers }));

				return response.header('Content-Type').then(
					fail,
					function (_header) {
						assert.same(headers['Content-Type'], _header);
					}
				);
			},
			'should resolve a response header, by the normalized name': function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise(when({ headers: headers }));

				return response.header('content-type').then(
					function (_header) {
						assert.same(headers['Content-Type'], _header);
					},
					fail
				);
			}

		});
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
