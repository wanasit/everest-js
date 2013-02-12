/*
   CustomConnections
   This is based on the connection implementation in the node-thrift library for HTTPS.
*/

var sys = require('sys'),
    EventEmitter = require("events").EventEmitter,
    ttransport = require('thrift/lib/thrift/transport'),
    https = require('https'),
    tprotocol = require('thrift/lib/thrift/protocol');

var HTTPSConnection = exports.HTTPSConnection = function(host, port, url, options) {

  var self = this;
  EventEmitter.call(this);

  this.host = host;
  this.port = port;
  this.url = url;
  this.client = undefined;

  this.waitingQueueMessages = []; //Array of outbound calls to go
  this.options = this.options || {};
  this.transport = this.options.transport || ttransport.TBufferedTransport;
  this.protocol = this.options.protocol || tprotocol.TBinaryProtocol;
  this.transmitting = false;

  this.addListener("error", function(err) {
    self.emit("error", err);
  });

  // Add a close listener
  this.addListener("close", function() {
    self.emit("close");
  });

  this.addListener("timeout", function() {
    self.emit("timeout");
  });

  this.addListener("dataFromHttps", self.transport.receiver(function(transport_with_data) {
    var message = new self.protocol(transport_with_data);
    try {
      var header = message.readMessageBegin();
      var dummy_seqid = header.rseqid * -1;
      var client = self.client;
      client._reqs[dummy_seqid] = function(err, success){
        transport_with_data.commitPosition();

        var callback = client._reqs[header.rseqid];
        delete client._reqs[header.rseqid];

        if (callback) {
          callback(err, success);
        }
      };
      client['recv_' + header.fname](message, header.mtype, dummy_seqid);
    }
    catch (e) {
      if (e instanceof ttransport.InputBufferUnderrunError) {
        transport_with_data.rollbackPosition();
      }
      else {
        throw e;
      }
    }
  }));

};

sys.inherits(HTTPSConnection, EventEmitter);

HTTPSConnection.prototype.end = function() {
    //Nothing right now.
};

HTTPSConnection.prototype.flushOutData = function(data) {
    this.transmitting = true;

    var dataLength = data ? data.length : 0;

    var headers = {
        'Host': this.host,
        'Accept': 'application/x-thrift',
        'User-Agent': 'NodeJS/THttpClient',
        'Content-Type': 'application/x-thrift',
        'Content-Length': dataLength
    };

    var options = {
      host: this.host,
      port: 443,
      path: this.url,
      method: 'POST',
      headers: headers
    };

    var req = https.request(options, HTTPSConnection.responseCallBack(this));
    req.write(data);
    req.end();

    req.on('error', function(e) {
      console.log("Error called");
      console.error(e);
    });
};

HTTPSConnection.responseCallBack = function(thisPtr) {
    return (function(res) {
      //console.log("statusCode: ", res.statusCode);
      //console.log("headers: ", res.headers);

      res.on('data', function(d) {
        thisPtr.emit("dataFromHttps", d);
      });

      res.on('end', function() {
        // do what you do
        thisPtr.transmitting = false;
        if(thisPtr.waitingQueueMessages.length > 0) {
            var newData = thisPtr.waitingQueueMessages.pop();
            thisPtr.flushOutData(newData);
        }
      });
    });
};

HTTPSConnection.prototype.write = function(data) {
  if (this.transmitting) {
    this.waitingQueueMessages.push(data);
    return;
  }
  this.flushOutData(data);
};

exports.createHTTPSConnection = function(host, port, url) {
  var connection = new HTTPSConnection(host, port, url);
  return connection;
};

exports.createClient = function(cls, connection) {
  if (cls.Client) {
    cls = cls.Client;
  }
  
  var transport = new connection.transport(undefined, function(buf) {
    connection.write(buf);
  });
  transport.writeBufferSize = 26214400;
  var client = new cls(transport, connection.protocol);

  connection.client = client;

  return client;
};
