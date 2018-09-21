const express = require('express');
// const Sequelize = require('sequelize');
const db = require('../../app/db');

// const Op = Sequelize.Op;

const app = express();

app.use(express.json());

app.get('/sorted', (req, res) => {
  db.Item.findAll({ where: { id_category: req.headers.id_category } })
    .then((items) => {
      const index = Math.floor(Math.random() * Math.floor(items.length));
      res.send(items[index]);
    });
});

module.exports = app;
