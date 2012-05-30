/*jshint bitwise: false */
(function (define) {

	/*
	 * Base64 encode / decode
	 * http://www.webtoolkit.info/
	 *
	 * Converted to AMD
	 */
	define([], function () {
		"use strict";

		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		/**
		 * Base64 encode input
		 *
		 * @param {String} input value to encode
		 * @return {String} the encoded value
		 */
		function encode(input) {
			var output, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i;

			output = "";
			i = 0;
			input = _utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i);
				i += 1;
				chr2 = input.charCodeAt(i);
				i += 1;
				chr3 = input.charCodeAt(i);
				i += 1;

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
				chars.charAt(enc1) + chars.charAt(enc2) +
				chars.charAt(enc3) + chars.charAt(enc4);

			}

			return output;
		}

		/**
		 * Base64 decode input
		 *
		 * @param {String} input the value to decode
		 * @return {String} the decoded value
		 */
		function decode(input) {
			var output, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i;

			output = "";
			i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = chars.indexOf(input.charAt(i));
				i += 1;
				enc2 = chars.indexOf(input.charAt(i));
				i += 1;
				enc3 = chars.indexOf(input.charAt(i));
				i += 1;
				enc4 = chars.indexOf(input.charAt(i));
				i += 1;

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 !== 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 !== 64) {
					output = output + String.fromCharCode(chr3);
				}

			}

			output = _utf8_decode(output);

			return output;

		}

		function _utf8_encode(string) {
			var utftext, n, c;

			utftext = "";
			string = string.replace(/\r\n/g, '\n');

			for (n = 0; n < string.length; n += 1) {

				c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		}

		function _utf8_decode(utftext) {
			var string, i, c, c1, c2, c3;

			string = "";
			i = 0;
			c = c1 = c2 = 0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i += 1;
				}
				else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		}

		return {
			encode: encode,
			decode: decode
		};

	});

}(
	typeof define === 'function' ? define : function (deps, factory) {
		module.exports = factory.apply(this, deps.map(require));
	}
	// Boilerplate for AMD and Node
));
