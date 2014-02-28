/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (buster, define) {
    'use strict';

    var assert, refute;

    assert = buster.assertions.assert;
    refute = buster.assertions.refute;

    define('rest/util/stream-test', function (require) {

        var stream = require('rest/util/stream');

        buster.testCase('rest/util/stream', {
            'should stream': function (done) {
                // test confirms existence, not full API coverage
                var input, output;
                input = new stream.PassThrough();
                output = new stream.PassThrough();
                input.pipe(output);
                output.on('data', function (chunk) {
                    assert.equals('hello', chunk);
                    done();
                });
                input.write('hello');
                input.end();
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
