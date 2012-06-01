(function (buster, define) {

	var normalizeHeaderName, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/normalizeHeaderName', {
		setUp: function (done) {
			if (normalizeHeaderName) { return done(); }
			define('rest/util/normalizeHeaderName-test', ['rest/util/normalizeHeaderName'], function (nhn) {
				normalizeHeaderName = nhn;
				done();
			});
		},

		'should normalize header names': function () {
			assert.equals('Accept', normalizeHeaderName('accept'));
			assert.equals('Accept', normalizeHeaderName('ACCEPT'));
			assert.equals('Content-Length', normalizeHeaderName('content-length'));
			assert.equals('X-Some-Custom-Header', normalizeHeaderName('x-some-custom-header'));
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../util/normalizeHeaderName'));
	}
	// Boilerplate for AMD and Node
));
