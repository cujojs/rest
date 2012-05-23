(function(buster, normalizeHeaderName) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('rest/util/normalizeHeaderName', {
	'should normalize header names': function() {
		assert.equals('Accept', normalizeHeaderName('accept'));
		assert.equals('Accept', normalizeHeaderName('ACCEPT'));
		assert.equals('Content-Length', normalizeHeaderName('content-length'));
		assert.equals('X-Some-Custom-Header', normalizeHeaderName('x-some-custom-header'));
	}
});

})(
	this.buster || require('buster'),
	this.rest_util_normalizeHeaderName || require('../../src/rest/util/normalizeHeaderName')
);
