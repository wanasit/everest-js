/*
    FindNotes.js

    This example retrieves the user info about the user in order to construct a NoteClient.
    findNotes is then called with no filter for the first 10 notes.
    Note that you must already have an OAuth token for the user. Please replace it below.
 */

var thrift = require('thrift'),
    customConnections = require('../lib/evernode/CustomConnections'),
    UserStore = require('../lib/evernote-thrift/gen-nodejs/UserStore'),
    NoteTypes = require('../lib/evernote-thrift/gen-nodejs/NoteStore_types'),
    NoteStore = require('../lib/evernote-thrift/gen-nodejs/NoteStore');

var evernoteServer = "sandbox.evernote.com"; //For production use: www.evernote.com
var oAuthToken = "S=s1:U=ea8f:E=14362c3b643:C=13c0b128a43:P=1cd:A=en-devtoken:H=93d5cc39dcc28ef77fffa2f2fdb64008"; //OAuth Token of the user

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
    var noteFilter = new NoteTypes.NoteFilter();
    noteFilter.words = "";
    noteClient.findNotes(oAuthToken, noteFilter, 0, 10, function(err, response) {
      if (err) {
        console.error("Error back from API: " + err);
      } else {

        var totalNotes = response.totalNotes;
        var startIndex = response.startIndex;

        var notes = response.notes;

        for(var i=0; i < notes.length; i++) {
            var singleNote = notes[i];
            console.log("Note (id=" + singleNote.guid + "): " + JSON.stringify(singleNote));
        }
      }
    });
  }
});



