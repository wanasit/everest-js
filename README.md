# Everest JS

Everest is a <b>ready to run</b> web application using [Evernote API](http://dev.evernote.com/documentation/reference/). This application is an example of how to create [Node.js](http://nodejs.org) application that connect to Evernote. I puts several modules (Thrift, OAuth, and etc) all together to make it really easy for beginners.

## How to run the application
1. Edit file config.js (use your Evernote API key) 
2. Run everest.js (node everest.js)
3. Open yours browser to http://localhost:8081/

## Others Examples
There are several other examples in /examples directory. You can run these examples using [Evernote's developer tokens](http://dev.evernote.com/start/core/authentication.php#devtoken).

## Using Components
- express (http://expressjs.com/)
- oauth (http://github.com/ciaranj/node-oauth)
- node-thrift (https://github.com/wadey/node-thrift) : Branch performace + A few lines fix
- evernode (https://github.com/cloudsnap/evernode)	 : Using forked version https://github.com/berryboy/evernode

## REST API

- GET   /me                       - User Infomation

- GET   /notes                    - NoteStore.findNotes
- POST  /notes                    - NoteStore.createNote
- GET   /notes/<guid>	            - NoteStore.getNote
- POST  /notes/<guid>	            - NoteStore.updateNote
- POST  /notes/<guid>/delete      - NoteStore.deleteNote

- GET   /tags                     - NoteStore.listTags
- POST  /tags                     - NoteStore.createTag
- GET   /tags/<guid>	            - NoteStore.getTag
- POST  /tags/<guid>	            - NoteStore.updateTag
- POST  /tags/<guid>/expunge      - NoteStore.expungeTag
  
- GET   /notebooks                  - NoteStore.listNotebooks
- POST  /notebooks                  - NoteStore.createNotebook
- GET   /notebooks/<guid>	          - NoteStore.getNotebook
- POST  /notebooks/<guid>	          - NoteStore.updateNotebook
- POST  /notebooks/<guid>/expunge   - NoteStore.expungeNotebook
