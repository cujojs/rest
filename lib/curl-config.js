(function (g) {

	g.curl = {
		debug: true,
		apiName: 'curl',
		baseUrl: '',
		packages: [
			{ name: 'rest', location: '', main: 'rest' },
			{ name: 'curl', location: 'node_modules/curl/src/curl', main: 'curl' },
			{ name: 'dojo', location: 'node_modules/dojo', main: 'dojo' },
			{ name: 'poly', location: 'node_modules/poly', main: 'poly' },
			{ name: 'when', location: 'node_modules/when', main: 'when' },
			{ name: 'wire', location: 'node_modules/wire', main: 'wire' }
		],
		preloads: ['poly/object', 'poly/array', 'poly/string', 'poly/xhr', 'poly/json']
	};

}(this));
