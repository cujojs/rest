(function (buster, mixin) {

	var assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/mixin', {
		'should return an emtpy object for no args': function () {
			var mixed, prop;
			mixed = mixin();
			assert(mixed);
			for (prop in mixed) {
				refute(mixed.hasOwnProperty(prop));
			}
		},
		'should return original object': function () {
			var orig, mixed;
			orig = { foo: 'bar' };
			mixed = mixin(orig);
			assert.same(orig, mixed);
		},
		'should return original object, supplemented': function () {
			var orig, supplemented, mixed;
			orig = { foo: 'bar' };
			supplemented = { foo: 'foo' };
			mixed = mixin(orig, supplemented);
			assert.same(orig, mixed);
			assert.equals('foo', mixed.foo);
		}
	});

}(
	this.buster || require('buster'),
	this.rest_util_mixin || require('../../src/rest/util/mixin')
));
