(function (buster, define) {

	var json, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/mime/type/application/json', {
		setUp: function (done) {
			if (json) { return done(); }
			define('rest/mime/type/application/json-test', ['rest/mime/type/application/json'], function (j) {
				json = j;
				done();
			});
		},

		'should read json': function () {
			assert.equals({ foo: 'bar' }, json.read('{"foo":"bar"}'));
		},
		'should stringify json': function () {
			assert.equals('{"foo":"bar"}', json.write({ foo: 'bar' }));
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../../../mime/type/application/json'));
	}
	// Boilerplate for AMD and Node
));