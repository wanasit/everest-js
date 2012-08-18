# Everest JS

Ready to run Node JS version of [Evernote API](http://dev.evernote.com/documentation/reference/). Everest is an example of how to create Evernote RESTful Web Services from many Node.js components. I put it all to gather to make it easier for the beginner.

## To do
1. Edit file config.js (use your Evernote API key) 
2. Run server.js (node everest.js)
3. Open yours browser to http://localhost:8081/

## Using Components
- express (http://expressjs.com/)
- oauth (http://github.com/ciaranj/node-oauth)
- node-thrift (https://github.com/wadey/node-thrift) : Branch performace + A few lines fix
- evernode (https://github.com/cloudsnap/evernode)	 : Using forked version https://github.com/berryboy/evernode

## Credit

This was released by the [Evercalendar](http://evercalendar.co) team in Evernote DevCup 2012. 

Please, vist our website and give us some feedback. If you like our app, don't forget to [vote](http://devcup.evernote.com/submissions/8463-evercalendar) for us (apologies for the shameless self promotion).

##REST API

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
