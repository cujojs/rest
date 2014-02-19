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

	define('rest/wire-test', function (require) {

		var rest, pathPrefixInterceptor, wire;

		rest = require('rest');
		pathPrefixInterceptor = require('rest/interceptor/pathPrefix');
		wire = require('wire');

		buster.testCase('rest/wire', {
			'should use default client! config': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.equals('bar', response.foo);
					});
				}).otherwise(fail);
			},
			'should use client! config with entity interceptor disabled': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!path', client: client, accept: 'text/plain', entity: false },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(function (spec) {
					return spec.client({ path: 'to/somewhere' }).then(function (response) {
						assert.equals('path/to/somewhere', response.request.path);
						assert.equals('text/plain', response.request.headers.Accept);
						assert.equals('bar', response.entity.foo);
					});
				}).otherwise(fail);
			},
			'should be rejected for a server error status code': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(
					function (spec) {
						return spec.client({}).then(
							fail,
							failOnThrow(function (response) {
								assert.equals('bar', response.foo);
							})
						);
					},
					fail
				);
			},
			'should ignore status code when errorCode interceptor is disabled': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, errorCode: false },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.equals('bar', response.foo);
					});
				}).otherwise(fail);
			},
			'should ignore Content-Type and entity when mime interceptor is disabled': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, mime: false },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.isString(response);
					});
				}).otherwise(fail);
			},
			'should use x-www-form-urlencoded as the default Content-Type for POSTs': function () {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, entity: false },
					$plugins: [{ module: 'rest/wire' }]
				};
				return wire(spec, { require: require }).then(function (spec) {
					return spec.client({ method: 'post', entity: { bleep: 'bloop' } }).then(function (response) {
						assert.equals('bleep=bloop', response.request.entity);
						assert.equals(0, response.request.headers.Accept.indexOf('application/x-www-form-urlencoded'));
						assert.equals('application/x-www-form-urlencoded', response.request.headers['Content-Type']);
					});
				}).otherwise(fail);
			},
			'should use the rest factory': {
				'': function () {
					var spec, client;
					client = function (request) {
						return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: 'rest/interceptor/mime', config: { mime: 'application/json' } },
									{ module: 'rest/interceptor/pathPrefix', config: { prefix: 'http://example.com' } },
									{ module: 'rest/interceptor/errorCode' }
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
						spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							assert.equals('http://example.com/', response.request.path);
							assert.equals({ foo: 'bar' }, response.entity);
							assert.equals('{"bleep":"bloop"}', response.request.entity);
							assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
							assert.equals('application/json', response.request.headers['Content-Type']);
						});
					}).otherwise(fail);
				},
				'with interceptor references': function () {
					var spec, client;
					client = function (request) {
						return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ $ref: 'mime', config: { mime: 'application/json' } },
									{ $ref: 'pathPrefix', config: { prefix: 'http://example.com' } },
									{ $ref: 'errorCode' }
								]
							}
						},
						mime: { module: 'rest/interceptor/mime' },
						pathPrefix: { module: 'rest/interceptor/pathPrefix' },
						errorCode: { module: 'rest/interceptor/errorCode' },
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
						spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							assert.equals('http://example.com/', response.request.path);
							assert.equals({ foo: 'bar' }, response.entity);
							assert.equals('{"bleep":"bloop"}', response.request.entity);
							assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
							assert.equals('application/json', response.request.headers['Content-Type']);
						});
					}).otherwise(fail);
				},
				'with interceptor string shortcuts': function () {
					var spec, client;
					client = function () {};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									'rest/interceptor/mime',
									'rest/interceptor/pathPrefix',
									'rest/interceptor/errorCode'
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
					}).otherwise(fail);
				},
				'with concrete interceptors': function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: pathPrefixInterceptor, config: { prefix: 'thePrefix' } }
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
						spec.client().then(function (response) {
							assert.equals('thePrefix', response.request.path);
						});
					}).otherwise(fail);
				},
				'using the default client': function () {
					var spec;
					spec = {
						client: {
							rest: [
								'rest/interceptor/pathPrefix'
							]
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(rest, spec.client.skip());
					}).otherwise(fail);
				},
				'using a referenced parent client': function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: { $ref: 'parentClient' },
								interceptors: [
									{ module: 'rest/interceptor/pathPrefix' }
								]
							}
						},
						parentClient: client,
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
					}).otherwise(fail);
				},
				'without wiring interceptor configurations': function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: 'rest/interceptor/pathPrefix', config: { $ref: 'basePath', prefix: 'useThisOne' } }
								]
							}
						},
						basePath: {
							literal: { prefix: 'dontUseThis' }
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
						spec.client().then(function (response) {
							assert.equals('useThisOne', response.request.path);
						});
					}).otherwise(fail);
				}
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
