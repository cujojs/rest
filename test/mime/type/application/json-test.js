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

  define('rest-test/mime/type/application/json-test', function (require) {
    var json = require('rest/mime/type/application/json')

    buster.testCase('rest/mime/type/application/json', {
      'should read json': function () {
        assert.equals({ foo: 'bar' }, json.read('{"foo":"bar"}'))
      },
      'should stringify json': function () {
        assert.equals('{"foo":"bar"}', json.write({ foo: 'bar' }))
      },
      'should use provided reviver and replacer': function () {
        var reviver = function reviver () {}
        var replacer = []
        var customJson = json.extend(reviver, replacer)

        assert.equals(void 0, customJson.read('{"foo":"bar"}'))
        assert.equals('{}', customJson.write({ foo: 'bar' }))

        // old json convert is unmodified
        assert.equals({ foo: 'bar' }, json.read('{"foo":"bar"}'))
        assert.equals('{"foo":"bar"}', json.write({ foo: 'bar' }))
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
