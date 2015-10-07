'use strict';
var https = require('https');
var config = require('./config');

module.exports = function(nickname, newStatus) {
	var payloadObject = {
		text: nickname + ' is now ' + newStatus
	};
	var payload = JSON.stringify(payloadObject);
	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': payload.length
	};
	var options = {
		host: 'hooks.slack.com',
		path: config.slackWebhookURL,
		method: 'POST',
		headers: headers
	};
	var req = https.request(options);
	req.write(payload);
	req.end();
	req.on('error', function(e) {
		console.error(e);
	});
};
