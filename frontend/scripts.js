// @ts-check

{

  /* 
   La configuration du jeu est faite dans ces premières constantes

   - Le nombre de fruits correspondant à l'image
   - Le nombre de fruits avec lequel on va jouer
   - la classe des cartes lorsqu'elle est retournée
   - la durée du jeu
  */



const availableFruits = 18 // Nombre d'images de fruits disponibles dans le .png avec un pas de 100px
const numberOfFruitsInGame = 3 // nombre de fruits différents avec lequel on joue
const classNameFlippedCard = 'active'
const gameDuration = 1 * 60 * 1000 // millisecondes demandées

let lockCards = false; // Booléen qui empêche de sélectionner d'autres cartes
let idTimeout = null
let idInterval = null

const timertag = document.querySelector('.timer')
const progressBar = document.querySelector('[name=progress]')
document.querySelector('button').addEventListener('click', newGame)

let currentgame = {
  disposition: [],
  startTime: null,
  endTime: null,
}

function setUpTimer() {

  // Le début de partie est enregistré
  currentgame.startTime = Date.now()
  
  // échéance de la partie
  const endOfTimer = currentgame.startTime + gameDuration
  
  // Intervalle de temps qui affiche le temps restant
  idInterval = setInterval(() => {
    const [minutes, seconds] = displayTime(Date.now(), endOfTimer)
    timertag.textContent = `${minutes}m ${seconds}s`
  }, 1000);

  
  // Si le minuteur expire, effectuer les actions dans ce bloc
  idTimeout = setTimeout(() => {
    
    lockCards = true
    clearInterval(idInterval) // On arrête le temps 😎
    clearTimeout(idTimeout) // On supprime ce timeout
    gameover()

  }, gameDuration);

}


// Retourne les minutes et secondes entre deux timestamps
function displayTime(startTime, endTime) {
  
  const secondsEndTime = Math.floor(endTime / 1000)
  const secondsNow = Math.floor(startTime / 1000)
  
  const minutes = Math.floor((secondsEndTime - secondsNow) / 60)
  const seconds = Math.floor((secondsEndTime - secondsNow) % 60)

  const timeinseconds = secondsEndTime - secondsNow

  return [minutes, seconds, timeinseconds]
}

async function fetchTopScores() {

  const loadTopScores = await client('http://localhost:3000/savedgames')
  console.log(loadTopScores)

}
fetchTopScores()

async function newGame() {


  lockCards = false
  cleanTimer()

  currentgame = {...currentgame, disposition: [], startTime: null, endTime: null}
  
  
  // Création d'un tableau avec les 18 fruits possibles de l'image. On mélange celui-ci
  const chosenFruits = [...shuffle(Array.from({length: availableFruits}).map((e, i) => i))]
  
  // On récupère une partie de ce tableau : les fruits avec lesquels on va jouer
  const selectedFruits = chosenFruits.slice(0, numberOfFruitsInGame)
  
  // On greffe un tableau de paires mélangées. Et on mélange
  currentgame.disposition = shuffle([...selectedFruits, ...selectedFruits])
  
  
  // Affichage des cartes que l'on crée à la volée 
  populateCards(currentgame.disposition)
  
  // Mise en place du timer
  setUpTimer()

}


function success() {
  cleanTimer()
  currentgame.endTime = Date.now()
  registerScore()
}

function cleanTimer() {
  idTimeout !== null && clearTimeout(idTimeout)
  idInterval !== null && clearInterval(idInterval)
}

function gameover() {

  alert(`Mince. Le temps a joué contre toi. 
  Tu peux faire une autre partie si tu veux.`)
  
}

function registerScore() {
  
  const [minutes, secondes, timeinseconds] = displayTime(currentgame.startTime, currentgame.endTime)

  const successtime = document.querySelector('.realisedtime')
  successtime.textContent = `Bravo. Temps de ${minutes}m et ${secondes}s`
  
  const form = document.querySelector('.hidden')
  const time = document.querySelector('[name="time"]')
  time.setAttribute('value', String(timeinseconds))
  form.classList.remove('hidden')
  document.querySelector('#submittime').addEventListener('submit', submitScore)

}

async function submitScore(ev) {
  ev.preventDefault()

  const reponse = await client('http://localhost:3000/savegame', {data: {
    gamername: ev.target.pseudo.value,
    donein: ev.target.time.value,
  }})
  

  console.log(reponse)
}





let hasFlippedCard = false;

  let firstCard, secondCard;

function flipCard(card) {
  if (lockCards) return;

  if (card.target === firstCard) return

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
  
function checkForMatch() {
  let isMatch = firstCard.dataset.which === secondCard.dataset.which;
  isMatch ? matchedCards() : unflipCards();
  isMatch ? everythingFlipped() : null 
}

function everythingFlipped() {
  const isGameOver = (progressBar).getAttribute('value') === String(100)
  isGameOver ? success() : null
}

  
function matchedCards() {
  // On supprime les listeners de la paire retrouvée
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  // Mise à jour de la barre de progression
  const cardsFlipped = Number(document.querySelectorAll('.active').length)
  const totalCards = Number(currentgame.disposition.length)
  const calc = Math.floor(cardsFlipped / totalCards * 100);
  progressBar.setAttribute('value', String(calc))
}
  
  function unflipCards() {
    lockCards = true;

    const unflipTimeOut = setTimeout(() => {
      firstCard.classList.remove(classNameFlippedCard);
      secondCard.classList.remove(classNameFlippedCard);
      lockCards = false;
      clearTimeout(unflipTimeOut)
    }, 1500);
  }




// mélange de Fisher-Yates pour une permutation aléatoire
function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array
}

function populateCards(array) {
  let fragment = document.createDocumentFragment();
  const propsCard = {className: 'card'}
  array.forEach(element => {
    
    const divCard = document.createElement('div')
    Object.assign(divCard, propsCard)
    
    const buttonCard = document.createElement('button')
    buttonCard.dataset.which = element
    buttonCard.classList.add('cardbutton')
    buttonCard.style.backgroundPositionY = `${element * 100 }px`

    buttonCard.addEventListener('click', flipCard)

    divCard.append(buttonCard)
    fragment.append(divCard)
   
    
  })
  
  document.querySelector('.cards').innerHTML = ''
  document.querySelector('.cards').append(fragment)
}


function client(endpoint, { data } = {}) {
  const config = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': data ? 'application/json' : undefined, 
    },
    body: data ? JSON.stringify(data) : undefined,
  }

  return window.fetch(endpoint, config).then(async response => {
    
    if (response.status >= 400) {
      return Promise.reject(response)
    }
    
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}


}