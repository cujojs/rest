(function (buster, define) {

	var clientPlugin, wire, when, assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	function never(done) {
		return function () {
			assert(false, 'should never be called');
			done();
		};
	}

	buster.testCase('rest/wire', {
		setUp: function (done) {
			if (clientPlugin) { return done(); }
			define('rest/wire-test', ['rest/wire', 'wire', 'when'], function (cp, wi, wh) {
				clientPlugin = cp;
				wire = wi;
				when = wh;
				done();
			});
		},

		'should use default client! config': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!', client: client },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({}),
					function (response) {
						assert.equals('bar', response.foo);
						done();
					},
					never(done)
				);
			});
		},
		'should use client! config with entity interceptor disabled': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!path', client: client, accept: 'text/plain', entity: false },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({ path: 'to/somewhere' }),
					function (response) {
						assert.equals('path/to/somewhere', response.request.path);
						assert.equals('text/plain', response.request.headers.Accept);
						assert.equals('bar', response.entity.foo);
						done();
					},
					never(done)
				);
			});
		},
		'should be rejected for a server error status code': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!', client: client },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({}),
					never(done()),
					function (response) {
						assert.equals('bar', response.entity.foo);
						done();
					}
				);
			});
		},
		'should ignore status code when errorCode interceptor is disabled': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 500 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!', client: client, errorCode: false },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({}),
					function (response) {
						assert.equals('bar', response.entity.foo);
						done();
					},
					never(done())
				);
			});
		},
		'should ignore Content-Type and entity when mime interceptor is disabled': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!', client: client, mime: false },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({}),
					function (response) {
						assert.isString(response);
						done();
					},
					never(done())
				);
			});
		},
		'should use JSON as the default Content-Type for POSTs': function (done) {
			var spec, client;
			client = function (request) {
				return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
			};
			spec = {
				client: { $ref: 'client!', client: client, entity: false },
				plugins: [{ module: 'rest/wire' }]
			};
			wire(spec).then(function (spec) {
				when(spec.client({ method: 'post', entity: { bleep: 'bloop' } }),
					function (response) {
						assert.equals('{"bleep":"bloop"}', response.request.entity);
						assert.equals(0, response.request.headers.Accept.indexOf('application/json'));
						assert.equals('application/json', response.request.headers['Content-Type']);
						done();
					},
					never(done())
				);
			});
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('./rest/wire'), require('wire'), require('when'));
	}
	// Boilerplate for AMD and Node
));
