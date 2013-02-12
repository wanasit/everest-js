/*
    GetNotebooks.js

    This example retrieves the user info about the user in order to construct a NoteClient.
    findNotebooks is then called to get a list of notebooks which are printed on the screen.
    Note that you must already have an OAuth token for the user. Please replace it below.
 */

var thrift = require('thrift'),
    customConnections = require('../lib/evernode/CustomConnections'),
    UserStore = require('../lib/evernote-thrift/gen-nodejs/UserStore')
    NoteStore = require('../lib/evernote-thrift/gen-nodejs/NoteStore');

var evernoteServer = "sandbox.evernote.com"; //For production use: www.evernote.com
var oAuthToken = "XXXXXXXXX"; //OAuth Token of the user

var userConnection = customConnections.createHTTPSConnection(evernoteServer, 443, '/edam/user');
var userClient = thrift.createClient(UserStore, userConnection);

//Helper method to build the noteClient for us
function buildNoteClientForUser(user) {
    var noteConnection = customConnections.createHTTPSConnection(evernoteServer, 443, '/edam/note/' + user.shardId);
    return thrift.createClient(NoteStore, noteConnection);
}

//Get user info and use the information to build the noteClient
userClient.getUser(oAuthToken, function(err, response) {
  if (err) {
    console.error("Error back from API: " + err);
  } else {
    var noteClient = buildNoteClientForUser(response);
    noteClient.listNotebooks(oAuthToken, function(err, response) {
      if (err) {
        console.error("Error back from API: " + err);
      } else {
        for(var i=0; i < response.length; i++) {
            var singleNotebook = response[i];
            console.log("Notebook (id=" + singleNotebook.guid + "): " + JSON.stringify(singleNotebook));
        }
      }
    });
  }
});



