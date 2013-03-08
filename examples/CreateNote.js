

var authToken = "EVERNOTE_TOKEN"; //The token

var config   = require('../config.js');
var Evernote = require('../evernode').Evernote;
var util = require('util');

var evernote = new Evernote(
    config.evernoteConsumerKey,
    config.evernoteConsumerSecret,
    config.evernoteUsedSandbox
  );

  var note = { title: 'Hello World!!', 
    content: '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n'
    +'<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;">'
    +'<div>Hello!!</div>'
    +'<div></div>'
    +'<div>This is a note created by Everest.js</div>'
    +'</en-note>' }

//Get the user object....
evernote.getUser(authToken,function(err, edamUser) {
	
	if (err)  return console.log(err);
  
  //Find the notes....
  evernote.createNote(edamUser,  note, function(err, note) {
    
    if (err)  return console.log(err);
    
    return console.log(note);
  });
});

