/*
 * Copyright 2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail, failOnThrow;

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
					}).otherwise(fail).ensure(done);
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
					}).otherwise(fail).ensure(done);
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
					}).otherwise(fail).ensure(done);
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
					}).otherwise(fail).ensure(done);
				},
				'should abort the request if canceled': function (done) {
					// TDOO find an endpoint that takes a bit to respond, cached files may return synchronously
					var request = { path: flickrUrl, params: { q: Date.now() } };
					client(request).then(
						fail,
						failOnThrow(function (response) {
							assert(response.request.canceled);
						})
					).ensure(done);
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
					).ensure(done);
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
					).ensure(done);
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
