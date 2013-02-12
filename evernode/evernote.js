var CustomConnections = require('./lib/evernode/CustomConnections');
var UserStore 				= require('./lib/evernote-thrift/gen-nodejs/UserStore');
var NoteStore 				= require('./lib/evernote-thrift/gen-nodejs/NoteStore');
var NoteStoreTypes 		= require('./lib/evernote-thrift/gen-nodejs/NoteStore_types');
var Types 						= require('./lib/evernote-thrift/gen-nodejs/Types_types');

var oauth 						= require('oauth');
var thrift						= require('thrift');

exports.NoteStoreTypes = NoteStoreTypes;
exports.Types 	 = Types;
exports.Evernote = Evernote;

/**
 * Evernote
 * @param  {String} consumer_key - Evernote's API ConsumerKey
 * @param  {String} consumer_secret - Evernote's API ConsumerSecret
 * @param  {Bool} 	sandbox - using sandbox
 * @constructor
 */
function Evernote(consumer_key, consumer_secret, sandbox){
		
	if(!consumer_key || !consumer_secret) throw 'Argument Execption';
	var server = sandbox? 'sandbox.evernote.com' : 'www.evernote.com'; 
	
	this.createNoteStore = function (shardId) {
	    var noteConnection = CustomConnections.createHTTPSConnection(server, 443, '/edam/note/' + shardId);
	    return CustomConnections.createClient(NoteStore, noteConnection);
	}
	
	this.createUserStore = function () {
	    var userConnection = CustomConnections.createHTTPSConnection(server, 443, '/edam/user');
			return CustomConnections.createClient(UserStore, userConnection);
	}
	
	this.oAuth = function(callback_url){
	  return new oauth.OAuth(
	    sandbox?"https://sandbox.evernote.com/oauth":"https://www.evernote.com/oauth", 
			sandbox?"https://sandbox.evernote.com/oauth":"https://www.evernote.com/oauth",
	    consumer_key, 
			consumer_secret, 
			"1.0", 
			callback_url, 
			"PLAINTEXT");   
	}
	
	this.oAuthRedirectUrl = function (oauthRequestToken) {
		if(sandbox)
			return "https://sandbox.evernote.com/OAuth.action?oauth_token="+oauthRequestToken;
		else
			return "https://www.evernote.com/OAuth.action?oauth_token="+oauthRequestToken;
	}	
}

/**
 * getUser
 * @param  { String } authToken
 * @param  { function (err, EDAMUser) } callback
 */
Evernote.prototype.getUser = function (authToken, callback){

	this.createUserStore().getUser(authToken, function(err, response) {
		
		if(response) response.authToken = authToken;
		callback(err, response);
	});
}

/**
 * findNotes
 * @param  { EdamUser } user
 * @param  { String }		words
 * @param  { Option (optional) } option
		- offset
		- count
		- sortOrder
		- ascending
		- inactive
 * @param  { function (err, EDAMNoteList ) } callback
 */
Evernote.prototype.findNotes = function(user, words, option, callback)
{
	if(arguments.length < 4){
		callback = option;
		option = {};
	}
	
	if(!user || !user.shardId || !user.authToken) throw 'Argument Execption';
	callback = callback || function (){}
	
	var noteStore = this.createNoteStore(user.shardId);
	var noteFilter = new NoteStoreTypes.NoteFilter();
	
	noteFilter.words = words || '';
	noteFilter.order = Types.NoteSortOrder[(option.sortOrder || 'UPDATED')];
	noteFilter.ascending = option.ascending || false;
	noteFilter.inactive = option.inactive || false;
	
	var offset = option.offset || 0;
	var count = option.count || 50;
	
	noteStore.findNotes(user.authToken, noteFilter, offset, count, function(err, response) {
    callback(err, response)
  });
}

/**
 * getNote
 * @param  { EdamUser } user
 * @param  { String }		guid
 * @param  { Option (optional) } option 
 * 		- withContent
 * 		- withResourcesData
 * 		- withResourcesRecognition
 * 		- withResourcesAlternateData
 * @param  { function (err, ED) } callback
 */
