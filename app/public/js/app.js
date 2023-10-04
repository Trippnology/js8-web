const $ = require('jquery');
const Nes = require('@hapi/nes/lib/client');

const client = new Nes.Client(
	`ws://${window.location.hostname}:${window.location.port}`,
);

function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

function trimTableToMaxRows(table, max_rows) {
	max_rows = max_rows || 20;
	const tableBody = $(`#${table} tbody`);
	const rowCount = tableBody.find('tr').length;

	if (rowCount > max_rows) {
		const rowsToRemove = rowCount - max_rows;
		tableBody.find('tr:lt(' + rowsToRemove + ')').remove();
	}
}

function createNewActivityRow(packet) {
	const newRow = $('<tr>').html(
		`<td>${packet.params.OFFSET}</td><td>${formatTimestamp(
			packet.params.UTC,
		)}</td><td>${String(packet.params.SNR).padStart(2, '0')} dB</td><td>${
			packet.value
		}</td>`,
	);

	$('#band-activity tbody').append(newRow);

	trimTableToMaxRows('band-activity', 20);
}

const start = async () => {
	await client.connect();
	const handler = (update, flags) => {
		//console.log(update.packet);
		switch (update.packet.type) {
			case 'RIG.PTT':
				console.log(`PTT is ${update.packet.value}`);
				if (update.packet.value === 'on') {
					$('#ptt-status')
						.removeClass('btn-success')
						.addClass('btn-danger');
				} else {
					$('#ptt-status')
						.removeClass('btn-danger')
						.addClass('btn-success');
				}
				break;
			case 'RX.DIRECTED':
				//console.log(update.packet);
				createNewActivityRow(update.packet);
				break;
		}
		//$(`#${update.id}`).append(update.status);
	};

	//client.subscribe('/events/debug', handler);
	client.subscribe('/events/rig/ptt', handler);
	//client.subscribe('/events/rx/activity', handler);
	client.subscribe('/events/rx/directed', handler);
	client.subscribe('/events/rx/directed/to_me', (update) => {
		console.log(update.packet);
		$('#qso-text').append(
			`\n${formatTimestamp(update.packet.params.UTC)} - (${
				update.packet.params.OFFSET
			}) - ${update.packet.value}`,
		);
		//trimTableToMaxRows('call-activity', 30);
	});
};

function callsignEvents() {
	$('.callsign').on('click', function (event) {
		event.preventDefault();
		const call = $(event.target).text();
		$('[data-target="#tab-qso"]').trigger('click');
		$('#qso_to').val(call);
		$('#qso_text').focus();
	});
}
window.callsignEvents = callsignEvents;

start();
