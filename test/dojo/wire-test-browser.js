(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	define('rest/dojo/wire-test', function (require) {

		var resourcePlugin, RestStore, wire, when;

		resourcePlugin = require('rest/dojo/wire');
		RestStore = require('rest/dojo/RestStore');
		wire = require('wire');
		when = require('when');

		function client(request) {
			return when({
				request: request,
				status: { code: 200 },
				headers: {
					'Content-Type': 'application/json'
				},
				entity: '{"foo":"bar"}'
			});
		}

		buster.testCase('rest/dojo/wire', {
			'should create a RestStore for resource!': function (done) {
				var spec;
				spec = {
					store: { $ref: 'resource!', client: client },
					plugins: [{ module: 'rest/dojo/wire' }]
				};
				wire(spec).then(function (spec) {
					assert(spec.store instanceof RestStore);
				}).always(done);
			},
			'should get with resource! returning a promise': function (done) {
				var spec;
				spec = {
					resource: { $ref: 'resource!test/dojo', get: 'hello.json', entity: false, client: client },
					plugins: [{ module: 'rest/dojo/wire' }]
				};
				wire(spec).then(function (spec) {
					spec.resource.then(function (resource) {
						assert.equals('bar', resource.entity.foo);
						assert.equals('test/dojo/hello.json', resource.request.path);
					});
				}).always(done);
			},
			'should get with resource! returning data': function (done) {
				var spec;
				spec = {
					resource: { $ref: 'resource!test/dojo', get: 'hello.json', entity: false, wait: true, client: client },
					plugins: [{ module: 'rest/dojo/wire' }]
				};
				wire(spec).then(function (spec) {
					assert.equals('bar', spec.resource.entity.foo);
					assert.equals('test/dojo/hello.json', spec.resource.request.path);
				}).always(done);
			},
			'should support client!': function (done) {
				var spec;
				spec = {
					client: { $ref: 'client!', client: client },
					plugins: [{ module: 'rest/dojo/wire' }]
				};
				wire(spec).then(function (spec) {
					spec.client({}).then(
						function (response) {
							assert.equals('bar', response.foo);
						}
					);
				}).always(done);
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
