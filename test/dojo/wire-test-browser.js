(function (buster, define) {

	var resourcePlugin, RestStore, wire, when, assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	function client(request) {
		return when({ request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' });
	}

	buster.testCase('rest/dojo/wire', {
		setUp: function (done) {
			if (resourcePlugin) { return done(); }
			define('rest/dojo/wire-test', ['rest/dojo/wire', 'rest/dojo/RestStore', 'wire', 'when'], function (rp, RS, wi, wh) {
				resourcePlugin = rp;
				RestStore = RS;
				wire = wi;
				when = wh;
				done();
			});
		},

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

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('./rest/dojo/wire'), require('wire'), require('when'));
	}
	// Boilerplate for AMD and Node
));
