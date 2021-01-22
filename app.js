const express = require('express');
const createError = require('http-errors');
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path');
const logger = require('morgan');
const errorHandlers = require('./helpers/errorHandlers');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const mongoose = require('mongoose')
// Modèles base de données 
const {Playedgames} = require('./models/playedgames')



mongoose.connect('mongodb://mongodb:27017/playedgames', {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to mongo')
  })
  .catch(() => {
    console.error('NOT connected to mongo')
  })

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'itssevenoclock',
  resave: false,
  saveUninitialized: false
}))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
})


// Transforme en de belles propriétés utilisables le JSON reçu.
app.use(bodyParser.json());


app.get('/savegame', (req, res, next) => {

  const niceGame = req.body
  const playedgamesmodel = new Playedgames({
    ...niceGame
  })

  playedgamesmodel.save()
    .then(() => res.status(201).json({message: 'Jeu enregistré'}))
    .catch(() => res.status(400).json({ error}))

})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
