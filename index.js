/* primary file for the api
Richard Griffiths - Node Newbie - WeArePirple  Masterclass 2018
*/
//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpServer = http.createServer(function(req,res){
   unifiedServer(req,res)
});

httpServer.listen(config.httpPort, function(){
    console.log("The server is listening on port " +config.httpPort);
});
//Instantiates Https Server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res)
 });

httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listening on port " +config.httpsPort);
});


//Server logic liveth here
var unifiedServer = function(req,res){
    //get the url and parse it
    var parsedUrl =  url.parse(req.url, true); //
    //get the path from the url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'')

    //get the query string as an object
    var queryStringObject = parsedUrl.query;

    //get the http method
    var method = req.method.toLowerCase();

    //get the headers as an object
    var headers = req.headers;

    //get the payload...iz pricey
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
        });

    req.on('end', function(){
        buffer += decoder.end();
        //choose the handler this request should go to - use not found if not found
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        //construct the data object to send to the handler
             // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
            };
        
        // Router the request to the handlder specified in the router
        chosenHandler(data, function(statusCode, payload){
            //use the statuscode called back by the handler or default
            statuscode = typeof(statusCode) == 'number' ? statusCode : 200;
            //use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};
            //Convert the payload to a string
            var payloadString = JSON.stringify(payload);
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString);
        });
    })
}

var handlers = {};
//Ping handler
handlers.ping = function(data, callback){
    callback(200);
} ;
//Not found handlers
handlers.notFound = function(data,callback){
    callback(404);
};
//Hello Handler - just needs an actual JSON jobject
handlers.hello = function(data, callback){
     callback(200, {'message' : 'Success, welcome to your alpha test homework project'});
};
//defining a request router
var router = {
    'ping' : handlers.ping,
    'hello' : handlers.hello    
};