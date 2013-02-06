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

	var assert, refute, fail, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;

	define('rest/interceptor/hateoas-test', function (require) {

		var hateoas, rest, when;

		hateoas = require('rest/interceptor/hateoas');
		rest = require('rest');
		when = require('when');

		buster.testCase('rest/interceptor/hateoas', {
			requiresSupportFor: {
				'Object.defineProperty': function () {
					try {
						var obj = {};
						Object.defineProperty(obj, 'test', { enumerable: false, configurable: true, value: true });
						return obj.test;
					}
					catch (e) {
						return false;
					}
				}
			},

			'should parse links in the entity': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; });

				client().then(function (response) {
					assert.same(parent, response.entity._links.parentLink);
					assert.same(self, response.entity._links.selfLink);
				}).then(undef, fail).always(done);
			},
			'should parse links in the entity into the entity': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; }, { target: '' });

				client().then(function (response) {
					assert.same(parent, response.entity.parentLink);
					assert.same(self, response.entity.selfLink);
				}).then(undef, fail).always(done);
			},
			'should create a client for the related resource': function (done) {
				var client, body, parent, self;

				parent = { rel: 'parent', href: '/' };
				self = { rel: 'self', href: '/resource' };

				body = { links: [ parent, self ]};
				client = hateoas(function () { return { entity: body }; });

				client().then(function (response) {
					var parentClient = response.entity._links.clientFor('parent', function (request) { return { request: request }; });
					return parentClient().then(function (response) {
						assert.same(parent.href, response.request.path);
					});
				}).then(undef, fail).always(done);
			},
			'should fetch a related resource': function (done) {
				// NOTE this functionality requires a native implementation of Object.defineProperty
				var client, parentClient;

				parentClient = function (request) {
					return request.path === '/' ?
						{ request: request, entity: { links: [ { rel: 'self', href: '/' }, { rel: 'child', href: '/resource' } ] } } :
						{ request: request, entity: { links: [ { rel: 'self', href: '/resource' }, { rel: 'parent', href: '/' } ] } };
				};
				client = hateoas(parentClient);

				client({ path: '/' }).then(function (response) {
					assert.same('/', response.request.path);
					assert.same('/', response.entity._links.selfLink.href);
					return response.entity._links.child.then(function (response) {
						assert.same('/resource', response.request.path);
						assert.same('/resource', response.entity._links.selfLink.href);
					});
				}).then(undef, fail).always(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, hateoas().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof hateoas().chain === 'function');
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
