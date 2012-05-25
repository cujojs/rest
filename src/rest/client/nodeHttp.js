(function(define) {
define(["url","http","https","when", "../UrlBuilder", "../util/normalizeHeaderName"], function(parser, http, https, when, UrlBuilder, normalizeHeaderName) {
    "use strict";

    function parseResponse(request, clientResponse) {
        var d, response = {};

        d = when.defer();

        response.request = request;
        response.raw = clientResponse;
        response.status = {};
        response.status.code = clientResponse.statusCode;
        response.status.text = "";
        response.headers = clientResponse.headers;
        clientResponse.on("data", function(data){
            response.entity = !response.entity ? data : (response.entity+data);
        });
        clientResponse.on("end", function() {
            d.resolve(response);
        });

        return d.promise;
    }

    function nodeHttp(request) {
        var d, httpsExp, options, clientRequest, client, url, headers, entity;

        httpsExp = /^https/;
        d = when.defer();

        url = new UrlBuilder(request.path || "", request.params).build();
        client = url.match(httpsExp) ? https : http;

        options = parser.parse(url);
        options.method = request.method || 'GET';
        headers = options.headers = request.headers ? request.headers : {};
        entity = request.entity;
        if (!headers['content-length']) {
            headers['content-length'] = entity ? Buffer.byteLength(entity,'utf8') : 0;
        }

        try {
            clientRequest = client.request(options, function(clientResponse) {
                when.chain(parseResponse(request, clientResponse), d.resolver);
            });

            if (entity) {
                clientRequest.write(entity);
            }
            clientRequest.end();
        } catch(e) {
            d.reject(e);
        }

        return d.promise;
    }

    return nodeHttp;

});

}(typeof define === 'function'
    ? define
    : function(deps, factory) {
        if (typeof module !== 'undefined') {
            module.exports = factory.apply(this, deps.map(require));
        } else {
            throw new Error('Unknown environment');
        }
    }
    // Boilerplate for AMD and Node;
));
