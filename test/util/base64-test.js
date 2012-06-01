(function (buster, define) {

	var base64, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/base64', {
		setUp: function (done) {
			if (base64) { return done(); }
			define('rest/util/base64-test', ['rest/util/base64'], function (b64) {
				base64 = b64;
				done();
			});
		},

		'should base64 encode strings': function () {
			assert.equals('Zm9v', base64.encode('foo'));
		},
		'should base64 decode strings': function () {
			assert.equals('foo', base64.decode('Zm9v'));
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../util/base64'));
	}
	// Boilerplate for AMD and Node
));
