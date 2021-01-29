/* eslint-disable max-classes-per-file */
// @ts-check

/* 
   La configuration du jeu est faite dans ces premières constantes

   - Le nombre de fruits correspondant à l'image
   - Le nombre de fruits avec lequel on va jouer
   - la classe des cartes lorsqu'elle est retournée
   - la durée du jeu
*/

const availableFruits = Number(18); // Nombre d'images de fruits disponibles dans le .png avec un pas de 100px
const numberOfFruitsInGame = Number(2); // nombre de fruits différents avec lequel on joue
const classNameFlippedCard = 'active';
const gameDuration = Number(3 * 60 * 1000); // Durée de la partie en millisecondes

const timertag = document.querySelector('.timer');
const params = document.querySelector('.params');
const progressBar = document.querySelector('[name=progress]');
const registerScoreForm = document.querySelector('.registerscore');
const errortag = document.querySelector('.error');

// Retourne les minutes et secondes entre deux timestamps
function displayTime(startTime, endTime) {
  const secondsEndTime = Math.floor(endTime / 1000);
  const secondsNow = Math.floor(startTime / 1000);

  const minutes = Math.floor((secondsEndTime - secondsNow) / 60);
  const seconds = Math.floor((secondsEndTime - secondsNow) % 60);
  const timeinseconds = secondsEndTime - secondsNow;

  return [minutes, seconds, timeinseconds];
}

let idTimeout = null;
let idInterval = null;

