// @ts-check

/* 
   La configuration du jeu est faite dans ces premières constantes

   - Le nombre de fruits correspondant à l'image
   - Le nombre de fruits avec lequel on va jouer
   - la classe des cartes lorsqu'elle est retournée
   - la durée du jeu
*/

const availableFruits = Number(18); // Nombre d'images de fruits disponibles dans le .png avec un pas de 100px
const numberOfFruitsInGame = Number(15); // nombre de fruits différents avec lequel on joue
const classNameFlippedCard = 'active';
const gameDuration = Number(3 * 60 * 1000); // Durée de la partie en millisecondes

const timertag = document.querySelector('.timer');
const params = document.querySelector('.params');
const progressBar = document.querySelector('[name=progress]');
const registerScoreForm = document.querySelector('.registerscore');

const currentgame = {
  disposition: [],
  startTime: null,
  endTime: null,
};

let lockCards = false; // Booléen qui empêche la sélection d'autres cartes

let idTimeout = null;
let idInterval = null;

// Nettoyage du timer
function cleanTimer() {
  idTimeout !== null && clearTimeout(idTimeout);
  idInterval !== null && clearInterval(idInterval);
}

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

function gameover() {
  alert(`Mince. Le temps a joué contre toi. 
   Tu peux faire une autre partie si tu veux.`);
}

function setUpTimer() {
  // Le début de partie est enregistré
  currentgame.startTime = Date.now();

  // Intervalle de temps pour afficher le compte à rebours
  idInterval = setInterval(() => {
    const [minutes, seconds] = displayTime(
      Date.now(),
      currentgame.startTime + gameDuration
    );
    if (minutes < 0) {
      timertag.textContent = `Terminé`;
    } else {
      timertag.textContent = `${minutes}m ${seconds}s`;
    }
  }, 200);

  // Si le minuteur expire,
  idTimeout = setTimeout(() => {
    lockCards = true; // on bloque toute sélection de cartes,
    clearInterval(idInterval); // On arrête le temps 😎
    clearTimeout(idTimeout); // On supprime ce timeout
    gameover();
  }, gameDuration);
}

// Création des cartes
function populateCards(array) {
  const fragment = document.createDocumentFragment();
  const propsCard = { className: 'card' };
  array.forEach((element, index) => {
    const divCard = document.createElement('div');
    Object.assign(divCard, propsCard);

    const buttonCard = document.createElement('button');
    buttonCard.dataset.which = element;
    buttonCard.classList.add('cardbutton');
    buttonCard.style.backgroundPositionY = `${element * 100}px`;
    buttonCard.addEventListener('click', flipCard);

    divCard.append(buttonCard);
    fragment.append(divCard);
  });

  document.querySelector('.cards').innerHTML = '';
  document.querySelector('.cards').append(fragment);
}

// Génération tableau des meilleurs temps
function displayScores(scores) {
  const fragment = document.createDocumentFragment();

  // Création du tableau de scores
  const Scoreboard = document.createElement('table');
  const Title = Scoreboard.createCaption();
  Title.textContent = 'Meilleurs temps';
  const emoji = document.createElement('span');
  emoji.setAttribute('role', 'image');
  emoji.setAttribute('aria-label', 'trophée');
  emoji.textContent = ' 🏆 ';
  Title.appendChild(emoji);

  // Création en-têtes
  const trheader = document.createElement('tr');
  const headers = ['nom', 'temps (en secondes)'];
  headers.forEach((h) => {
    const th = document.createElement('th');
    th.setAttribute('scope', 'col');
    th.textContent = h;
    trheader.appendChild(th);
  });
  Scoreboard.append(trheader);

  // Création des lignes et cellules
  const tbody = document.createElement('tbody');
  scores.forEach((element) => {
    const tr = document.createElement('tr');
    const cellName = document.createElement('td');
    cellName.textContent = element.gamername;
    tr.appendChild(cellName);
    const cellScore = document.createElement('td');
    cellScore.textContent = element.donein;
    tr.appendChild(cellScore);
    tbody.appendChild(tr);
  });
  Scoreboard.append(tbody);

  fragment.append(Scoreboard);

  document.querySelector('.cards').innerHTML = '';
  document.querySelector('.cards').append(fragment);
}

// Récupération des meilleurs scores
async function fetchTopScores() {
  try {
    const topScores = await client('http://localhost:3000/savedgames');
    return topScores;
  } catch (error) {
    console.error(error);
  }
}

