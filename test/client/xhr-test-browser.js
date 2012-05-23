(function(buster, xhr) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('rest/client/xhr', {
	'should make a GET by default': function(done) {
		var request = { path: '/' };
		xhr(request).then(
			function(response) {
				var xhr = response.raw;
				assert.same(request, response.request);
				assert.equals(xhr.responseText, response.entity);
				assert.equals(xhr.status, response.status.code);
				assert.equals(xhr.statusText, response.status.text);
				for (var name in response.headers) {
					assert.equals(xhr.getResponseHeader(name), response.headers[name]);
				}
				done();
			}
		);
	},
	'should make a POST with an entity': function(done) {
		var request = { path: '/', method: 'post', entity: 'hello world' };
		xhr(request).then(
			function(response) {
				var xhr = response.raw;
				assert.same(request, response.request);
				assert.equals(xhr.responseText, response.entity);
				assert.equals(xhr.status, response.status.code);
				assert.equals(xhr.statusText, response.status.text);
				for (var name in response.headers) {
					assert.equals(xhr.getResponseHeader(name), response.headers[name]);
				}
				done();
			}
		);
	},
	// TODO spy XmlHttpRequest
});

})(
	this.buster || require('buster'),
	this.rest_client_xhr || require('../../src/rest/client/xhr')
);
