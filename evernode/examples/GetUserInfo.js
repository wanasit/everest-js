/*
    UserInfo.js

    This is a simple example in order to get the user information and print it out to the screen.
    Note that you must already have an OAuth token for the user. Please replace it below.
 */

var thrift = require('thrift'),
    customConnections = require('../lib/evernode/CustomConnections'),
    UserStore = require('../lib/evernote-thrift/gen-nodejs/UserStore');

var evernoteServer = "sandbox.evernote.com"; //For production use: www.evernote.com
var oAuthToken = "XXXXXXXXX"; //OAuth Token of the user

var userConnection = customConnections.createHTTPSConnection(evernoteServer, 443, '/edam/user');
var userClient = thrift.createClient(UserStore, userConnection);

var newString = 'ewrewr/fdsf';

userClient.getUser(oAuthToken, function(err, response) {
  if (err) {
    console.error("Error back from API: " + err);
  } else {
    console.log("retrieved:", JSON.stringify(response));
  }
});