async function newGame() {
  lockCards = false;
  cleanTimer();

  if (!registerScoreForm.classList.contains('hidden')) {
    registerScoreForm.classList.add('hidden');
  }

  if (params.classList.contains('hidden')) {
    params.classList.remove('hidden');
  }

  // Progression paramétrée à zéro
  progressBar.setAttribute('value', String('0'));

  currentgame.startTime = null;
  currentgame.endTime = null;

  // Création d'un tableau avec les 18 fruits possibles de l'image. On mélange celui-ci
  const chosenFruits = [
    ...shuffle(Array.from({ length: availableFruits }).map((e, i) => i)),
  ];

  // On récupère une partie de ce tableau : les fruits avec lesquels on va jouer
  const selectedFruits = chosenFruits.slice(0, numberOfFruitsInGame);

  // On greffe un tableau de paires mélangées. Et on mélange
  currentgame.disposition = shuffle([...selectedFruits, ...selectedFruits]);

  // Affichage des cartes que l'on crée à la volée
  populateCards(currentgame.disposition);

  // Mise en place du timer
  setUpTimer();
}

// Appel pour affichage du tableau des scores
async function aboutScores() {
  const scores = await fetchTopScores();
  displayScores(scores);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Récupération des meilleurs temps au chargement
  aboutScores();

  // Mise en place des listeners
  document.querySelector('button').addEventListener('click', newGame);
  document.querySelector('#submittime').addEventListener('submit', submitScore);
});

// Enregistrement du temps en appelant l'adresse du backend correspondante
async function submitScore(ev) {
  ev.preventDefault();

  try {
    await client('http://localhost:3000/savegame', {
      data: {
        gamername: ev.target.pseudo.value,
        donein: ev.target.time.value,
      },
    });
    registerScoreForm.classList.add('hidden');
    params.classList.add('hidden');

    aboutScores();
  } catch (error) {
    console.error(error);
  }
}

function registerScore() {
  const [minutes, secondes, timeinseconds] = displayTime(
    currentgame.startTime,
    currentgame.endTime
  );

  const successtime = document.querySelector('.realisedtime');
  successtime.textContent = `Bravo. Temps de ${minutes}m et ${secondes}s`;

  const time = document.querySelector('[name="time"]');
  time.setAttribute('value', String(timeinseconds));
  registerScoreForm.classList.remove('hidden');
}

// En cas de réussite au jeu
function success() {
  cleanTimer();
  currentgame.endTime = Date.now();
  registerScore();
}

/*  memory */

let hasFlippedCard = false;

let firstCard;
let secondCard;
function checkForMatch() {
  const isMatch = firstCard.dataset.which === secondCard.dataset.which;
  isMatch ? matchedCards() : unflipCards();
  isMatch && everythingFlipped();
}

function flipCard(card) {
  if (lockCards) return;

  if (card.target === firstCard) return;

  card.target.classList.add(classNameFlippedCard);

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = card.target;
    return;
  }

  secondCard = card.target;
  hasFlippedCard = false;

  checkForMatch();
}

function everythingFlipped() {
  const isGameOver = progressBar.getAttribute('value') === String(100);
  isGameOver && success();
}

function matchedCards() {
  // On supprime les listeners de la paire retrouvée
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  // Mise à jour de la barre de progression
  const cardsFlipped = Number(document.querySelectorAll('.active').length);
  const totalCards = Number(currentgame.disposition.length);
  const calc = Math.floor((cardsFlipped / totalCards) * 100);
  progressBar.setAttribute('value', String(calc));
}

// On retourne les cartes après qu'une paire de cartes non correspondantes ait été révélée
function unflipCards() {
  lockCards = true;

  const unflipTimeOut = setTimeout(() => {
    firstCard.classList.remove(classNameFlippedCard);
    secondCard.classList.remove(classNameFlippedCard);
    lockCards = false;
    clearTimeout(unflipTimeOut);
  }, 1500);
}

// Retourne les minutes et secondes entre deux timestamps
function displayTime(startTime, endTime) {
  const secondsEndTime = Math.floor(endTime / 1000);
  const secondsNow = Math.floor(startTime / 1000);

  const minutes = Math.floor((secondsEndTime - secondsNow) / 60);
  const seconds = Math.floor((secondsEndTime - secondsNow) % 60);
  const timeinseconds = secondsEndTime - secondsNow;

  return [minutes, seconds, timeinseconds];
}
