// server.js
const express = require('express');
const { Joke, sequelize } = require('./models/joke');
const app = express();
const PORT = 3000;

app.use(express.json()); // Pour permettre le parsing du JSON dans les requêtes POST

// Synchronisation de la base de données
sequelize.sync().then(() => {
  console.log('Base de données synchronisée');
});

// Endpoint pour ajouter une blague (POST /v1/blagues)
app.post('/v1/blagues', async (req, res) => {
  const { text } = req.body;
  try {
    const newJoke = await Joke.create({ text });
    res.status(201).json(newJoke);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la blague', error });
  }
});

// Endpoint pour consulter toutes les blagues (GET /v1/blagues)
app.get('/v1/blagues', async (req, res) => {
  try {
    const jokes = await Joke.findAll();
    res.json(jokes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des blagues', error });
  }
});

// Endpoint pour consulter une blague par ID (GET /v1/blagues/:id)
app.get('/v1/blagues/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const joke = await Joke.findByPk(id);
    if (joke) {
      res.json(joke);
    } else {
      res.status(404).json({ message: 'Blague non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la blague', error });
  }
});

// Endpoint pour consulter une blague aléatoire (GET /v1/blagues/random)
app.get('/v1/blagues/random', async (req, res) => {
  try {
    const count = await Joke.count();
    const randomIndex = Math.floor(Math.random() * count);
    const randomJoke = await Joke.findOne({ offset: randomIndex });
    res.json(randomJoke);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la blague aléatoire', error });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
