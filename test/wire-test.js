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

	define('rest/wire-test', function (require) {

		var rest, pathPrefixInterceptor, wire;

		rest = require('rest');
		pathPrefixInterceptor = require('rest/interceptor/pathPrefix');
		wire = require('wire');

		buster.testCase('rest/wire', {
			'should use default client! config': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.equals('bar', response.foo);
					});
				}).then(undef, fail).always(done);
			},
			'should use client! config with entity interceptor disabled': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!path', client: client, accept: 'text/plain', entity: false },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(function (spec) {
					return spec.client({ path: 'to/somewhere' }).then(function (response) {
						assert.equals('path/to/somewhere', response.request.path);
						assert.equals('text/plain', response.request.headers.Accept);
						assert.equals('bar', response.entity.foo);
					});
				}).then(undef, fail).always(done);
			},
			'should be rejected for a server error status code': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(
					function (spec) {
						return spec.client({}).then(
							fail,
							failOnThrow(function (response) {
								assert.equals('bar', response.foo);
							})
						);
					},
					fail
				).always(done);
			},
			'should ignore status code when errorCode interceptor is disabled': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, errorCode: false },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.equals('bar', response.foo);
					});
				}).then(undef, fail).always(done);
			},
			'should ignore Content-Type and entity when mime interceptor is disabled': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, mime: false },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.isString(response);
					});
				}).then(undef, fail).always(done);
			},
			'should use x-www-form-urlencoded as the default Content-Type for POSTs': function (done) {
				var spec, client;
				client = function (request) {
					return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
				};
				spec = {
					client: { $ref: 'client!', client: client, entity: false },
					plugins: [{ module: 'rest/wire' }]
				};
				wire(spec, { require: require }).then(function (spec) {
					return spec.client({ method: 'post', entity: { bleep: 'bloop' } }).then(function (response) {
						assert.equals('bleep=bloop', response.request.entity);
						assert.equals(0, response.request.headers.Accept.indexOf('application/x-www-form-urlencoded'));
						assert.equals('application/x-www-form-urlencoded', response.request.headers['Content-Type']);
					});
				}).then(undef, fail).always(done);
			},
			'should use the rest factory': {
				'': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
						spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							assert.equals('http://example.com/', response.request.path);
							assert.equals({ foo: 'bar' }, response.entity);
							assert.equals('{"bleep":"bloop"}', response.request.entity);
							assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
							assert.equals('application/json', response.request.headers['Content-Type']);
						});
					}).then(undef, fail).always(done);
				},
				'with interceptor references': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
						spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							assert.equals('http://example.com/', response.request.path);
							assert.equals({ foo: 'bar' }, response.entity);
							assert.equals('{"bleep":"bloop"}', response.request.entity);
							assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
							assert.equals('application/json', response.request.headers['Content-Type']);
						});
					}).then(undef, fail).always(done);
				},
				'with interceptor string shortcuts': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip().skip().skip());
					}).then(undef, fail).always(done);
				},
				'with concrete interceptors': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
						spec.client().then(function (response) {
							assert.equals('thePrefix', response.request.path);
						});
					}).then(undef, fail).always(done);
				},
				'using the default client': function (done) {
					var spec;
					spec = {
						client: {
							rest: [
								'rest/interceptor/pathPrefix'
							]
						},
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(rest, spec.client.skip());
					}).then(undef, fail).always(done);
				},
				'using a referenced parent client': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
					}).then(undef, fail).always(done);
				},
				'without wiring interceptor configurations': function (done) {
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
						plugins: [{ module: 'rest/wire' }]
					};
					wire(spec, { require: require }).then(function (spec) {
						assert.same(client, spec.client.skip());
						spec.client().then(function (response) {
							assert.equals('useThisOne', response.request.path);
						});
					}).then(undef, fail).always(done);
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
