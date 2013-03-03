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

	define('rest/mime/registry-test', function (require) {

		var mimeRegistry, when, registry;

		mimeRegistry = require('rest/mime/registry');
		when = require('when');

		buster.testCase('rest/mime/registry', {
			setUp: function () {
				registry = mimeRegistry.child();
			},
			'should discover unregisted converter': function (done) {
				registry.lookup('text/plain').then(function (converter) {
					assert.isFunction(converter.read);
					assert.isFunction(converter.write);
				}).then(undef, fail).always(done);
			},
			'should return registed converter': function (done) {
				var converter = {};
				registry.register('application/vnd.com.example', converter);
				registry.lookup('application/vnd.com.example').then(function (c) {
					assert.same(converter, c);
				}).then(undef, fail).always(done);
			},
			'should reject for non-existant converter': function (done) {
				registry.lookup('application/bogus').then(
					fail,
					function () {
						assert(true);
					}
				).always(done);
			},
			'should resolve converters from parent registries': function (done) {
				var child, converter;
				child = registry.child();
				converter = {};
				registry.register('application/vnd.com.example', converter);
				child.lookup('application/vnd.com.example').then(function (c) {
					assert.same(converter, c);
				}).then(undef, fail).always(done);
			},
			'should override parent registries when registering in a child': function (done) {
				var child, converterParent, converterChild;
				child = registry.child();
				converterParent = {};
				converterChild = {};
				registry.register('application/vnd.com.example', converterParent);
				child.register('application/vnd.com.example', converterChild);
				child.lookup('application/vnd.com.example').then(function (c) {
					assert.same(converterChild, c);
				}).then(undef, fail).always(done);
			},
			'should not have any side effects in a parent registry from a child': function (done) {
				var child, converterParent, converterChild;
				child = registry.child();
				converterParent = {};
				converterChild = {};
				registry.register('application/vnd.com.example', converterParent);
				child.register('application/vnd.com.example', converterChild);
				registry.lookup('application/vnd.com.example').then(function (c) {
					assert.same(converterParent, c);
				}).then(undef, fail).always(done);
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
