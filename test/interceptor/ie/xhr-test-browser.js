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

	define('rest/interceptor/ie/xhr-test', function (require) {

		var xhr, rest;

		xhr = require('rest/interceptor/ie/xhr');
		rest = require('rest');

		function defaultClient(request) {
			return { request: request };
		}

		buster.testCase('rest/interceptor/ie/xhr', {
			'should provide the native XHR object as the engine': {
				// native XHR
				requiresSupportFor: { xhr: !!XMLHttpRequest },
				'': function (done) {
					var client = xhr(defaultClient);
					client({}).then(function (response) {
						assert.same(XMLHttpRequest, response.request.engine);
					}).then(undef, fail).always(done);
				}
			},
			'should fall back to an ActiveX XHR-like object as the engine': {
				// XHR ActiveX fallback
				requiresSupportFor: { xhr: !XMLHttpRequest },
				'': function (done) {
					var client = xhr(defaultClient);
					client({}).then(function (response) {
						refute.same(XMLHttpRequest, response.request.engine);
						assert.same('function', typeof response.request.engine);
					}).then(undef, fail).always(done);
				}
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, xhr().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof xhr().chain === 'function');
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
