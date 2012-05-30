(function (define) {

	define([], function () {
		"use strict";

		// A poor man's pub-sub.  A single listener is supported per topic.  When
		// the topic is published, the listener is unsubscribed.

		var topics = {};

		/**
		 * Publishes the message to the topic, invoking the listener.
		 *
		 * The listener is unsubscribed from the topic after receiving a message.
		 *
		 * @param {String} topic the topic to publish to
		 * @param {Object} message message to publish
		 */
		function publish(topic, message) {
			if (!topics[topic]) { return; }
			topics[topic].apply({}, Array.prototype.slice.call(arguments, 1));
			// auto cleanup
			delete topics[topic];
		}

		/**
		 * Register a callback function to receive notification of a message published to the topic.
		 *
		 * Any existing callback for the topic will be unsubscribed.
		 *
		 * @param {String} topic the topic to listen on
		 * @param {Function} callback the callback to receive the message published to the topic
		 */
		function subscribe(topic, callback) {
			topics[topic] = callback;
		}

		return {
			publish: publish,
			subscribe: subscribe
		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
