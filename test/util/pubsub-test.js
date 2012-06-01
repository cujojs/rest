(function (buster, define) {

	var pubsub, assert, refute;

	assert = buster.assert;
	refute = buster.refute;

	buster.testCase('rest/util/pubsub', {
		setUp: function (done) {
			if (pubsub) { return done(); }
			define('rest/util/pubsub-test', ['rest/util/pubsub'], function (ps) {
				pubsub = ps;
				done();
			});
		},

		'should pass arguments to subscribed listener': function () {
			var callback = this.spy(function (value) {
				assert.equals('result', value);
			});
			pubsub.subscribe('topic', callback);
			pubsub.publish('topic', 'result');
			assert.called(callback);
		},
		'should ignore publish with no listeners': function () {
			pubsub.publish('topic', 'result');
			assert(true);
		},
		'should unsubscribe listener after publish': function () {
			var callback = this.spy(function (value) {
				assert.equals('result', value);
			});
			pubsub.subscribe('topic', callback);
			pubsub.publish('topic', 'result');
			pubsub.publish('topic', 'result2');
			assert.calledOnce(callback);
		},
		'should only call most recent listener': function () {
			var callback1, callback2;
			callback1 = this.spy();
			callback2 = this.spy(function (value) {
				assert.equals('result', value);
			});
			pubsub.subscribe('topic', callback1);
			pubsub.subscribe('topic', callback2);
			pubsub.publish('topic', 'result');
			assert.calledOnce(callback2);
			refute.called(callback1);
		}
	});

}(
	this.buster || require('buster'),
	typeof define === 'function' ? define : function (id, deps, factory) {
		factory(require('../../util/pubsub'));
	}
	// Boilerplate for AMD and Node
));
