const mongoose = require('mongoose');

require('dotenv').config({ path: '.env' });

const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'memory',
};


// On se connecte à notre base MongoDB
mongoose.connect(process.env.URL_MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// On importe le modèle pour le stockage des temps de jeu.
require('./models/game')

const app = require('./app');
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express est en marche → PORT ${server.address().port}`);
});
