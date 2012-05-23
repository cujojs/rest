(function(buster, json) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('rest/mime/type/text/json', {
	'should read json': function() {
		assert.equals({ foo: 'bar' }, json.read('{"foo":"bar"}'));
	},
	'should stringify json': function() {
		assert.equals('{"foo":"bar"}', json.write({ foo: 'bar' }));
	}
});

})(
	this.buster || require('buster'),
	this.rest_mime_type_application_json || require('../../../../src/rest/mime/type/application/json')
);
