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

(function (buster, define) {
	'use strict';

	var assert, refute, fail, failOnThrow, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;
	failOnThrow = buster.assertions.failOnThrow;

	define('rest/interceptor/mime-test', function (require) {

		var mime, registry, rest;

		mime = require('rest/interceptor/mime');
		registry = require('rest/mime/registry');
		rest = require('rest');

		buster.testCase('rest/interceptor/mime', {
			'should return the response entity decoded': function (done) {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/json' } };
				});

				client({}).then(function (response) {
					assert.equals({}, response.entity);
				}).then(undef, fail).always(done);
			},
			'should encode the request entity': function (done) {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				client({ entity: {} }).then(function (response) {
					assert.equals('{}', response.request.entity);
				}).then(undef, fail).always(done);
			},
			'should encode the request entity from the Content-Type of the request, ignoring the filter config': function (done) {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'text/plain' }
				);

				client({ entity: {}, headers: { 'Content-Type': 'application/json' } }).then(function (response) {
					assert.equals('{}', response.request.entity);
					assert.equals('application/json', response.request.headers['Content-Type']);
					assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
				}).then(undef, fail).always(done);
			},
			'should not overwrite the requests Accept header': function (done) {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				client({ entity: {}, headers: { Accept: 'foo' } }).then(function (response) {
					assert.equals('{}', response.request.entity);
					assert.equals('application/json', response.request.headers['Content-Type']);
					assert.equals('foo', response.request.headers.Accept);
				}).then(undef, fail).always(done);
			},
			'should error the request if unable to find a converter for the desired mime': function (done) {
				var client, request;

				client = mime();

				request = { headers: { 'Content-Type': 'application/vnd.com.example' }, entity: {} };
				client(request).then(
					fail,
					failOnThrow(function (response) {
						assert.same('unknown-mime', response.error);
						assert.same(request, response.request);
					})
				).always(done);
			},
			'should use text/plain converter for a response if unable to find a converter for the desired mime': function (done) {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/vnd.com.example' } };
				});

				client({}).then(function (response) {
					assert.same('{}', response.entity);
				}).then(undef, fail).always(done);
			},
			'should use the configured mime registry': function (done) {
				var client, customRegistry;

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', {
					read: function (str) {
						return 'read: ' + str;
					},
					write: function (obj) {
						return 'write: ' + obj.toString();
					}
				});

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{ mime: 'application/vnd.com.example', registry: customRegistry }
				);

				client({ entity: 'request entity' }).then(function (response) {
					assert.equals('application/vnd.com.example', response.request.headers['Content-Type']);
					assert.equals('write: request entity', response.request.entity);
					assert.equals('application/vnd.com.example', response.headers['Content-Type']);
					assert.equals('read: response entity', response.entity);
				}).then(undef, fail).always(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, mime().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof mime().chain === 'function');
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
