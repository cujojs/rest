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

	define('rest-test/util/delay-test', function (require) {

		var delay = require('rest/util/delay');

		buster.testCase('rest/util/delay', {
			'delays promise resolution': function () {
				var start = Date.now();
				return delay(20, 'hello').then(
					function (value) {
						assert(Date.now() - start >= 10);
						assert.equals('hello', value);
					},
					fail
				);
			},
			'delayed from provided promise resolution': function () {
				var start, trigger;
				start = Date.now();
				trigger = new Promise(function (resolve) {
					setTimeout(function () {
						resolve('world');
					}, 20);
				});
				return delay(20, trigger).then(
					function (value) {
						assert(Date.now() - start >= 20);
						assert.equals('world', value);
					},
					fail
				);
			},
			'rejections are not delayed': function () {
				var start = Date.now();
				return delay(1000, Promise.reject('hello')).then(
					fail,
					failOnThrow(function (value) {
						assert(Date.now() - start < 100);
						assert.equals('hello', value);
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
