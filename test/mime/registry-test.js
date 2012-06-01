(function (buster, define) {

	var registry, when, assert, refute;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	function never(done) {
		return function () {
			assert(false, 'should never be called');
			done();
		};
	}

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
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../mime/registry'), require('when'));
	}
	// Boilerplate for AMD and Node
));
