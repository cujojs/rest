(function (buster, xhr, rest) {

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	function never(done) {
		return function () {
			assert(false, 'this method should never be invoked');
			done();
		};
	}

	buster.testCase('rest/client/xhr', {
		'should make a GET by default': function (done) {
			var request = { path: '/' };
			xhr(request).then(
				function (response) {
					var xhr, name;
					xhr = response.raw;
					assert.same(request, response.request);
					assert.equals(xhr.responseText, response.entity);
					assert.equals(xhr.status, response.status.code);
					assert.equals(xhr.statusText, response.status.text);
					for (name in response.headers) {
						assert.equals(xhr.getResponseHeader(name), response.headers[name]);
					}
					done();
				},
				never(done)
			);
		},
		'should make a POST with an entity': function (done) {
			var request = { path: '/', method: 'post', entity: 'hello world' };
			xhr(request).then(
				function (response) {
					var xhr, name;
					xhr = response.raw;
					assert.same(request, response.request);
					assert.equals(xhr.responseText, response.entity);
					assert.equals(xhr.status, response.status.code);
					assert.equals(xhr.statusText, response.status.text);
					for (name in response.headers) {
						assert.equals(xhr.getResponseHeader(name), response.headers[name]);
					}
					done();
				},
				never(done)
			);
		},
		'should be the default client': function () {
			assert.same(xhr, rest);
		}
		// TODO spy XmlHttpRequest
	});

}(
	this.buster,
	this.rest_client_xhr,
	this.rest
));
