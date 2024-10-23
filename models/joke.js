// models/joke.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Joke = sequelize.define('Joke', {
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reponse: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'jokes'
});

module.exports = { Joke, sequelize };