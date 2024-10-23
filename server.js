// server.js
const express = require('express');
const { Joke, sequelize } = require('./models/joke');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const PORT = 3000;

app.use(express.json()); // Pour permettre le parsing du JSON dans les requêtes POST

// Options pour Swagger JSDoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blague API',
      version: '1.0.0',
      description: 'API pour gérer des blagues',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.js'], // Fichier où Swagger va chercher la documentation
};

// Initialisation de Swagger JSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Fonction pour insérer des blagues préremplies
const prepopulateJokes = async () => {
  const jokes = [
    { question: "Quelle est la femelle du hamster ?", reponse: "L’Amsterdam" },
    { question: "Que dit un oignon quand il se cogne ?", reponse: "Aïe" },
    { question: "Quel est l'animal le plus heureux ?", reponse: "Le hibou, parce que sa femme est chouette." },
    { question: "Pourquoi le football c'est rigolo ?", reponse: "Parce que Thierry en rit" },
    { question: "Quel est le sport le plus fruité ?", reponse: "La boxe, parce que tu te prends des pêches dans la poire et tu tombes dans les pommes." },
    { question: "Que se fait un Schtroumpf quand il tombe ?", reponse: "Un Bleu" },
    { question: "Quel est le comble pour un marin ?", reponse: "Avoir le nez qui coule" },
    { question: "Qu'est ce que les enfants usent le plus à l'école ?", reponse: "Le professeur" },
    { question: "Quel est le sport le plus silencieux ?", reponse: "Le para-chuuuut" },
    { question: "Quel est le comble pour un joueur de bowling ?", reponse: "C’est de perdre la boule" }
  ];

  for (let joke of jokes) {
    const existingJoke = await Joke.findOne({ where: { question: joke.question } });
    if (!existingJoke) {
      await Joke.create(joke);
    }
  }
};

// Synchronisation de la base de données et préremplissage des blagues
sequelize.sync().then(async () => {
  console.log('Base de données synchronisée');
  await prepopulateJokes();
  console.log('Blagues préremplies ajoutées');
});

// Endpoint pour ajouter une blague (POST /v1/blagues)
/**
 * @swagger
 * /v1/blagues:
 *   post:
 *     summary: Ajouter une nouvelle blague
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               reponse:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blague créée
 *       500:
 *         description: Erreur serveur
 */
app.post('/v1/blagues', async (req, res) => {
  const { question, reponse } = req.body;
  try {
    const newJoke = await Joke.create({ question, reponse });
    res.status(201).json(newJoke);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la blague', error });
  }
});

// Endpoint pour consulter toutes les blagues (GET /v1/blagues)
/**
 * @swagger
 * /v1/blagues:
 *   get:
 *     summary: Récupérer toutes les blagues
 *     responses:
 *       200:
 *         description: Liste des blagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   question:
 *                     type: string
 *                   reponse:
 *                     type: string
 */
app.get('/v1/blagues', async (req, res) => {
  try {
    const jokes = await Joke.findAll();
    res.json(jokes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des blagues', error });
  }
});

// Endpoint pour consulter une blague par ID (GET /v1/blagues/:id)
/**
 * @swagger
 * /v1/blagues/{id}:
 *   get:
 *     summary: Récupérer une blague par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la blague
 *     responses:
 *       200:
 *         description: Une blague
 *       404:
 *         description: Blague non trouvée
 */
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
/**
 * @swagger
 * /v1/blagues/random:
 *   get:
 *     summary: Récupérer une blague aléatoire
 *     responses:
 *       200:
 *         description: Une blague aléatoire
 */
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
