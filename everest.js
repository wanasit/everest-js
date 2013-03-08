global.config = require('./config.js');

var util = require('util');
var querystring = require('querystring');
var express = require('express');
var config = global.config;

var app = express.createServer();

// Create an Evernote instance
var Evernote = require('./evernode').Evernote;
var evernote = new Evernote(
		config.evernoteConsumerKey,
		config.evernoteConsumerSecret,
		config.evernoteUsedSandbox
		);

//Setup ExpressJS
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.cookieParser()); 
	app.use(express.bodyParser());
	
	//Use static files
	app.use("/website", express.static(__dirname + '/website'));
	
	//Use session
	app.use(express.session(
		{ secret: "EverestJS" }
	));
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

//Allow X-Domain Ajax
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

//===================================================
//								 			ETC
//===================================================

// Welcom Page
app.get('/', function(req, res){
	
	if(!req.session.user) //Unauthenticate User
		return res.redirect('/website/login.html');
		
	return res.redirect('/website/index.html');
});

//===================================================
//								Authentications
//===================================================

app.all('/authentication', function(req, res){
	
	var evernote_callback = config.serverUrl + '/authentication/callback';
	
  evernote.oAuth(evernote_callback).getOAuthRequestToken( function(error, oauthToken, oauthTokenSecret, results){
		
		if (error) return res.send("Error getting OAuth request token : " + util.inspect(error), 500);

    req.session.oauthRequestToken = oauthToken;
    res.redirect( evernote.oAuthRedirectUrl(oauthToken) );      
  });

});

app.all('/authentication/callback', function(req, res){
	
	var evernote_callback = config.serverUrl +'/evernote/authentication/callback';
		
  evernote.oAuth(evernote_callback).getOAuthAccessToken( req.session.oauthRequestToken, 
		req.session.oauthRequestTokenSecret, 
		req.query.oauth_verifier, 
		function(err, authToken, accessTokenSecret, results) {

			if (err) return res.send("Error getting accessToken", 500);
			 
			evernote.getUser(authToken, function(err, edamUser) {
			
				if (err) return res.send("Error getting userInfo", 500);
				
				req.session.authToken = authToken;
				req.session.user = edamUser;
				
				res.redirect('/');
			});
  });
});

app.all('/logout', function(req, res){
	
	var callback = req.query.callback;
	req.session.authToken = null;
	req.session.user = null;
	
	return res.send({ success:true });
});

app.get('/me', function(req, res){
	
	if(!req.session.user)
		return res.send('Please, provide valid authToken',401);
	
	evernote.getUser(req.session.user.authToken,function(err, edamUser) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			
			req.session.user = edamUser;
			return res.send(edamUser,200);
    }
	});
});

//===================================================
//										Notes
//===================================================

app.get('/notes', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo 	= req.session.user;
	var offset 		= req.query.offset || 0;
	var count 		= req.query.count || 50;
	var words 		= req.query.words || '';
	var sortOrder = req.query.sortOrder || 'UPDATED';
	var ascending = req.query.ascending || false;
	
	evernote.findNotes(userInfo,  words, { offset:offset, count:count, sortOrder:sortOrder, ascending:ascending }, function(err, noteList) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			return res.send(noteList,200);
    }
  });
});

app.post('/notes', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);

	var note = req.body;
	var userInfo = req.session.user;
	
	evernote.createNote(userInfo, note, function(err, note) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(note,200);
  });
});

app.get('/notes/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var userInfo = req.session.user;
	var guid = req.params.guid;
 	var option = req.query;

	evernote.getNote(userInfo, guid, option, function(err, note) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(note,200);
  });
});

app.post('/notes/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var note = req.body;
	var userInfo = req.session.user;
	
	note.guid = req.params.guid;
	
	evernote.updateNote(userInfo, note, function(err, note) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(note,200);
  });
	
});

app.all('/notes/:guid/delete', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo = req.session.user;
	var guid = req.params.guid;
	
	evernote.deleteNote(userInfo, guid, function(err, updateSequence) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send({updateSequence: updateSequence},200);
  });
});


//===================================================
//										Tags
//===================================================

app.get('/tags', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	
	var userInfo = req.session.user;
	
	evernote.listTags(userInfo, function(err, tagList) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			return res.send(tagList,200);
    }
  });
});

app.post('/tags', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);

	var tag = req.body;
	var userInfo = req.session.user;
	
	evernote.createTag(userInfo, tag, function(err, tag) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(tag,200);
  });
});

app.get('/tags/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var userInfo = req.session.user;
	var guid = req.params.guid;

	evernote.getTag(userInfo, guid, function(err, tag) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(tag,200);
  });
});

app.post('/tags/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var tag = req.body;
	var userInfo = req.session.user;
	
	tag.guid = req.params.guid;
	
	evernote.updateTag(userInfo, tag, function(err, tag) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(tag,200);
  });
	
});

app.all('/tags/:guid/expunge', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo = req.session.user;
	var guid = req.params.guid;
	
	evernote.expungeTag(userInfo, guid, function(err, updateSequence) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send({updateSequence: updateSequence},200);
  });
});

//===================================================
//										Notebooks
//===================================================

app.get('/notebooks', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	
	var userInfo = req.session.user;
	
	evernote.listNotebooks(userInfo, function(err, tagList) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			return res.send(tagList,200);
    }
  });
});

app.post('/notebooks', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);

	var notebook = req.body;
	var userInfo = req.session.user;
	
	evernote.createNotebook(userInfo, notebook, function(err, tag) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(tag,200);
  });
});

app.get('/notebooks/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var userInfo = req.session.user;
	var guid = req.params.guid;

	evernote.getNotebook(userInfo, guid, function(err, notebook) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(notebook,200);
  });
});

app.post('/notebooks/:guid', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);
	if(!req.body) return res.send('Invalid content',400);
	
	var notebook = req.body;
	var userInfo = req.session.user;
	
	tag.guid = req.params.guid;
	
	evernote.updateNotebook(userInfo, notebook, function(err, updateSequence) {
		
		if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send(updateSequence,200);
  });
	
});

app.all('/notebooks/:guid/expunge', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo = req.session.user;
	var guid = req.params.guid;
	
	evernote.expungeNotebook(userInfo, guid, function(err, updateSequence) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } 

		return res.send({updateSequence: updateSequence},200);
  });
});

//===================================================
//									  Sync
//===================================================

app.get('/sync-state', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo 	= req.session.user;
	
	evernote.getSyncState(userInfo, function(err, syncState) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			return res.send(syncState,200);
    }
  });
});

app.get('/sync-chunk', function(req, res){
	
	if(!req.session.user) return res.send('Unauthenticate',401);

	var userInfo 	= req.session.user;
	var afterUSN 		= req.query.afterUSN || 0;
	var maxEntries 	= req.query.maxEntries || 500;
	var fullSyncOnly = req.query.fullSyncOnly || false;
	
	evernote.getSyncChunk(userInfo,  afterUSN, maxEntries, fullSyncOnly, function(err, syncChank) {
    if (err) {
			if(err == 'EDAMUserException') return res.send(err,403);
      return res.send(err,500);
    } else {
			return res.send(syncChank,200);
    }
  });
});

app.listen(config.serverPort);
