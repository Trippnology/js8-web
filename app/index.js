const Path = require('path');

const _ = require('lodash');
const Handlebars = require('handlebars');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Nes = require('@hapi/nes');

const internals = {
	templatePath: '',
	thisYear: new Date().getFullYear(),
};
const server = Hapi.server({
	port: 3000,
	host: '0.0.0.0',
	routes: {
		files: {
			relativeTo: Path.join(__dirname, 'public'),
		},
	},
});

function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

const init = async () => {
	await server.register([Inert, Vision, Nes]);
	const js8 = require('@trippnology/lib-js8call')({
		//debug: true,
		tcp: { host: '127.0.0.1' },
	});

	server.subscription('/events/{id}');
	// Send all incoming packets out over WS
	js8.on('packet', (packet) => {
		server.publish('/events/debug', { id: 'debug', packet: packet });
	});
	server.subscription('/events/rig/{id}');
	js8.on('rig.ptt', (packet) => {
		server.publish('/events/rig/ptt', { id: 'rig.ptt', packet: packet });
	});
	server.subscription('/events/rx/{id}');
	js8.on('rx.activity', (packet) => {
		server.publish('/events/rx/activity', {
			id: 'rx.activity',
			packet: packet,
		});
	});
	js8.on('rx.directed', (packet) => {
		server.publish('/events/rx/directed', {
			id: 'rx.directed',
			packet: packet,
		});
	});
	server.subscription('/events/rx/directed/{id}');
	js8.on('rx.directed.to_me', (packet) => {
		server.publish('/events/rx/directed/to_me', {
			id: 'rx.directed.to_me',
			packet: packet,
		});
	});

	server.route({
		method: 'GET',
		path: '/',
		handler: (request, h) => {
			const relativePath = Path.relative(
				`${__dirname}/../..`,
				`${__dirname}/templates/${internals.templatePath}`,
			);

			return h.view('index', {
				title: `Running ${relativePath} | hapi ${request.server.version}`,
			});
		},
	});

	server.route({
		method: 'GET',
		path: '/api/rx/band-activity',
		handler: async (request, h) => {
			const band_activity = await js8.rx.getBandActivity();
			/*const filtered_band_activity = _.map(band_activity, (item) => {
				return typeof item === 'object' ? item.TEXT : null;
			});*/
			const sorted_band_activity = _.sortBy(band_activity, 'UTC');
			let filtered_band_activity = _.map(sorted_band_activity, (item) => {
				if (typeof item != 'object') {
					return;
				}
				return `<tr><td>${item.OFFSET}</td><td>${formatTimestamp(
					item.UTC,
				)}</td><td>${String(item.SNR).padStart(2, '0')} dB</td><td>${
					item.TEXT
				}</td></tr>`;
			});
			return _.compact(filtered_band_activity).join('');
		},
	});

	server.route({
		method: 'GET',
		path: '/api/rx/call-activity',
		handler: async (request, h) => {
			const call_activity = await js8.rx.getCallActivity();
			const calls = Object.keys(call_activity);
			let patched_call_activity = _.map(calls, (call) => {
				let item = call_activity[call];
				if (typeof item === 'object') {
					item.CALL = call;
					return item;
				}
			});
			patched_call_activity = _.compact(patched_call_activity);
			const sorted_call_activity = _.sortBy(
				patched_call_activity,
				'UTC',
			).reverse();
			const output = _.map(sorted_call_activity, (item) => {
				return `<tr><td><a href="#" class="callsign">${
					item.CALL
				}</a></td><td>${item.GRID}</td><td>${
					item.SNR
				} dB</td><td>${formatTimestamp(item.UTC)}</td></tr>`;
			});
			return output.join('');
		},
	});

	server.route({
		method: 'GET',
		path: '/api/rx/qso',
		handler: async (request, h) => {
			const qso_text = await js8.rx.getText();
			let filtered_qso_text = qso_text.split('\n');
			filtered_qso_text = _.compact(filtered_qso_text);
			return filtered_qso_text.join('\n');
		},
	});

	server.route({
		method: 'GET',
		path: '/api/station/meta',
		handler: (request, h) => {
			return js8.station.getMetadata().then((meta) => {
				return `<p>Call: ${meta.callsign} | Grid: ${meta.grid}</p><p>Station info: ${meta.info}</p>`;
			});
		},
	});

	server.route({
		method: 'POST',
		path: '/api/tx/send-message',
		handler: (request, h) => {
			const pl = request.payload;
			const message = pl.qso_to
				? `${pl.qso_to} ${pl.qso_text}`
				: pl.qso_text;
			return js8.tx.sendMessage(message).then(async () => {
				const qso_text = await js8.rx.getText();
				let filtered_qso_text = qso_text.split('\n');
				filtered_qso_text = _.compact(filtered_qso_text);
				return filtered_qso_text.join('\n');
			});
		},
	});

	server.route({
		method: 'GET',
		path: '/css/{param*}',
		handler: {
			directory: {
				path: 'css',
			},
		},
	});

	server.route({
		method: 'GET',
		path: '/js/{param*}',
		handler: {
			directory: {
				path: 'js',
			},
		},
	});

	server.views({
		engines: { html: Handlebars },
		relativeTo: __dirname,
		path: `templates/${internals.templatePath}`,
	});
	await server.start();
	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	process.exit(1);
});

init();
