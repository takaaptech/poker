var pomelo = require('pomelo');
var crc = require('crc'); 
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'pokerServ');

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });
});

var hallRouter = function(session, msg, app, cb) {  
    var hallServers = app.getServersByType('hall');  
  
    if(!hallServers || hallServers.length === 0) {  
        cb(new Error('can not find hall servers.'));  
        return;  
    }  
  
    console.log('session uid ' + session.uid);  
    var index = Math.abs(crc.crc32(session.uid)) % hallServers.length;  
    var res = hallServers[index];  
  
    cb(null, res.id);  
};  

app.configure('production|development', function() {  
    app.route('hall', hallRouter);  
});  

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