Evernote.prototype.getNote = function(userInfo, guid, option, callback)
{
	if(arguments.length < 4){
		callback = option;
		option = {};
	}
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(!guid) throw 'ArgumentExecption';

	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	var withContent = option.withContent || true;
	var withResourcesData = option.withResourcesData || false;
	var withResourcesRecognition = option.withResourcesRecognition || false;
	var withResourcesAlternateData = option.withResourcesAlternateData || false;
	
	noteStore.getNote(userInfo.authToken, guid, withContent, withResourcesData, withResourcesRecognition, withResourcesAlternateData, 
		function(err, response) {
    	callback(err, response);
  	});
}

/**
 * createNote
 * @param  { EdamUser } user
 * @param  { EdamNote }	note
 * @param  { function (err, EDAMUser) } callback
 */
Evernote.prototype.createNote = function(userInfo, note, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof note 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	if(note.attributes){
		
		if(typeof note.attributes != 'object') throw 'Argument Execption';
		note.attributes = new Types.NoteAttributes(note.attributes);
	}
	
	note = new Types.Note(note);
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.createNote(userInfo.authToken, note, function(err, response) {
    callback(err, response)
  });
}

/**
 * updateNote
 * @param  { EdamUser } user
 * @param  { EdamNote }	note
 * @param  { function (err, EDAMUser) } callback
 */
Evernote.prototype.updateNote = function(userInfo, note, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof note 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	if(note.attributes){
		
		if(typeof note.attributes != 'object') throw 'Argument Execption';
		note.attributes = new Types.NoteAttributes(note.attributes);
	}
	
	note = new Types.Note(note);
	
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.updateNote(userInfo.authToken, note, function(err, response) {
    callback(err, response)
  });
}

/**
 * deleteNote
 * @param  { EdamUser } user
 * @param  { String }	guid
 * @param  { function (err, updateSequence) } authToken
 */
Evernote.prototype.deleteNote = function(userInfo, guid, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.deleteNote(userInfo.authToken, guid, function(err, response) {
    callback(err, response)
  });
}

/**
 * getNoteSearchText
 * @param  { EdamUser } user
 * @param  { String }		guid
 * @param  { Option (optional) } option 
 * 		- noteOnly,
 * 		- tokenizeForIndexing
 * @param  { function (err, EDAMUser) } callback
 */
Evernote.prototype.getNoteSearchText = function(userInfo, guid, option, callback)
{
	if(arguments.length < 4){
		callback = option;
		option = {};
	}
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(!guid) throw 'ArgumentExecption';

	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	var noteOnly = option.noteOnly || false;
	var tokenizeForIndexing = option.tokenizeForIndexing || false;

	noteStore.getNoteSearchText(userInfo.authToken, guid, noteOnly, tokenizeForIndexing,
		function(err, response) {
    	callback(err, response);
  	});
}


//=====================================================================================================


/**
 * listTags
 * @param  { EDAMUser } user
 * @param  { function (err, Array<EDAMTag> ) } callback
 */
Evernote.prototype.listTags = function(user, callback)
{	
	if(!user || !user.shardId || !user.authToken) throw 'Argument Execption';
	callback = callback || function (){}
	
	var noteStore = this.createNoteStore(user.shardId);
	
	noteStore.listTags(user.authToken, function(err, response) {
    callback(err, response)
  });
}

/**
 * getTag
 * @param  { EDAMUser } user
 * @param  { String }		guid
 * @param  { function (err, EDAMUser) } callback
 */
Evernote.prototype.getTag = function(userInfo, guid, callback)
{
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(!guid) throw 'ArgumentExecption';

	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);

	noteStore.getTag(userInfo.authToken, guid, function(err, response) {
    callback(err, response);
  });
}

/**
 * createTag
 * @param  { EDAMUser } user
 * @param  { EDAMTag }	tag
 * @param  { function (err, EDAMTag) } callback
 */
Evernote.prototype.createTag = function(userInfo, tag, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof tag 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	tag = new Types.Tag(tag);
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.createTag(userInfo.authToken, tag, function(err, response) {
    callback(err, response)
  });
}

/**
 * updateNote
 * @param  { EDAMUser } user
 * @param  { EDAMTag }	tag
 * @param  { function (err, number) } callback
 */
