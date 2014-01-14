/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (buster, define) {
	'use strict';

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest-test', function (require) {

		var rest = require('rest');

		function client(request) {
			return { request: request };
		}

		buster.testCase('rest', {
			'should return a client by default': function () {
				assert.equals('function', typeof rest.getDefaultClient());
			},
			'should use the provided client as a default': function () {
				rest.setDefaultClient(client);
				assert.same(client, rest.getDefaultClient());
				assert.equals('request', rest('request').request);
			},
			'should restore the platform default client': function () {
				rest.setDefaultClient(client);
				rest.resetDefaultClient();
				refute.same(client, rest.getDefaultClient());
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
