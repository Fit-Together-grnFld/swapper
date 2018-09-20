const express = require('express');
const Sequelize = require('sequelize');
const db = require('../../app/db');

const Op = Sequelize.Op;

const app = express();

app.use(express.json());

const getSeenItems = (userId, itemArray) =>
  db.Transaction.findAll({
    where: {
      [Op.or]: [{
        id_user: userId,
      },
      {
        id_item_desired: {
          [Op.in]: itemArray,
        },
        accepted: true,
      },
      ],
    },
    raw: true,
  })
  .then(items =>
    items.map(({
      id_user: transactionUser,
      id_item_desired: desiredItem,
      id_item_offered: offeredItem,
    }) => {
      if (`${transactionUser}` === userId) {
        return desiredItem;
      }
      return offeredItem;
    }),
  )
  .catch(err =>
    console.error(err));

app.get('/sortedTransactions', (req, res) => {
  console.log('sorted');
  console.log(req.headers);
  const {
    id_user: userId,
    items,
    id_category,

  } = req.headers;
  const itemArray = items.split(',');
  getSeenItems(userId, itemArray, id_category).then((itemIds) => {
    db.Item.findAll({
      where: {
        id: {
          [Op.notIn]: itemIds,
        },
        id_user: {
          [Op.notIn]: [userId],
        },
        id_category: 2,

      },
    })
      .then((item) => {
        res.send(item);
      })
      .catch((err) => {
        console.error(err);
        res.send(500);
      });
  });
});

module.exports = app;
