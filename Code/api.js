// CAZAUBON Lorenz G1


const fs = require('fs');
const url = require('url');
const path_ = require('path');
const path_to_files = './front/';
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

let liste_mots = [];
let liste_temp = [];
const MAX_LENGTH = 25;
const NOMBRE_ERREUR_MAX = 9;

// Ajouter les mots des miserables dans la liste
fs.readFile('lesmiserables.txt', function(err, data) {  
    if (err) {
        console.log(err);
    }
    else {
        var lesmiserables = data.toString().split(/[(\r?\n),. !\?]/);
        for (n=0; n<=MAX_LENGTH; n++) {liste_mots.push([]);}
        for (i=0; i<lesmiserables.length; i++) {
            for (j=0; j<lesmiserables[i].length; j++) {
                if (lesmiserables[i].charCodeAt(j) < 97 || lesmiserables[i].charCodeAt(j) > 122) {
                    break;
                }
                if (j == lesmiserables[i].length-1 && !liste_mots[lesmiserables[i].length].includes(lesmiserables[i])) {
                    liste_mots[lesmiserables[i].length].push(lesmiserables[i]);
                }
            }
        }
    }
});

//Plusieurs utilisateurs:
let gamesDict = {};
let id = 0;

// Class jeu Pendu
class Game {
    constructor(level) {
        id++;
        this.level = level;
        this.id = id;
        this.word = getWord(level);
        this.currentWord = [];
        for (i=0; i<this.word.length; i++) {
            this.currentWord.push("_");
        }
        this.errors = 0;
        this.letters = [];
        this.status = "ongoing";
    }

    testLetter(letter) {
        //Si la letter a déjà été testée pas besoin de l'ajouter à la liste
        if (!this.letters.includes(letter)) {
            this.letters.push(letter);
        }
        //On remplace les _ par la letter si elle est dans le mot
        for (i=0; i<this.word.length; i++) {
            if (this.word[i] == letter) {
                this.currentWord[i] = letter;
            }
        }
        this.status = "ongoing";
        //Si la letter n'est pas dans le mot on incrémente le nombre d'erreurs
        if (!this.word.includes(letter)) {
            this.errors++;
            this.status = "madeAnError";
        }
        //Si le nombre d'erreurs est supérieur au nombre d'erreurs max on perd
        if (this.errors > NOMBRE_ERREUR_MAX) {
            this.currentWord = this.word.split("");
            this.status = "lost";
        }
        //Si le mot est trouvé on gagne
        else if (!this.currentWord.includes("_")) {
            this.currentWord = this.word.split("");
            this.status = "won";
        }
        return this.currentWord;
    }

    //Info à envoyer au client
    sendInfo() {
        let output = {id: this.id, currentWord: this.currentWord.join(" "), errors: this.errors, letters: this.letters, status: this.status};
        return JSON.stringify(output);
    }
    

}

function getWord(level) {
    if (level == 'easy') {
        min = 4;
        max = 5;
    }
    else if (level == 'medium') {
        min = 6;
        max = 8;
    }
    else if (level == 'hard') {
        min = 9;
        max = 13;
    }
    liste_temp = [];
    // On ajoute les mots de longueur min <= n <= max dans une liste temporaire
    for (nombre=min; nombre<=max; nombre++) {
        liste_temp.push.apply(liste_temp, liste_mots[nombre])
    }
    let index = Math.floor(Math.random() * liste_temp.length);
    // On choisit un mot au hasard dans la liste temporaire
    return liste_temp[index].toUpperCase();
}

function manageRequest(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');

    let fichier = url.parse(request.url);
    let path = fichier.pathname.split('?');
    let service = path[0].split('/')[2];
    let query = fichier.query;
    //console.log(query);

    if (service == 'newGame') {
        let level;
        if (query == null || query == '') {
            level = 'medium';
        }
        else {
            try {
                value = query.split('&')[0].split('=')[1];
                if (value == 'easy' || value == 'medium' || value == 'hard') {
                    level = value;
                }
                else {
                    level = 'medium';
                }
            }
            catch (error) {
                level = 'medium';
            }
        }
        // On créee un nouveau jeu et on l'ajoute au dictionnaire
        let game = new Game(level);
        gamesDict[game.id] = game;
        response.end(game.sendInfo());
    }

    else if (service == 'testLetter') {

        if (query == null || query == '') {
            response.statusCode = 400;
            response.end('Bad request');
        }
        else {
            // On récupère l'id et la lettre
            let id = query.split('&')[0].split('=')[1]
            let letter = query.split('&')[1].split('=')[1]
            if (letter.length>1 || letter.length==0 || letter.charCodeAt()<65 || letter.charCodeAt()>90) {
                response.statusCode = 400;
                response.end('Bad request');
            }
            else {
                // On teste la lettre et on renvoie les infos
                gamesDict[id].testLetter(letter);
                response.end(gamesDict[id].sendInfo());
            }
        }
    }

    else {
        // Si le service n'exites pas on renvoie une erreur 404
        response.statusCode = 404;
        fs.readFile(path_to_files + '404.html', function(err, data) {
            if (err) {
                response.statusCode = 500;
                response.end(`Error reading file ${fichier}`);
            }
            else {
                let extension = path_.parse('404.html').ext;
                let mimeType = mimeTypes[extension];
                response.setHeader('Content-Type', mimeType);
                response.end(data);
            }
            });
    }
}

exports.manage = manageRequest;