// mélange de Fisher-Yates pour une permutation aléatoire
function shuffle(array) {
  let m = array.length;
  let t;
  let i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// Client pour requêter vers le backend
function client(endpoint, { data } = {}) {
  const config = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': data ? 'application/json' : undefined,
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  return window.fetch(endpoint, config).then(async (response) => {
    if (response.status >= 400) {
      return Promise.reject(response);
    }

    const data = await response.json();
    if (response.ok) {
      return data;
    }
    return Promise.reject(data);
  });
}

function createEl(tag) {
  return document.createElement(tag);
}

class Game {
  constructor() {
    this.disposition = [];
    this.startTime = null;
    this.endTime = null;
    this.hasFlippedCard = false;
    this.lockCards = false; // Booléen qui empêche la sélection d'autres cartes
    this.firstCard = null;
    this.secondCard = null;
  }

  populatecards = (array) => {
    const fragment = document.createDocumentFragment();
    const propsCard = { className: 'card' };
    array.forEach((element) => {
      const divCard = createEl('div');
      Object.assign(divCard, propsCard);

      const buttonCard = createEl('button');
      buttonCard.dataset.which = element;
      buttonCard.classList.add('cardbutton');
      buttonCard.style.backgroundPositionY = `${element * 100}px`;
      buttonCard.addEventListener('click', this.flipCard);

      divCard.append(buttonCard);
      fragment.append(divCard);
    });

    document.querySelector('.cards').innerHTML = '';
    document.querySelector('.cards').append(fragment);
  };

  cleanTimer = () => {
    idTimeout !== null && clearTimeout(idTimeout);
    idInterval !== null && clearInterval(idInterval);
  };

  newgame = () => {
    this.cleanTimer();

    if (!registerScoreForm.classList.contains('hidden')) {
      registerScoreForm.classList.add('hidden');
    }

    if (params.classList.contains('hidden')) {
      params.classList.remove('hidden');
    }

    // Progression initialisée
    progressBar.setAttribute('value', String('0'));

    // Création d'un tableau avec les 18 fruits possibles de l'image. On mélange celui-ci
    const chosenFruits = [
      ...shuffle(Array.from({ length: availableFruits }).map((e, i) => i)),
    ];

    // On récupère une partie de ce tableau : les fruits avec lesquels on va jouer
    const selectedFruits = chosenFruits.slice(0, numberOfFruitsInGame);

    // On greffe un tableau de paires mélangées. Et on mélange
    this.disposition = shuffle([...selectedFruits, ...selectedFruits]);

    // Affichage des cartes que l'on crée à la volée
    this.populatecards(this.disposition);

    // Mise en place du timer
    this.setUpTimer();
  };
  // Création des cartes

  gameover = () => {
    alert(`Mince. Le temps a joué contre toi. 
     Tu peux faire une autre partie si tu veux.`);
  };

  setUpTimer = () => {
    // Le début de partie est enregistré
    this.startTime = Date.now();

    // Intervalle de temps pour afficher le compte à rebours
    idInterval = setInterval(() => {
      const [minutes, seconds] = displayTime(
        Date.now(),
        this.startTime + gameDuration
      );

      timertag.textContent =
        minutes < 0 ? `Terminé` : `${minutes}m ${seconds}s`;
    }, 200);

    // Si le minuteur expire,
    idTimeout = setTimeout(() => {
      this.lockCards = true; // on bloque toute sélection de carte,
      clearInterval(idInterval); // On arrête le temps 😎
      clearTimeout(idTimeout); // On supprime ce timeout
      this.gameover();
    }, gameDuration);
  };

  // Vérification de la paire de cartes retournée
  checkForMatch = () => {
    const isMatch =
      this.firstCard.dataset.which === this.secondCard.dataset.which;
    isMatch ? this.matchedCards() : this.unflipCards();
    isMatch && this.everythingFlipped();
  };

  flipCard = (card) => {
    if (this.lockCards) return;

    if (card.target === this.firstCard) return;

    card.target.classList.add(classNameFlippedCard);

    if (!this.hasFlippedCard) {
      this.hasFlippedCard = true;
      this.firstCard = card.target;
      return;
    }

    this.secondCard = card.target;
    this.hasFlippedCard = false;

    this.checkForMatch();
  };

  everythingFlipped = () => {
    const isGameOver = progressBar.getAttribute('value') === String(100);
    isGameOver && this.success();
  };

  matchedCards = () => {
    // On supprime les listeners de la paire retrouvée
    this.firstCard.removeEventListener('click', this.flipCard);
    this.secondCard.removeEventListener('click', this.flipCard);

    // Mise à jour de la barre de progression
    const cardsFlipped = Number(document.querySelectorAll('.active').length);
    const totalCards = Number(this.disposition.length);
    const calc = Math.floor((cardsFlipped / totalCards) * 100);
    progressBar.setAttribute('value', String(calc));
  };

  // On retourne les cartes après qu'une paire de cartes non correspondantes ait été révélée
  unflipCards = () => {
    this.lockCards = true;

    const unflipTimeOut = setTimeout(() => {
      this.firstCard.classList.remove(classNameFlippedCard);
      this.secondCard.classList.remove(classNameFlippedCard);
      this.lockCards = false;
      clearTimeout(unflipTimeOut);
    }, 1500);
  };

  // En cas de réussite au jeu
  success = () => {
    this.cleanTimer();
    this.endTime = Date.now();

    const [minutes, secondes, timeinseconds] = displayTime(
      this.startTime,
      this.endTime
    );

    const successtime = document.querySelector('.realisedtime');
    successtime.textContent = `Bravo. Temps de ${minutes}m et ${secondes}s`;

    const time = document.querySelector('[name="time"]');
    time && time.setAttribute('value', String(timeinseconds));
    registerScoreForm.classList.remove('hidden');
  }

}

class Scores {
  constructor() {
    this.databaseLink = false;
  }

  // Récupération des meilleurs scores
  fetchTopScores = async () => {
    try {
      const topScores = await client('http://localhost:3000/savedgames');
      this.databaseLink = false
      return topScores;
    } catch (error) {
      this.databaseLink = true
      throw new Error('Pas de résultats');
    }
  };


  // Génération tableau des meilleurs temps
  displayScores = function (secondsscores) {
    const fragment = document.createDocumentFragment();

    // Création du tableau de scores
    const Scoreboard = createEl('table');
    const Title = Scoreboard.createCaption();
    Title.textContent = 'Meilleurs temps';
    const emoji = createEl('span');
    emoji.setAttribute('role', 'image');
    emoji.setAttribute('aria-label', 'trophée');
    emoji.textContent = ' 🏆 ';
    Title.appendChild(emoji);

    // Création en-têtes
    const trheader = createEl('tr');
    const headers = ['nom', 'temps (en secondes)'];
    headers.forEach((h) => {
      const th = createEl('th');
      th.setAttribute('scope', 'col');
      th.textContent = h;
      trheader.appendChild(th);
    });
    Scoreboard.append(trheader);

    // Création des lignes et cellules
    const tbody = createEl('tbody');
    secondsscores.forEach((element) => {
      const tr = createEl('tr');
      const cellName = createEl('td');
      cellName.textContent = element.gamername;
      tr.appendChild(cellName);
      const cellScore = createEl('td');
      cellScore.textContent = element.donein;
      tr.appendChild(cellScore);
      tbody.appendChild(tr);
    });
    Scoreboard.append(tbody);
    fragment.append(Scoreboard);

    document.querySelector('.cards').innerHTML = '';
    document.querySelector('.cards').append(fragment);
  };
  
  // Appel pour affichage du tableau des scores
  aboutScores = async () => {
    try {
      const results = await this.fetchTopScores();
      this.switchScoreDisplay(false);
      this.displayScores(results);
    } catch (error) {
      this.databaseLink = false;
      this.switchScoreDisplay(true);
    }
  };

  switchScoreDisplay = (state) => {
    if (state) {
      errortag.textContent = 'Scores non disponibles';
    }
    return errortag.textContent = '';
  }

  submitScore = async (ev) => {
    ev.preventDefault();
    registerScoreForm.classList.add('hidden');
    params.classList.add('hidden');
  
    try {
      await client('http://localhost:3000/savegame', {
        data: {
          gamername: ev.target.pseudo.value,
          donein: ev.target.time.value,
        },
      });
      
      this.switchScoreDisplay(false);
      this.aboutScores();
    } catch (error) {
      this.switchScoreDisplay(true);
    }
  }
}





function initGame() {
  const memory = new Game();
  memory.newgame();
}
const scores = new Scores();

document.addEventListener('DOMContentLoaded', () => {
  // Récupération des meilleurs temps au chargement
  scores.aboutScores();

  // Mise en place des listeners
  document.querySelector('button').addEventListener('click', initGame);
  document.querySelector('#submittime').addEventListener('submit', scores.submitScore);
});
