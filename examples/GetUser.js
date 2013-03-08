

var authToken = "EVERNOTE_TOKEN"; //The token

var config   = require('../config.js');
var Evernote = require('../evernode').Evernote;
var util = require('util');

var evernote = new Evernote(
    config.evernoteConsumerKey,
    config.evernoteConsumerSecret,
    config.evernoteUsedSandbox
  );

var offset 		= 0;
var count 		= 10;
var words 		= ''; // Key Words
var sortOrder = 'UPDATED' // 'CREATED';
var ascending = false;

//Get the user object....
evernote.getUser(authToken,function(err, edamUser) {
	
	if (err)  return console.log(err);
  return console.log(edamUser);
});

