/*
 * Copyright 2012-2013 the original author or authors
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

	define('rest/interceptor/entity-test', function (require) {

		var entity, rest;

		entity = require('rest/interceptor/entity');
		rest = require('rest');

		buster.testCase('rest/interceptor/entity', {
			'should return the response entity': function (done) {
				var client, body;

				body = {};
				client = entity(function () { return { entity: body }; });

				client().then(function (response) {
					assert.same(body, response);
				}).otherwise(fail).ensure(done);
			},
			'should return the whole response if there is no entity': function (done) {
				var client, response;

				response = {};
				client = entity(function () { return response; });

				client().then(function (r) {
					assert.same(response, r);
				}).otherwise(fail).ensure(done);
			},
			'should have the default client as the parent by default': function () {
				assert.same(rest, entity().skip());
			},
			'should support interceptor chaining': function () {
				assert(typeof entity().chain === 'function');
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
