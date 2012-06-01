(function (buster, define) {

	var plain, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/mime/type/text/plain', {
		setUp: function (done) {
			if (plain) { return done(); }
			define('rest/mime/type/text/plain-test', ['rest/mime/type/text/plain'], function (p) {
				plain = p;
				done();
			});
		},

		'should not change when writing string values': function () {
			assert.equals('7', plain.write('7'));
		},
		'should use the string representation for reading non-string values': function () {
			assert.equals('7', plain.write(7));
		},
		'should not change when reading string values': function () {
			assert.equals('7', plain.read('7'));
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../../../mime/type/text/plain'));
	}
	// Boilerplate for AMD and Node
));