const url = require('url');
const fs = require('fs');
const path = require('path');
const path_to_files = './front/';
const default_file = 'index.html';
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    'default': 'application/octet-stream'
};

function isValidUrl(url) {
    let pattern = new RegExp(/\.\./);
    return !pattern.test(url);
}

function manageRequest(request, response) { 
    response.statusCode = 200;
    let fichier = url.parse(request.url).pathname;

    if (!isValidUrl(fichier)) {
        response.statusCode = 403;
        response.end('Forbidden');
        return;
    }

    if (fichier == '/') {
        fichier = default_file;
    }
    fs.exists(path_to_files + fichier, function(boolean) {
        if (!boolean) {
            fs.readFile(path_to_files + '404.html', function(err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.end(`Error reading file ${fichier}`);
                }
                else {
                    let extension = path.parse('404.html').ext;
                    let mimeType = mimeTypes[extension];
                    response.setHeader('Content-Type', mimeType);
                    response.end(data);
                }
                });
        }
        else {
            fs.readFile(path_to_files + fichier, function(err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.end(`Error reading file ${fichier}`);
                }
                else {
                    let extension = path.parse(fichier).ext;
                    let mimeType = mimeTypes[extension];
                    response.setHeader('Content-Type', mimeType);
                    response.end(data);
                }
            });
        }
    });
}

exports.manage = manageRequest;