/*
 * Copyright 2012-2013 the original author or authors
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

	define('rest/interceptor/mime-test', function (require) {

		var mime, registry, rest;

		mime = require('rest/interceptor/mime');
		registry = require('rest/mime/registry');
		rest = require('rest');

		buster.testCase('rest/interceptor/mime', {
			'should return the response entity decoded': function () {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/json' } };
				});

				return client({}).then(function (response) {
					assert.equals({}, response.entity);
				}).otherwise(fail);
			},
			'should encode the request entity': function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				return client({ entity: {} }).then(function (response) {
					assert.equals('{}', response.request.entity);
				}).otherwise(fail);
			},
			'should encode the request entity from the Content-Type of the request, ignoring the filter config': function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'text/plain' }
				);

				return client({ entity: {}, headers: { 'Content-Type': 'application/json' } }).then(function (response) {
					assert.equals('{}', response.request.entity);
					assert.equals('application/json', response.request.headers['Content-Type']);
					assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
				}).otherwise(fail);
			},
			'should not overwrite the requests Accept header': function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				return client({ entity: {}, headers: { Accept: 'foo' } }).then(function (response) {
					assert.equals('{}', response.request.entity);
					assert.equals('application/json', response.request.headers['Content-Type']);
					assert.equals('foo', response.request.headers.Accept);
				}).otherwise(fail);
			},
			'should error the request if unable to find a converter for the desired mime': function () {
				var client, request;

				client = mime();

				request = { headers: { 'Content-Type': 'application/vnd.com.example' }, entity: {} };
				return client(request).then(
					fail,
					failOnThrow(function (response) {
						assert.same('unknown-mime', response.error);
						assert.same(request, response.request);
					})
				);
			},
			'should use text/plain converter for a response if unable to find a converter for the desired mime': function () {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/vnd.com.example' } };
				});

				return client({}).then(function (response) {
					assert.same('{}', response.entity);
				}).otherwise(fail);
			},
			'should use the configured mime registry': function () {
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

				return client({ entity: 'request entity' }).then(function (response) {
					assert.equals('application/vnd.com.example', response.request.headers['Content-Type']);
					assert.equals('write: request entity', response.request.entity);
					assert.equals('application/vnd.com.example', response.headers['Content-Type']);
					assert.equals('read: response entity', response.entity);
				}).otherwise(fail);
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
