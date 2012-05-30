(function (buster, define) {

	var entity, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/entity', {
		setUp: function (done) {
			if (entity) { return done(); }
			define('rest/interceptor/entity-test', ['rest/interceptor/entity'], function (e) {
				entity = e;
				done();
			});
		},

		'should return the response entity': function (done) {
			var client, body;

			body = {};
			client = entity(function () { return { entity: body }; });

			client().then(
				function (response) {
					assert.same(body, response);
					done();
				}
			);
		},
		'should return the whole response if there is no entity': function (done) {
			var client, response;

			response = {};
			client = entity(function () { return response; });

			client().then(
				function (r) {
					assert.same(response, r);
					done();
				}
			);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../src/rest/interceptor/entity'));
	}
	// Boilerplate for AMD and Node
));