// CAZAUBON Lorenz G1

// Lettres testées
let letters = [];

// Mot qui s'affiche
let currentWord = "";

let id;

//morceaux du pendu
let parts = document.getElementsByClassName('part');

let btn_new_game = document.getElementById("btn_new_game");
btn_new_game.addEventListener("click", start);

let btn_valider = document.getElementById("btn_valider");
btn_valider.addEventListener("click", valider);

let btn_hard_mode = document.getElementById("btn_hard_mode");
btn_hard_mode.addEventListener("click", difficulty_hard);

let btn_normal_mode = document.getElementById("btn_medium_mode");
btn_normal_mode.addEventListener("click", difficulty_normal);

let btn_easy_mode = document.getElementById("btn_easy_mode");
btn_easy_mode.addEventListener("click", difficulty_easy);

let input1 = document.getElementById("input1");
input1.addEventListener("keyup", function(event) {
    if (event.key == 'Enter') {
        btn_valider.click();
    }
});

async function getWordFromServer() {
    const url = "http://localhost:8000/api/getWord";
    try {
        const response = await fetch(url);
        if (!response.ok) {
          return getWordFromServer();
        }
        const word = (await response.text()).toUpperCase();
        return word;
      } 
      catch (error) {
        return getWordFromServer();
      }
}

function start() {

    btn_new_game.classList.add("notDisplayed");
    let difficulty_button = document.getElementsByClassName("difficulty_button");
    while (difficulty_button.length > 0) {
        difficulty_button[0].classList.remove("difficulty_button");
    }
    document.getElementById("lettres_trouvees_p").classList.add("notDisplayed");
    let colorGreen = document.getElementsByClassName("colorGreen");
    while (colorGreen.length > 0) {
        colorGreen[0].classList.remove("colorGreen");
    }
    let colorRed = document.getElementsByClassName("colorRed");
    while (colorRed.length > 0) {
        colorRed[0].classList.remove("colorRed");
    }
}

function difficulty_hard() {
    newGame("hard");
}

function difficulty_normal() {
    newGame("medium");
}

function difficulty_easy() {
    newGame("easy");
}

// Créer une nouvelle partie
async function newGame(value) {

    //local
    let notDisplayed = document.getElementsByClassName("notDisplayed");
    while (notDisplayed.length > 0) {
        notDisplayed[0].classList.remove("notDisplayed");
    }
    btn_hard_mode.classList.add("difficulty_button");
    btn_easy_mode.classList.add("difficulty_button");
    btn_normal_mode.classList.add("difficulty_button");
    currentWord = "Recherche du mot en cours...";
    document.getElementById("lettres_trouvees_p").innerText = currentWord;
    input1.value = "";
    input1.focus();

    //serveur
    const url = "http://localhost:8000/api/newGame?level=" + value;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return newGame();
        }
        const result = (await response.json());
        currentWord = result.currentWord;
        letters = result.letters;
        id = result.id;
        document.getElementById("lettres_trouvees_p").innerText = currentWord;;
        dessinerErreurPendu(result.errors);
    }
    catch (error) {
        return newGame();
    }
}

// Le jeu est terminé
function endGame(result) {

    if (result.status == "lost") {
        document.getElementById("lettres_trouvees_p").innerText = "Perdu !\nLe mot était : " +  currentWord.split(" ").join("");
    }
    else {
        document.getElementById("lettres_trouvees_p").innerText = "Gagné !\nLe mot était : " +  currentWord.split(" ").join("");
    }
    for (i = 0; i < parts.length; i++) {
        parts[i].style.display = 'none';
    }
    btn_valider.classList.add("notDisplayed");
    input1.classList.add("notDisplayed");
    document.getElementById("letters").classList.add("notDisplayed");
    btn_new_game.classList.remove("notDisplayed");
}

// Tester une lettre
async function testLetter(letter) {

    const url = "http://localhost:8000/api/testLetter?id="+id+"&"+"letter=" + letter;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return testLetter(letter);
        }
        const result = (await response.json());
        //console.log(result);
        currentWord = result.currentWord;
        letters = result.letters;
        if (result.status == "lost" || result.status == "won") {
            endGame(result);
        }
        else if (result.status == "madeAnError") {
            document.getElementById(letter).classList.add("colorRed");
            dessinerErreurPendu(result.errors);
        }
        else {
            document.getElementById(letter).classList.add("colorGreen");
        }
        document.getElementById("lettres_trouvees_p").innerText = currentWord;
    }
    
    catch (error) {
        return console.log(error);
    }
}


function valider() {

    if  (currentWord == "Recherche du mot en cours...") {
        alert("En attente de la réponse du serveur pour obtenir un nouveau mot")
        return;
    }

    let letter = input1.value.toUpperCase();
    input1.value = "";
    input1.focus();
    if (letter.length>1 || letter.length==0 || letter.charCodeAt()<65 || letter.charCodeAt()>90) {return;}
    testLetter(letter);
}

function dessinerErreurPendu(nb_erreur) {
    if (nb_erreur < parts.length) {
        parts[nb_erreur].style.display = 'block';
    }
}




