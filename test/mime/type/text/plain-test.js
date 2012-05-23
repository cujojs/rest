(function(buster, plain) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('rest/mime/type/text/plain', {
	'should not change when writing string values': function() {
		assert.equals('7', plain.write('7'));
	},
	'should use the string representation for reading non-string values': function() {
		assert.equals('7', plain.write(7));
	},
	'should not change when reading string values': function() {
		assert.equals('7', plain.read('7'));
	}
});

})(
	this.buster || require('buster'),
	this.rest_mime_type_text_plain || require('../../../../src/rest/mime/type/text/plain')
);
