(function (buster, registry, when) {

	var assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	function never(done) {
		return function () {
			assert(false, 'should never be called');
			done();
		};
	}

	buster.testCase('rest/mime/registry', {
		'should discover unregisted serializers': function (done) {
			when(
				registry.lookup('text/plain'),
				function (serializer) {
					assert.isFunction(serializer.read);
					assert.isFunction(serializer.write);
					done();
				},
				never(done)
			);
		},
		'should return registed serializer': function (done) {
			var serializer = {};
			registry.register('application/vnd.com.foo', serializer);
			when(
				registry.lookup('application/vnd.com.foo'),
				function (s) {
					assert.same(serializer, s);
					done();
				},
				never(done)
			);
		},
		'should reject for non-existant serializer': function (done) {
			when(
				registry.lookup('application/bogus'),
				never(done),
				function () {
					assert(true);
					done();
				}
			);
		},
	});

}(
	this.buster || require('buster'),
	this.rest_mime_registry || require('../../src/rest/mime/registry'),
	this.when || require('../../node_modules/when/when')
));
