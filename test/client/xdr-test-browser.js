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

	var assert, refute, fail, failOnThrow, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;
	failOnThrow = buster.assertions.failOnThrow;

	define('rest/client/xdr-test', function (require) {

		var client, rest, flickrUrl;

		client = require('rest/client/xdr');
		rest = require('rest');

		flickrUrl = 'http://api.flickr.com/services/rest/?method=flickr.test.echo&api_key=95f41bfa4faa0f43bf7c24795eabbed4&format=rest';

		buster.testCase('rest/client/xdr', {
			'': {
				requiresSupportFor: { xdr: 'XDomainRequest' in window },
				'should make a GET by default': function (done) {
					var request = { path: flickrUrl };
					client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						refute(request.canceled);
					}).then(undef, fail).always(done);
				},
				'should make an explicit GET': function (done) {
					var request = { path: flickrUrl, method: 'GET' };
					client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'GET');
						assert.equals(xdr.responseText, response.entity);
						refute(request.canceled);
					}).then(undef, fail).always(done);
				},
				'should make a POST with an entity': function (done) {
					var request = { path: flickrUrl, entity: 'hello world' };
					client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(xdr.responseText, response.entity);
						refute(request.canceled);
					}).then(undef, fail).always(done);
				},
				'should make an explicit POST with an entity': function (done) {
					var request = { path: flickrUrl, entity: 'hello world', method: 'POST' };
					client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						assert.same(request, response.request);
						assert.equals(response.request.method, 'POST');
						assert.equals(xdr.responseText, response.entity);
						refute(request.canceled);
					}).then(undef, fail).always(done);
				},
				'should abort the request if canceled': function (done) {
					// TDOO find an endpoint that takes a bit to respond, cached files may return synchronously
					var request = { path: flickrUrl, params: { q: Date.now() } };
					client(request).then(
						fail,
						failOnThrow(function (response) {
							assert(response.request.canceled);
						})
					).always(done);
					refute(request.canceled);
					request.cancel();
				},
				'should propogate request errors': function (done) {
					var request = { path: 'http://localhost:1234' };
					client(request).then(
						fail,
						failOnThrow(function (response) {
							assert.same('loaderror', response.error);
						})
					).always(done);
				},
				'should not make a request that has already been canceled': function (done) {
					var request = { canceled: true, path: '/' };
					client(request).then(
						fail,
						failOnThrow(function (response) {
							assert.same(request, response.request);
							assert(request.canceled);
							assert.same('precanceled', response.error);
						})
					).always(done);
				}
			},
			'should not be the default client': function () {
				refute.same(client, rest);
			},
			'should support interceptor chaining': function () {
				assert(typeof client.chain === 'function');
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
