# wire.js

[wire.js](https://github.com/cujojs/wire/) is an Inversion of Control container that allows applications to be composed together at runtime based on a declarative configuration. A rest.js plugin is provided for wire.js that enables declarative configuration of rest.js clients, including chaning interceptors with their configuration.


<a name="module-rest/wire"></a>
## Wire Plugin

`rest/wire` ([src](../wire.js))

There are two aspects to the wire plugin the `rest` factory, and the `client!` reference resolver.

**TIP:** In each of these examples, `{ module: 'rest/wire' }` is loaded as it provides the 'rest' factory to the wire.js spec.  Without this module being loaded into the spec, the facilities below will silently fail.


<a name="wire-rest-factory"></a>
### 'rest' Factory

The `rest` factory provides a declarative way to define a client with an interceptor chain that is nearly identical in capability to imperative JavaScript. The factory access two main config properties, a parent client, and an array of interceptors. Each entry in the interceptor array contains a reference to the interceptor module, and the configuration for that interceptor. The array of interceptors is chained off the client in order returning the resulting client as the wire.js component.

In it's basic form, the array of interceptors is processed in order, wrapping the parent client.

```javascript
client: {
    rest: {
        parent: { $ref: 'baseClient' },
        interceptors: [
            { module: 'rest/interceptor/mime', config: { mime: 'application/json' } },
            { module: 'rest/interceptor/location' },
            { module: 'rest/interceptor/entity' },
            { module: 'rest/interceptor/hateoas', config: { target: '' } }
        ]
    }
},
baseClient: { module: 'rest' },
$plugins: [{ module: 'rest/wire' }]
```

If parent is not defined, or is not a function, the default client is used as the parent. In that case, the interceptors array can replace the whole factory object

```javascript
client: {
    rest: [
        { module: 'rest/interceptor/mime', config: { mime: 'application/json' } },
        { module: 'rest/interceptor/location' },
        { module: 'rest/interceptor/entity' },
        { module: 'rest/interceptor/hateoas', config: { target: '' } }
    ]
},
$plugins: [{ module: 'rest/wire' }]
```

If a configuration element isn't needed, a string can be provided to represent the module

```javascript
client: {
    rest: [
        { module: 'rest/interceptor/mime', config: { mime: 'application/json' } },
        'rest/interceptor/location',
        'rest/interceptor/entity',
        { module: 'rest/interceptor/hateoas', config: { target: '' } }
    ]
},
$plugins: [{ module: 'rest/wire' }]
```

An individual interceptors array entry can use any facility available within wire.js, including $ref.

```javascript
client: {
    rest: [
        { $ref: 'mime', config: { mime: 'application/json' } },
        'rest/interceptor/location',
        'rest/interceptor/entity',
        { $ref: 'hateoas', config: { target: '' } }
    ]
},
mime: { module: 'rest/interceptor/mime' },
hateoas: { module: 'rest/interceptor/hateoas' },
$plugins: [{ module: 'rest/wire' }]
```


<a name="wire-client-resolver"></a>
### 'client!' Reference Resolver

The client! reference resolver installs several commonly used interceptors, wrapping the default client. In order, the interceptors installed are the \'errorCode', \'mime', \'entity' and \'pathPrefix'. Basic options are configurable. It is intended as a quick and dirty way to get a functional client quickly. In most cases, the \'rest' factory will be more useful.

<table>
<tr>
  <th>Property</th>
  <th>Required?</th>
  <th>Default</th>
  <th>Description</th>
</tr>
<tr>
  <td>client</td>
  <td>optional</td>
  <td><em>default client</em></td>
  <td>client to wrap with the configured interceptors
</tr>
<tr>
  <td>errorCode</td>
  <td>optional</td>
  <td>400</td>
  <td>response status code above which to make the response in error, provided a boolean false to block installing the <code>errorCode</code> interceptor</td>
</tr>
<tr>
  <td>mime</td>
  <td>optional</td>
  <td>'application/x-www-form-urlencoded'</td>
  <td>mime type for request entities, provided a boolean false to block installing the <code>mime</code> interceptor</td>
</tr>
<tr>
  <td>accept</td>
  <td>optional</td>
  <td><em>mime value</em></td>
  <td>accept header for the request</td>
</tr>
<tr>
  <td>entity</td>
  <td>optional</td>
  <td><em>none</em></td>
  <td>provided a boolean false to block installing the <code>entity</code> interceptor</td>
</tr>
</table>

The pathPrefix interceptor is not configured via a property, but the string after the '!'.

```javascript
client: {
	{ $ref: 'client!' }
}
```

Is equivlent to:

```javascript
client = rest.wrap(errorCode, { code: 400 })
             .wrap(mime, { mime: 'application/x-www-form-urlencoded' })
             .wrap(entity)
             .wrap(pathPrefix, { prefix: '' });
```

To disable interceptors, provide a boolean false for the config value

```javascript
client: {
	{ $ref: 'client!', errorCode: false, mime: false, entity: false }
}
```

Is equivlent to:

```javascript
client = rest.wrap(pathPrefix, { prefix: '' });
```

A custom client can be used instead of the default client

```javascript
client: {
	{ $ref: 'client!', client: { ref: 'someOtherClient' } }
}
```

Is equivlent to:

```javascript
client = someOtherClient.wrap(errorCode, { code: 400 })
                        .wrap(mime, { mime: 'application/x-www-form-urlencoded' })
                        .wrap(entity)
                        .wrap(pathPrefix, { prefix: '' });
```

A [Dojo Store](dojo.md#dojo-stores) variant of the `client!` reference resolver is available as `resource!` from [`rest/dojo/wire`](dojo.md#module-rest/dojo/wire).
