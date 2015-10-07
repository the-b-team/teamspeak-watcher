'use strict';

var net = require('net');
var util = require('util');
var events = require('events');

var mkUserObjs = require('./mk_user_objs');
var config = require('./config');
var slack = require('./slack');

var eventEmitter = new events.EventEmitter();

eventEmitter.on('userChange', function(nickname, status) {
    // do stuff when users change
    console.log(nickname + ' ' + status);
    slack(nickname, status);
});

// connect to TeamSpeak ServerQuery and login
var client = net.connect({host: config.hostname, port: config.port}, function() {
    client.write('login ' + config.sqUser + ' ' + config.sqPass + '\nuse ' + config.virtualServerId + '\n');
});

var knownUsersOnline = []; // global array containing list of known users online

// runs when data is received from the server
client.on('data', function(data) {
    // split data received at line breaks
    var msg = data.toString().split("\n\r");
    // check each line to see if it contains user data, if so, create user objects
    var currentUsersOnline;
    msg.forEach(function(val) {
        if (/^clid.*$/.test(val)) currentUsersOnline = mkUserObjs(val);
    });
    if (currentUsersOnline) { // currentUsersOnline is undefined if data did not contain a userlist
        var currentNicks = [];
        currentUsersOnline.forEach(function(user) {
            currentNicks.push(user.client_nickname);
            if (knownUsersOnline.indexOf(user.client_nickname) === -1) { // user came online
                eventEmitter.emit('userChange', user.client_nickname, 'online');
                knownUsersOnline.push(user.client_nickname); // add user to known users list
            }
        });
        knownUsersOnline.forEach(function(nickname) {
            if (currentNicks.indexOf(nickname) === -1) { // user went offline
                eventEmitter.emit('userChange', nickname, 'offline');
                knownUsersOnline.splice(knownUsersOnline.indexOf(nickname), 1); // remove user from known users list
            }
        });
    }
});

// Every 5 seconds, update user list; emits data
setInterval(function() {
    client.write('clientlist\n');
}, 5000);
