/*
 * Copyright 2015 the original author or authors
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

	define('rest-test/util/attempt-test', function (require) {

		var attempt = require('rest/util/attempt');

		buster.testCase('rest/util/attempt', {
			'resolves with returned values': function () {
				function work() {
					return 'hello';
				}

				return attempt(work).then(
					function (value) {
						assert.equals('hello', value);
					},
					fail
				);
			},
			'rejects with thrown values': function () {
				function work() {
					throw 'world';
				}

				return attempt(work).then(
					fail,
					failOnThrow(function (value) {
						assert.equals('world', value);
					})
				);
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
