/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

/* eslint-env amd */

(function (buster, define) {
  'use strict'

  var assert = buster.assertions.assert
  var fail = buster.assertions.fail

  define('rest-test/interceptor/hateoas-test', function (require) {
    var hateoas = require('rest/interceptor/hateoas')
    var rest = require('rest')

    var supports = {
      'Object.defineProperty': (function () {
        try {
          var obj = {}
          Object.defineProperty(obj, 'test', { enumerable: false, configurable: true, value: true })
          return obj.test
        } catch (e) {
          return false
        }
      }()),
      'ES5 getters': (function () {
        try {
          var obj = {}
          Object.defineProperty(obj, 'test', { get: function () { return true } })
          return obj.test
        } catch (e) {
          return false
        }
      }())
    }

    buster.testCase('rest/interceptor/hateoas', {
      'should parse header links': function () {
        var headers = {
          Link: [
            '<http://example.com/TheBook/chapter2>; rel="previous"; title="previous chapter"',
            '<http://example.com/TheBook/chapter4>; rel="next"; title="next chapter"'
          ]
        }
        var entity = {}
        var client = hateoas(function () { return { entity: entity, headers: headers } })

        return client().then(function (response) {
          assert('previous' in response.links)
          assert.same(response.links.previousLink.href, 'http://example.com/TheBook/chapter2')
          assert.same(response.links.previousLink.title, 'previous chapter')
          assert('next' in response.links)
          assert.same(response.links.nextLink.href, 'http://example.com/TheBook/chapter4')
          assert.same(response.links.nextLink.title, 'next chapter')
        })['catch'](fail)
      },
      'should parse compound header links': function () {
        var headers = { Link: '<http://example.com/TheBook/chapter2>; rel="previous"; title="previous chapter", <http://example.com/TheBook/chapter4>; rel="next"; title="next chapter"' }
        var entity = {}
        var client = hateoas(function () { return { entity: entity, headers: headers } })

        return client().then(function (response) {
          assert('previous' in response.links)
          assert.same(response.links.previousLink.href, 'http://example.com/TheBook/chapter2')
          assert.same(response.links.previousLink.title, 'previous chapter')
          assert('next' in response.links)
          assert.same(response.links.nextLink.href, 'http://example.com/TheBook/chapter4')
          assert.same(response.links.nextLink.title, 'next chapter')
        })['catch'](fail)
      },
      'should gracefully recover from maleformed header links': function () {
        var headers = { Link: 'foo bar' }
        var entity = {}
        var client = hateoas(function () { return { entity: entity, headers: headers } })

        return client().then(function (response) {
          assert.same(entity, response.entity)
        })['catch'](fail)
      },
      '': {
        requiresSupportFor: { 'Object.defineProperty': supports['Object.defineProperty'] },

        'should parse links in the entity': function () {
          var parent = { rel: 'parent', href: '/' }
          var self = { rel: 'self', href: '/resource' }

          var body = { links: [ parent, self ] }
          var client = hateoas(function () { return { entity: body } }, { target: '_links' })

          return client().then(function (response) {
            assert.same(parent, response.entity._links.parentLink)
            assert.same(self, response.entity._links.selfLink)
          })['catch'](fail)
        },
        'should parse links in the entity into the entity': function () {
          var parent = { rel: 'parent', href: '/' }
          var self = { rel: 'self', href: '/resource' }

          var body = { links: [ parent, self ] }
          var client = hateoas(function () { return { entity: body } })

          return client().then(function (response) {
            assert.same(parent, response.entity.parentLink)
            assert.same(self, response.entity.selfLink)
          })['catch'](fail)
        },
        'should create a client for the related resource': function () {
          var parent = { rel: 'parent', href: '/' }
          var self = { rel: 'self', href: '/resource' }

          var body = { links: [ parent, self ] }
          var client = hateoas(function () { return { entity: body } })

          return client().then(function (response) {
            var parentClient = response.entity.clientFor('parent', function (request) { return { request: request } })
            return parentClient().then(function (response) {
              assert.same(parent.href, response.request.path)
            })
          })['catch'](fail)
        },
        'should return the same value for multiple property accesses': function () {
          var body = { links: [ { rel: 'self', href: '/resource' } ] }
          var client = hateoas(function (request) {
            return request.path ? { entity: body } : { entity: {} }
          })

          return client().then(function (response) {
            assert.same(response.entity.self, response.entity.self)
          })['catch'](fail)
        }
      },
      'should fetch a related resource': {
        requiresSupportFor: { 'ES5 getters': supports['ES5 getters'] },
        '': function () {
          var parentClient = function (request) {
            return request.path === '/'
              ? { request: request, entity: { links: [ { rel: 'self', href: '/' }, { rel: 'child', href: '/resource' } ] } }
              : { request: request, entity: { links: [ { rel: 'self', href: '/resource' }, { rel: 'parent', href: '/' } ] } }
          }
          var client = hateoas(parentClient)

          return client({ path: '/' }).then(function (response) {
            assert.same('/', response.request.path)
            assert.same('/', response.entity.selfLink.href)
            return response.entity.child.then(function (response) {
              assert.same('/resource', response.request.path)
              assert.same('/resource', response.entity.selfLink.href)
            })
          })['catch'](fail)
        }
      },
      'should have the default client as the parent by default': function () {
        assert.same(rest, hateoas().skip())
      },
      'should support interceptor wrapping': function () {
        assert(typeof hateoas().wrap === 'function')
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
