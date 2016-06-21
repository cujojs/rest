/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

/* eslint-env amd */

(function (buster, define) {
  'use strict'

  var assert = buster.assertions.assert
  var refute = buster.assertions.refute

  define('rest-test/util/mixin-test', function (require) {
    var mixin = require('rest/util/mixin')

    buster.testCase('rest/util/mixin', {
      'should return an emtpy object for no args': function () {
        var mixed = mixin()
        assert(mixed)
        for (var prop in mixed) {
          refute(mixed.hasOwnProperty(prop))
        }
      },
      'should return original object': function () {
        var orig = { foo: 'bar' }
        var mixed = mixin(orig)
        assert.same(orig, mixed)
      },
      'should return original object, supplemented': function () {
        var orig = { foo: 'bar' }
        var supplemented = { foo: 'foo' }
        var mixed = mixin(orig, supplemented)
        assert.same(orig, mixed)
        assert.equals('foo', mixed.foo)
      }
    })
  })
}(
  this.buster || require('buster'),
  typeof define === 'function' && define.amd ? define : function (id, factory) {
    var packageName = id.split(/[\/\-]/)[0]
    var pathToRoot = id.replace(/[^\/]+/g, '..')
    pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot
    factory(function (moduleId) {
      return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId)
    })
  }
  // Boilerplate for AMD and Node
))