Evernote.prototype.updateTag = function(userInfo, tag, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof tag 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	tag = new Types.Tag(tag);
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.updateTag(userInfo.authToken, tag, function(err, response) {
    callback(err, response)
  });
}

/**
 * expungeTag
 * @param  { EdamUser } user
 * @param  { String }	guid
 * @param  { function (err, updateSequence) } authToken
 */
Evernote.prototype.expungeTag = function(userInfo, guid, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.expungeTag(userInfo.authToken, guid, function(err, response) {
    callback(err, response)
  });
}

//=====================================================================================================


/**
 * listNotebooks
 * @param  { EDAMUser } user
 * @param  { function (err, Array<EDAMNotebook> ) } callback
 */
Evernote.prototype.listNotebooks = function(user, callback)
{	
	if(!user || !user.shardId || !user.authToken) throw 'Argument Execption';
	callback = callback || function (){}
	
	var noteStore = this.createNoteStore(user.shardId);
	
	noteStore.listNotebooks(user.authToken, function(err, response) {
    callback(err, response)
  });
}

/**
 * getNotebook
 * @param  { EDAMUser } user
 * @param  { String }		guid
 * @param  { function (err, EDAMNotebook) } callback
 */
Evernote.prototype.getNotebook = function(userInfo, guid, callback)
{
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(!guid) throw 'ArgumentExecption';

	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);

	noteStore.getNotebook(userInfo.authToken, guid, function(err, response) {
    callback(err, response);
  });
}

/**
 * createNotebook
 * @param  { EDAMUser } user
 * @param  { EDAMNotebook }	notebook
 * @param  { function (err, EDAMNotebook) } callback
 */
Evernote.prototype.createNotebook = function(userInfo, notebook, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof notebook 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	notebook = new Types.Notebook(notebook);
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.createNotebook(userInfo.authToken, notebook, function(err, response) {
    callback(err, response)
  });
}

/**
 * updateNotebook
 * @param  { EDAMUser } user
 * @param  { EDAMNotebook }	notebook
 * @param  { function (err, number) } callback
 */
Evernote.prototype.updateNotebook = function(userInfo, notebook, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof tag 		 != 'object') throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	notebook = new Types.Notebook(notebook);
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.updateNotebook(userInfo.authToken, notebook, function(err, response) {
    callback(err, response)
  });
}

/**
 * expungeNotebook
 * @param  { EdamUser } user
 * @param  { String }	guid
 * @param  { function (err, updateSequence) } authToken
 */
Evernote.prototype.expungeNotebook = function(userInfo, guid, callback){
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'Argument Execption';
	if(typeof callback != 'function') throw 'Argument Execption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);
	
	noteStore.expungeNotebook(userInfo.authToken, guid, function(err, response) {
    callback(err, response)
  });
}


//=====================================================================================================


/**
 * getFilteredSyncChunk
 * @param  { EdamUser } user
 * @param  { Integer }	afterUSN
 * @param  { Integer }	maxEntries
 * @param  { Bool }			fullSyncOnly
 * @param  { function (err, EDAMUser) } authToken
 */
Evernote.prototype.getSyncState = function(userInfo, callback)
{
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);

	noteStore.getSyncState(userInfo.authToken,
		function(err, response) {
    	callback(err, response);
  });
}

/**
 * getFilteredSyncChunk
 * @param  { EdamUser } user
 * @param  { Integer }	afterUSN
 * @param  { Integer }	maxEntries
 * @param  { Bool }			fullSyncOnly
 * @param  { function (err, EDAMUser) } authToken
 */
Evernote.prototype.getSyncChunk = function(userInfo, afterUSN, maxEntries, fullSyncOnly, callback)
{
	if(arguments.length < 4){
		callback = option;
		option = {};
	}
	
	if(!userInfo || !userInfo.shardId || !userInfo.authToken) throw 'ArgumentExecption';
	if(typeof callback != 'function') throw 'ArgumentExecption';
	
	var noteStore = this.createNoteStore(userInfo.shardId);

	noteStore.getSyncChunk(userInfo.authToken, afterUSN, maxEntries, fullSyncOnly,
		function(err, response) {
    	callback(err, response);
  	});
}






