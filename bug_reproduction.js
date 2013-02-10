var Evernote = require('./evernode').Evernote;
var evernote = new Evernote('KEY','SECRET',true);
var authToken = 'DEV-TOKEN'

var note1 = { title: 'ccca', 
  content: '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n'
  +'<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;">'
  +'<blockquote>aaa<a href="http://www.zhihu.com/question/20366465/answer/14913636" >aaaaa</a></blockquote>'
  +'</en-note>' }

var note2 = { title: 'ccca',
  content: '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n'
  +'<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;">'
  +'<blockquote>aaa<a href="http://www.zhihu.com/question/20366465/answer/14913636" >aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</a></blockquote>'
  +'</en-note>' }

evernote.getUser(authToken, function(err, edamUser) {

	if (err) return console.log("Error getting userInfo");
  
  evernote.createNote(edamUser, note1, function(err, note) {
    
    if (err) return console.log("Error getting creteNote 1");
    
    console.log("Note 1...Created");
    
    evernote.createNote(edamUser, note2, function(err, note) {

      if (err) return console.log("Error getting creteNote 2");

      console.log("Note 2...Created");
    })
  })
});
