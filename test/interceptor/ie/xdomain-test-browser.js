/*
 * Copyright (c) 2013 VMware, Inc. All Rights Reserved.
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

	define('rest/interceptor/ie/xdomain-test', function (require) {

		var xdomain, rest, client, xdr, xhrCors;

		xdomain = require('rest/interceptor/ie/xdomain');
		rest = require('rest');

		function defaultClient(request) {
			return { request: request, client: 'default' };
		}

		function xdrClient(request) {
			return { request: request, client: 'xdr' };
		}

		client = xdomain(defaultClient, { xdrClient: xdrClient });

		xdr = 'XDomainRequest' in window;
		xhrCors = window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest();

		buster.testCase('rest/interceptor/ie/xdomain', {
			'for XDomainRequest enabled browsers': {
				requiresSupportFor: { 'xdr': xdr, 'not-xhrCors': !xhrCors },
				'should use the XDomainRequest engine for cross domain requests': function (done) {
					client({ path: 'http://example.com' }).then(function (response) {
						assert.same('xdr', response.client);
					}).then(undef, fail).always(done);
				},
				'should use the standard engine for same domain requests, with absolute paths': function (done) {
					client({ path: window.location.toString() }).then(function (response) {
						assert.same('default', response.client);
					}).then(undef, fail).always(done);
				},
				'should use the standard engine for same domain requests, with relative paths': function (done) {
					client({ path: '/' }).then(function (response) {
						assert.same('default', response.client);
					}).then(undef, fail).always(done);
				}
			},
			'for non-XDomainRequest enabled browsers': {
				requiresSupportForAny: { 'not-xdr': !xdr, 'xhrCors': xhrCors },
				'should always use the standard engine': function (done) {
					client({ path: 'http://example.com' }).then(function (response) {
						assert.same('default', response.client);
					}).then(undef, fail).always(done);
				}
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, xdomain().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof xdomain().chain === 'function');
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
