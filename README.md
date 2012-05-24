Rest Template
=============

[![Build Status](https://secure.travis-ci.org/scothis/rest.png?branch=master,dev)](http://travis-ci.org/scothis/rest)


...in progress...


Getting Started
---------------

Rest can be installed via NPM, or from source.

To install without source:

    $ npm install rest-template

From source:

    $ npm install

Rest is designed to run in a browser environment, utilizing AMD modules, or within Node.js.  [curl](https://github.com/cujojs/curl) is highly recommended as an AMD loader, although any loader should work.

An ECMAScript 5 compatible environment is assumed.  Older browsers that do not support ES5 natively can be shimmed.  Any shim should work, although we've tested against cujo's [poly](https://github.com/cujojs/poly)


Usage
-----

Using Rest is easy.  The core clients provide limited functionality around the request and response lifecycle.  The input and response objects are normalized to support portability between browser and server environments.

The response from a client is a promise that will be resolved when the remote request is finished.

The core client behavior can be augmented with interceptors.  An interceptor wraps the client and transforms the request and response.  For example: an interceptor may authenticate a request, or reject the promise if an error is encountered.  Interceptors may be combined to create a client with the desired behavior.  A configured interceptor acts just like a client.


### Making a basic request: ###

    define(['rest'], function(client) {
        client({ path: '/' }).then(function(response) {
            console.log('response: ', response);
        });
    });

In this example, you can see that the request object is very simple, it just includes the path.  All of the attributes of a request are optional.

The response should look familiar as well, it contains all the fields you would expect, including the response headers (many clients ignore the headers).


### Working with JSON: ###

If you're paying attention, you may have noticed that the response.entity in the previous example is a String.  Often we need to work with more complex data types.  For this, Rest supports a rich set of MIME type conversions with the `mime` interceptor.  The correct converter will automatically be chosen based on the Content-Type response header.  Custom converts can be registered for a MIME type, more on that later...

    define(['rest/interceptor/mime'], function(mime) {
        var client = mime();
        client({ path: '/data.json' }).then(function(response) {
            console.log('response: ', response);
        });
    });

Before an interceptor can be used, it needs to be configured.  In this case, we will accept the default configuration, and obtain a client.  Now when we see the response, the entity will be a JS object instead of a String.


### Composing Interceptors: ###

    define(['rest/interceptor/mime', 'rest/interceptor/errorCode'], function(mime, errorCode) {
        var client = mime();
        client = errorCode(client, { code: 500 });
        client({ path: '/data.json' }).then(
            function(response) {
                console.log('response: ', response);
            },
            function(response) {
                console.error('response error: ', response);
            }
        );
    });

In this example, we take the client create by the `mime` interceptor, and wrap it in the `errorCode` interceptor.  The errorCode interceptor can accept a configuration object that indicates what status codes should be considered an error.  In this case we override the default value of <=400, to only reject with 500 or greater status code.

Since the errorCode interceptor can reject the response promise, we also add a second handler function to receive the response for requests in error.

Clients can continue to be composed with interceptors as needed.  At any point the client as configured can be shared.  It is safe to share clients and allow other parts of your application to continue to compose other clients around the shared core.  Your client is protected from additional interceptors that other parts of the application may add.


### Custom MIME Converters: ###

    define(['rest/mime/registry'], function(registry) {
       registry.register('application/vnd.com.example', {
           read: function(str) {
               var obj = str;
               // do string to object conversions
               return obj;
           },
           write: function(obj) {
               var str = obj;
               // do object to string conversions
               return str;
           }
       });
    });

Registering a custom converter is a simple as calling the register function on the mime registry with the type and converter.  A converter has just two methods: `read` and `write`.  Read converts a String to a more complex Object.  Write converts an Object back into a String to be sent to the server.  HTTP is fundamentally a text based protocol after all.

Built in converters are available under `rest/mime/type/{type}`, as an example, JSON support is located at `rest/mime/type/application/json`.  You never need to know this as a consumer, but it's a good place to find examples.


Reporting Issues
----------------

Please report issues on [GitHub](https://github.com/scothis/rest/issues).  Include a brief description of the error, detailed information about the runtime (including shims) and any error messages.

Feature requests are also welcome.


Running the Tests
-----------------

The test suite can be run in two different modes: in node, or in a browser.  We use Buster.JS as the test harness, buster will be installed by npm for the node tests.  For browser tests, you may need to run `npm install -g buster` to make the buster commands available.

To run the suite in node:

    $ npm test

To run the suite in a browser:

    $ buster server &
    browse to http://localhost:1111/capture in the browser(s) you wish to test, tests can be run concurrently across multiple browsers

    $ buster test -e browser

    kill the server process or keep it in the background for further test runs


Thanks
------

* Arjen Poutsma - Creator of Spring's RestTemplate
* Brian Cavalier - cujo.js lead
* John Hann - cujo.js lead
* VMware - for allowing this project to be open sourced


Change Log
----------

No releases yet, soon

