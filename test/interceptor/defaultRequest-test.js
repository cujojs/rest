/*
 * Copyright (c) 2013-2013 VMware, Inc. All Rights Reserved.
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

	var assert, refute, fail, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;

	define('rest/interceptor/defaultRequest-test', function (require) {

		var defaultRequest, rest;

		defaultRequest = require('rest/interceptor/defaultRequest');
		rest = require('rest');

		function defaultClient(request) {
			return { request: request };
		}

		buster.testCase('rest/interceptor/defaultRequest', {
			'should do nothing by default': function (done) {
				var client = defaultRequest(defaultClient);
				client({}).then(function (response) {
					assert.same(client, response.request.originator);
					delete response.request.originator;
					assert.equals({}, response.request);
				}).then(undef, fail).always(done);
			},
			'should default the method': function (done) {
				var client = defaultRequest(defaultClient, { method: 'PUT' });
				client({}).then(function (response) {
					assert.equals('PUT', response.request.method);
				}).then(undef, fail).always(done);
			},
			'should not overwrite the method': function (done) {
				var client = defaultRequest(defaultClient, { method: 'PUT' });
				client({ method: 'GET' }).then(function (response) {
					assert.equals('GET', response.request.method);
				}).then(undef, fail).always(done);
			},
			'should default the path': function (done) {
				var client = defaultRequest(defaultClient, { path: '/foo' });
				client({}).then(function (response) {
					assert.equals('/foo', response.request.path);
				}).then(undef, fail).always(done);
			},
			'should not overwrite the path': function (done) {
				var client = defaultRequest(defaultClient, { path: '/foo' });
				client({ path: '/bar' }).then(function (response) {
					assert.equals('/bar', response.request.path);
				}).then(undef, fail).always(done);
			},
			'should default params': function (done) {
				var client = defaultRequest(defaultClient, { params: { foo: 'bar', bool: 'false' } });
				client({}).then(function (response) {
					assert.equals('bar', response.request.params.foo);
					assert.equals('false', response.request.params.bool);
				}).then(undef, fail).always(done);
			},
			'should merge params': function (done) {
				var client = defaultRequest(defaultClient, { params: { foo: 'bar', bool: 'false' } });
				client({ params: { bool: 'true', bleep: 'bloop' } }).then(function (response) {
					assert.equals('bar', response.request.params.foo);
					assert.equals('true', response.request.params.bool);
					assert.equals('bloop', response.request.params.bleep);
				}).then(undef, fail).always(done);
			},
			'should default headers': function (done) {
				var client = defaultRequest(defaultClient, { headers: { foo: 'bar', bool: 'false' } });
				client({}).then(function (response) {
					assert.equals('bar', response.request.headers.foo);
					assert.equals('false', response.request.headers.bool);
				}).then(undef, fail).always(done);
			},
			'should merge headers': function (done) {
				var client = defaultRequest(defaultClient, { headers: { foo: 'bar', bool: 'false' } });
				client({ headers: { bool: 'true', bleep: 'bloop' } }).then(function (response) {
					assert.equals('bar', response.request.headers.foo);
					assert.equals('true', response.request.headers.bool);
					assert.equals('bloop', response.request.headers.bleep);
				}).then(undef, fail).always(done);
			},
			'should default the entity': function (done) {
				var client = defaultRequest(defaultClient, { entity: Math });
				client({}).then(function (response) {
					assert.same(Math, response.request.entity);
				}).then(undef, fail).always(done);
			},
			'should not overwrite the entity': function (done) {
				var client = defaultRequest(defaultClient, { entity: Math });
				client({ entity: Date }).then(function (response) {
					assert.same(Date, response.request.entity);
				}).then(undef, fail).always(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, defaultRequest().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof defaultRequest().chain === 'function');
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
