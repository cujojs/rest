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

	define('rest/dojo/wire-test', function (require) {

		var resourcePlugin, RestStore, wire, when;

		resourcePlugin = require('rest/dojo/wire');
		RestStore = require('rest/dojo/RestStore');
		wire = require('wire');
		when = require('when');

		function client(request) {
			return {
				request: request,
				status: { code: 200 },
				headers: {
					'Content-Type': 'application/json'
				},
				entity: '{"foo":"bar"}'
			};
		}

		buster.testCase('rest/dojo/wire', {
			'should create a RestStore for resource!': function () {
				var spec;
				spec = {
					store: { $ref: 'resource!', client: client },
					$plugins: [{ module: 'rest/dojo/wire' }]
				};
				return wire(spec).then(function (spec) {
					assert(spec.store instanceof RestStore);
				}).otherwise(fail);
			},
			'should get with resource! waiting for data': function () {
				var spec;
				spec = {
					resource: { $ref: 'resource!test/dojo', get: 'hello.json', entity: false, client: client },
					$plugins: [{ module: 'rest/dojo/wire' }]
				};
				return wire(spec).then(function (spec) {
					assert.equals('bar', spec.resource.entity.foo);
					assert.equals('test/dojo/hello.json', spec.resource.request.path);
				}).otherwise(fail);
			},
			'should support client!': function () {
				var spec;
				spec = {
					client: { $ref: 'client!', client: client },
					$plugins: [{ module: 'rest/dojo/wire' }]
				};
				return wire(spec).then(function (spec) {
					return spec.client({}).then(function (response) {
						assert.equals('bar', response.foo);
					});
				}).otherwise(fail);
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
