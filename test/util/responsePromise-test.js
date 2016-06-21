/*
 * Copyright 2014-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

/* eslint-env amd */

(function (buster, define) {
  'use strict'

  var assert = buster.assertions.assert
  var refute = buster.assertions.refute
  var fail = buster.assertions.fail
  var failOnThrow = buster.assertions.failOnThrow

  define('rest-test/util/responsePromise-test', function (require) {
    var responsePromise = require('rest/util/responsePromise')
    var mime = require('rest/interceptor/mime')

    var client = mime(function (request) {
      var page = request.params && request.params.page || 0
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          if (request.canceled) {
            return reject({
              request: request,
              error: 'canceled'
            })
          }
          resolve({
            request: request,
            headers: {
              'Content-Type': 'application/hal+json'
            },
            entity: JSON.stringify({
              page: page,
              _links: {
                self: { href: request.path },
                next: { href: request.path + '/next' },
                search: { href: request.path + '/{?q}', templated: true }
              }
            })
          })
        }, 0)
      })
    })

    buster.testCase('rest/util/responsePromise', {
      'should be an instance of Promise': function () {
        assert(responsePromise() instanceof Promise)
      },

      'should resolve the response entity': function () {
        var response = responsePromise({ entity: 43 })

        return response.entity().then(
          function (entity) {
            assert.equals(43, entity)
          },
          fail
        )
      },
      'should resolve the response entity for a rejected promise': function () {
        var response = responsePromise.reject({ entity: 43 })

        return response.entity().then(
          fail,
          failOnThrow(function (entity) {
            assert.equals(43, entity)
          })
        )
      },

      'should resolve the response status code': function () {
        var response = responsePromise({ status: { code: 200 } })

        return response.status().then(
          function (status) {
            assert.equals(200, status)
          },
          fail
        )
      },
      'should resolve the response status code for a rejected promise': function () {
        var response = responsePromise.reject({ status: { code: 200 } })

        return response.status().then(
          fail,
          failOnThrow(function (status) {
            assert.equals(200, status)
          })
        )
      },

      'should resolve the response headers': function () {
        var headers = { 'Content-Type': 'text/plain' }
        var response = responsePromise({ headers: headers })

        return response.headers().then(
          function (_headers) {
            assert.same(headers, _headers)
          },
          fail
        )
      },
      'should resolve the response headers for a rejected promise': function () {
        var headers = { 'Content-Type': 'text/plain' }
        var response = responsePromise.reject({ headers: headers })

        return response.headers().then(
          fail,
          failOnThrow(function (_headers) {
            assert.same(headers, _headers)
          })
        )
      },

      'should resolve a response header': function () {
        var headers = { 'Content-Type': 'text/plain' }
        var response = responsePromise({ headers: headers })

        return response.header('Content-Type').then(
          function (_header) {
            assert.same(headers['Content-Type'], _header)
          },
          fail
        )
      },
      'should resolve a response header for a rejected promise': function () {
        var headers = { 'Content-Type': 'text/plain' }
        var response = responsePromise.reject({ headers: headers })

        return response.header('Content-Type').then(
          fail,
          failOnThrow(function (_header) {
            assert.same(headers['Content-Type'], _header)
          })
        )
      },
      'should resolve a response header, by the normalized name': function () {
        var headers = { 'Content-Type': 'text/plain' }
        var response = responsePromise({ headers: headers })

        return response.header('content-type').then(
          function (_header) {
            assert.same(headers['Content-Type'], _header)
          },
          fail
        )
      },
      'should cancel the request': {
        'by invoking the cancel method if available': function () {
          var request = {
            path: 'http://example.com',
            cancel: this.spy(function () {
              this.canceled = true
            })
          }
          return client(request).cancel().then(
            function (response) {
              fail(response)
            },
            failOnThrow(function (response) {
              assert.same(response.request, request)
              assert.called(request.cancel)
            })
          )
        },
        'by setting the canceled property if the cancel method is not available': function () {
          var request = { path: 'http://example.com' }
          return client(request).cancel().then(
            fail,
            failOnThrow(function (response) {
              assert.same(response.request, request)
              assert(request.canceled)
            })
          )
        }
      },
      'should follow hypermedia reltionships': {
        '': function () {
          return client('http://example.com').follow('next').entity().then(
            function (response) {
              assert.same('http://example.com/next', response._links.self.href)
            },
            fail
          )
        },
        'passing params': function () {
          return client('http://example.com').follow({ rel: 'next', params: { projection: 'limited' } }).then(
            function (response) {
              assert.same('limited', response.request.params.projection)
              assert.same('http://example.com/next', response.entity._links.self.href)
            },
            fail
          )
        },
        'applying params to templates': function () {
          return client('http://example.com').follow({ rel: 'search', params: { q: 'hypermedia client' } }).then(
            function (response) {
              assert.same('http://example.com/?q=hypermedia%20client', response.request.path)
              refute('params' in response.request)
            },
            fail
          )
        },
        'by chaining': function () {
          return client('http://example.com').follow('next').follow('next').entity().then(
            function (response) {
              assert.same('http://example.com/next/next', response._links.self.href)
            },
            fail
          )
        },
        'by inline chaining': function () {
          return client('http://example.com').follow(['next', 'next']).entity().then(
            function (response) {
              assert.same('http://example.com/next/next', response._links.self.href)
            },
            fail
          )
        },
        'with errors for non hypermedia responses': function () {
          return responsePromise({ entity: {} }).follow('next').then(
            fail,
            failOnThrow(function (err) {
              assert.same('Hypermedia response expected', err.message)
            })
          )
        },
        'with errors for unknown relationships': function () {
          return client('http://example.com').follow('prev').then(
            fail,
            failOnThrow(function (err) {
              assert.same('Unknown relationship: prev', err.message)
            })
          )
        }
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
