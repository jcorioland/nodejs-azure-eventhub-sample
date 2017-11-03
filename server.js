var http = require('http');
var https = require('https');
var eventhub = require('./eventhub');

var requestCount = 0;
var successCount = 0;
var errorCount = 0;

const eventHubHost = process.env.EVENT_HUB_HOST;
const eventHubName = process.env.EVENT_HUB_NAME;
const eventHubAccessKeyName = process.env.EVENT_HUB_ACCESS_KEY_NAME;
const eventHubAccessKeyValue = process.env.EVENT_HUB_ACCESS_KEY_VALUE;

if(!eventHubName || !eventHubHost || !eventHubAccessKeyName || !eventHubAccessKeyValue) {
    throw "The following env variables should be defined: EVENT_HUB_HOST, EVENT_HUB_NAME, EVENT_HUB_ACCESS_KEY_NAME, EVENT_HUB_ACCESS_KEY_VALUE.";
}

const requestPath = "/" + eventHubName + "/messages";
const authorization = eventhub.createSharedAccessToken(eventHubHost, eventHubAccessKeyName, eventHubAccessKeyValue);
var lastStatusMessage = "";

var server = http.createServer(function(request, response) {

    var content = JSON.stringify({ timestamp: Date.now().timestamp, "message": "Hello Event Hub" }); 
    var contentLenght = content.length;
    
    var postOptions = {
        host: eventHubHost,
        path: requestPath,
        port: 443,
        method: "POST",
        headers: {
            'Content-Length': contentLenght,
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': authorization,
            'Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Connection': 'Keep-Alive'
        }
    };

    var postToEventHub = https.request(postOptions, function(eventHubResponse) {
        if(eventHubResponse.statusCode === 201){
            successCount += 1;
        }
        else {
            errorCount += 1;
        }

        lastStatusMessage = eventHubResponse.statusMessage;
    });

    postToEventHub.on('error', function(e) {
        errorCount += 1;
        lastStatusMessage = JSON.stringify(e);
    });

    postToEventHub.write(content);
    postToEventHub.end();
    requestCount += 1;
    
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Requests sent to event hub: " + requestCount + ", Success count: " + successCount + ", Errors count: " + errorCount + ", Status: " + lastStatusMessage);
});

var port = process.env.PORT || 8080;
server.listen(port);

console.log("Server running at http://localhost:%d", port);