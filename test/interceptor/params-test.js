/*
 * Copyright 2016 the original author or authors
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

	define('rest-test/interceptor/params-test', function (require) {

		var params, rest;

		params = require('rest/interceptor/params');
		rest = require('rest');

		function parent(request) {
			return { request: request };
		}

		buster.testCase('rest/interceptor/params', {
			'should apply the params to the path': function () {
				var client, config;

				config = {};
				client = params(parent, config);

				return client({ path: '/dictionary/{lang}/{term}', params: { term: 'hypermedia', lang: 'en-us' } }).then(function (response) {
					assert.same('/dictionary/en-us/hypermedia', response.request.path);
					refute('params' in response.request);
				})['catch'](fail);
			},
			'should apply the params from the config if not defined on the request': function () {
				var client, config;

				config = { params: { lang: 'en-us' } };
				client = params(parent, config);

				return client({ path: '/dictionary/{lang}/{term}', params: { term: 'hypermedia' } }).then(function (response) {
					assert.same('/dictionary/en-us/hypermedia', response.request.path);
					refute('params' in response.request);
				})['catch'](fail);
			},
			'should apply the query params before config params': function () {
				var client, config;

				config = { params: { lang: 'en-us', term: 'invisible' } };
				client = params(parent, config);

				return client({ path: '/dictionary/{lang}/{term}', params: { term: 'hypermedia' } }).then(function (response) {
					assert.same('/dictionary/en-us/hypermedia', response.request.path);
					refute('params' in response.request);
				})['catch'](fail);
			},
			'should apply overdefined params to the query string': function () {
				var client, config;

				config = {};
				client = params(parent, config);

				return client({ path: '/dictionary', params: { q: 'hypermedia' } }).then(function (response) {
					assert.same('/dictionary?q=hypermedia', response.request.path);
					refute('params' in response.request);
				})['catch'](fail);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, params().skip());
			},
			'should support interceptor wrapping': function () {
				assert(typeof params().wrap === 'function');
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
