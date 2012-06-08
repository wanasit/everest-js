# Everest JS

Ready to run Node JS version of Evernote API.

Everest is an example of how to creating Evernote RESTful Web Services from many related components. I put it all togather to make it easier for your.

## To do
1. Edit file config.js (use your Evernote API key) 
2. Run server.js ('node server.js')
3. Open yours browser to http://localhost:8080/

## Using Components
- express (http://expressjs.com/)
- oauth (http://github.com/ciaranj/node-oauth)
- node-thrift (https://github.com/wadey/node-thrift) : Branch performace + A few lines fix
- evernode (https://github.com/cloudsnap/evernode) : Using fork https://github.com/berryboy/evernode

##REST API

GET		/me

GET		/notes
GET		/notes/<guid>	
POST	/notes/<guid>	
POST	/notes/<guid>/delete
