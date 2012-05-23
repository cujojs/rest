(function(buster, entity) {

var assert, refute;

assert = buster.assertions.assert;
refute = buster.assertions.refute;

buster.testCase('rest/interceptor/entity', {
	'should return the response entity': function(done) {
		var client, body;

		body = {};
		client = entity(function() { return { entity: body }; });

		client().then(
			function(response) {
				assert.same(body, response);
				done();
			}
		);
	},
	'should return the whole response if there is no entity': function(done) {
		var client, response;

		response = {};
		client = entity(function() { return response; });

		client().then(
			function(r) {
				assert.same(response, r);
				done();
			}
		);
	}
});

})(
	this.buster || require('buster'),
	this.rest_interceptor_entity || require('../../src/rest/interceptor/entity')
);
