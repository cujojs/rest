(function (buster, define) {

	var beget, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/beget', {
		setUp: function (done) {
			if (beget) { return done(); }
			define('rest/util/beget-test', ['rest/util/beget'], function (b) {
				beget = b;
				done();
			});
		},

		'should return an emtpy object for no args': function () {
			var result, prop;
			result = beget();
			assert(result);
			for (prop in result) {
				refute(result.hasOwnProperty(prop));
			}
		},
		'should return new object with same properties': function () {
			var orig, suppliment, result;
			orig = {};
			suppliment = { foo: 'bar' };
			result = beget(orig, suppliment);
			refute.same(orig, result);
			assert.equals(suppliment, result);
		},
		'should return new object, suplimented': function () {
			var orig, suppliment, result;
			orig = { foo: 'bar', 'proto': 'protoValue' };
			suppliment = { foo: 'foo', mine: 'mineValue' };
			result = beget(orig, suppliment);
			assert.equals('foo', result.foo);
			assert.equals('protoValue', result.proto);
			refute(result.hasOwnProperty('proto'));
			assert.equals('mineValue', result.mine);
			assert(result.hasOwnProperty('mine'));
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../util/beget'));
	}
	// Boilerplate for AMD and Node
));
