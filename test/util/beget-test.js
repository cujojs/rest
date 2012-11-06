(function (buster, define) {

	var assert, refute, undef;

	assert = buster.assert;
	refute = buster.refute;

	define('rest/util/beget-test', function (require) {

		var beget = require('rest/util/beget');

		buster.testCase('rest/util/beget', {
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
