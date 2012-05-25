(function (buster, mime) {

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/interceptor/mime', {
		'should return the response entity decoded': function (done) {
			var client;

			client = mime(function () {
				return { entity: '{}', headers: { 'Content-Type': 'application/json' } };
			});

			client({}).then(
				function (response) {
					assert.equals({}, response.entity);
					done();
				}
			);
		},
		'should encode the request entity': function (done) {
			var client;

			client = mime(
				function (request) {
					return { request: request, headers: {} };
				},
				{ mime: 'application/json' }
			);

			client({ entity: {} }).then(
				function (response) {
					assert.equals('{}', response.request.entity);
					done();
				}
			);
		}
	});

}(
	this.buster || require('buster'),
	this.rest_interceptor_mime || require('../../src/rest/interceptor/mime')
));
