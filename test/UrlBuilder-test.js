(function (buster, define) {

	var UrlBuilder, assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/UrlBuilder', {
		setUp: function (done) {
			if (UrlBuilder) { return done(); }
			define('rest/UrlBuilder-test', ['rest/UrlBuilder'], function (UB) {
				UrlBuilder = UB;
				done();
			});
		},

		'should use the provided template': function () {
			assert.equals('/foo/bar', new UrlBuilder('/foo/bar').build());
		},
		'should replace values in the provided template': function () {
			assert.equals('/foo/bar', new UrlBuilder('/foo/{foo}', { foo: 'bar' }).build());
		},
		'should add unused params to the query string': function () {
			assert.equals('/foo/bar?foo=bar', new UrlBuilder('/foo/bar', { foo: 'bar' }).build());
		},
		'should add only name of unused param to query string if value is null': function () {
			assert.equals('/foo/bar?foo', new UrlBuilder('/foo/bar', { foo: null }).build());
		},
		'should add only name of unused param to query string if value is undefined': function () {
			assert.equals('/foo/bar?foo', new UrlBuilder('/foo/bar', { foo: undef }).build());
		},
		'should add unused params to an exsisting query string': function () {
			assert.equals('/foo/bar?bleep=bloop', new UrlBuilder('/foo/{foo}', { foo: 'bar', bleep: 'bloop' }).build());
		},
		'should url encode all param names and values added to the url': function () {
			assert.equals('/foo/bar?bl%25eep=bl%20oop', new UrlBuilder('/foo/bar', { 'bl%eep': 'bl oop' }).build());
		},
		'should return a built url for string concatination': function () {
			assert.equals('/prefix/foo/bar', '/prefix' + new UrlBuilder('/foo/bar'));
		},
		'should append additional template to the current template': function () {
			var foo, bar;
			foo = new UrlBuilder('/foo');
			bar = foo.append('/bar');
			refute.same(foo, bar);
			assert.equals('/foo', foo.build());
			assert.equals('/foo/bar', bar.build());
		},
		'should add or override praram with appended values': function () {
			var foo, bar;
			foo = new UrlBuilder('/{foo}', { foo: '' });
			bar = foo.append('/bar', { foo: 'foo', bleep: 'bloop' });
			refute.same(foo, bar);
			assert.equals('/', foo.build());
			assert.equals('/foo/bar?bleep=bloop', bar.build());
		}
		// TODO test .absolute()
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../UrlBuilder'));
	}
	// Boilerplate for AMD and Node
));
