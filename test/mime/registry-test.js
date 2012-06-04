(function (buster, define) {

	var registry, when, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	buster.testCase('rest/mime/registry', {
		setUp: function (done) {
			if (registry) { return done(); }
			define('rest/mime/registry-test', ['rest/mime/registry', 'when'], function (r, w) {
				registry = r;
				when = w;
				done();
			});
		},

		'should discover unregisted serializers': function (done) {
			when(
				registry.lookup('text/plain'),
				function (serializer) {
					assert.isFunction(serializer.read);
					assert.isFunction(serializer.write);
				}
			).always(done);
		},
		'should return registed serializer': function (done) {
			var serializer = {};
			registry.register('application/vnd.com.foo', serializer);
			when(
				registry.lookup('application/vnd.com.foo'),
				function (s) {
					assert.same(serializer, s);
				}
			).always(done);
		},
		'should reject for non-existant serializer': function (done) {
			when(
				registry.lookup('application/bogus'),
				undefined,
				function () {
					assert(true);
				}
			).always(done);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../mime/registry'), require('when'));
	}
	// Boilerplate for AMD and Node
));
