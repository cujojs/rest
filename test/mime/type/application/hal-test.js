/*
 * Copyright 2013 the original author or authors
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

	define('rest/mime/type/application/hal-test', function (require) {

		var hal, mime, supports;

		hal = require('rest/mime/type/application/hal');
		mime = require('rest/interceptor/mime');

		function client(request) {
			return { request: request };
		}

		supports = {
			'Object.defineProperty': (function () {
				try {
					var obj = {};
					Object.defineProperty(obj, 'test', { enumerable: false, configurable: true, value: true });
					return obj.test;
				}
				catch (e) {
					return false;
				}
			}())
		};


		buster.testCase('rest/mime/type/application/hal', {
			'should stringify json': function () {
				assert.equals('{"foo":"bar"}', hal.write({ foo: 'bar' }));
			},
			'should read json': function () {
				assert.equals({ foo: 'bar' }, hal.read('{"foo":"bar"}'));
			},
			'should place embedded relationships on the host object': function () {
				var resource = hal.read(JSON.stringify({ _embedded: { prop: 'embed' } }));
				return resource.prop.then(function (prop) {
					assert.same(prop, 'embed');
				});
			},
			'should not overwrite a property on the host oject with an embedded relationship': function () {
				var resource = hal.read(JSON.stringify({ prop: 'host', _embedded: { prop: 'embed' } }));
				assert.same(resource.prop, 'host');
			},
			'should place linked relationships on the host object': function () {
				var resource = hal.read(JSON.stringify({ _links: { prop: { href: '/' } } }));
				assert.isFunction(resource.prop.then);
			},
			'should not overwrite a property on the host oject with a linked relationship': function () {
				var resource = hal.read(JSON.stringify({ prop: 'host', _links: { prop: { href: '/' } } }));
				assert.same(resource.prop, 'host');
			},
			'should fetch a linked resource': function () {
				var client = mime(function client(request) {
					return request.path === '/' ?
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/' }, child: { href: '/resource' } } }), headers: { 'Content-Type': 'application/hal+json' } } :
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/resource' }, parent: { href: '/' } } }), headers: { 'Content-Type': 'application/hal+json' } };
				});

				return client({ path: '/' }).then(function (response) {
					assert.same('/', response.request.path);
					return response.entity.child.then(function (response) {
						assert.same('/resource', response.request.path);
					});
				}).otherwise(fail);
			},
			'should get a client for an relationship': function () {
				var resource = hal.read(JSON.stringify({ _links: { prop: { href: '/' } } }), { client: client });
				return resource.clientFor('prop')().then(function (response) {
					assert.same('/', response.request.path);
				}).otherwise(fail);
			},
			'should safely warn when accessing a deprecated relationship': {
				'': function () {
					var console, resource;

					console = {
						warn: this.spy(),
						log: this.spy()
					};
					resource = hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { client: client, console: console });

					return resource.clientFor('prop')().then(function (response) {
						assert.same('/', response.request.path);
						assert.calledWith(console.warn, 'Relationship \'prop\' is deprecated, see http://example.com/deprecation');
						refute.called(console.log);
					}).otherwise(fail);
				},
				'falling back to log if warn is not availble': function () {
					var console, resource;

					console = {
						log: this.spy()
					};
					resource = hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { client: client, console: console });

					return resource.clientFor('prop')().then(function (response) {
						assert.same('/', response.request.path);
						assert.calledWith(console.log, 'Relationship \'prop\' is deprecated, see http://example.com/deprecation');
					}).otherwise(fail);
				},
				'doing nothing if the console is unavailable': function () {
					var console, resource;

					console = {};
					resource = hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { client: client, console: console });

					return resource.clientFor('prop')().then(function (response) {
						assert.same('/', response.request.path);
					}).otherwise(fail);
				}
			},
			'should not index templated links': function () {
				var resource = hal.read(JSON.stringify({ _links: {
					prop: { href: '/', templated: 'true' },        // not-templated, must be boolean true
					query: { href: '/{?query}', templated: true }  // templated
				} }));
				assert.isFunction(resource.prop.then);
				refute(resource.query);
			},
			'should be able to write read entities': function () {
				var raw, read, writen;

				raw = { _embedded: { prop: 'embed' }, _links: { prop: { href: '/' } }, foo: 'bar' };
				read = hal.read(JSON.stringify(raw));
				writen = hal.write(read);

				assert.match(writen, '"foo":"bar"');

				if (!supports['Object.defineProperty']) {
					refute.match(writen, '_embedded');
					refute.match(writen, '_links');
					refute.match(writen, 'clientFor');
					refute.match(writen, 'prop');
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
