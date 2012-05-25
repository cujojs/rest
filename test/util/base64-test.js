(function (buster, base64) {

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/base64', {
		'should base64 encode strings': function () {
			assert.equals('Zm9v', base64.encode('foo'));
		},
		'should base64 decode strings': function () {
			assert.equals('foo', base64.decode('Zm9v'));
		}
	});

}(
	this.buster || require('buster'),
	this.rest_util_base64 || require('../../src/rest/util/base64')
));
