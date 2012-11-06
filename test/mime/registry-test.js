(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;

	define('rest/mime/registry-test', function (require) {

		var registry, when;

		registry = require('rest/mime/registry');
		when = require('when');

		buster.testCase('rest/mime/registry', {
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

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
