const http = require('http');
const api = require('./api.js');
const files = require('./files.js');
http.createServer(function(request, response) {
    a = request.url.split('/');
    if (a[1] == 'api') {
        api.manage(request, response);
    }
    else {
        files.manage(request, response);
    }                   
    
}).listen(8000);