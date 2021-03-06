const express = require('express');
// const Sequelize = require('sequelize');
const db = require('../../app/db');

const app = express();
// const Op = Sequelize.Op;

app.use(express.json());

app.get('/categories', (req, res) => {
  db.Category
    .findAll({})
    .then((categories) => {
      // console.log(categories);
      res.send(categories);
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = app;
