const express = require('express');
// const Sequelize = require('sequelize');
const db = require('../../app/db');

// const Op = Sequelize.Op;

const app = express();

app.use(express.json());

// const getSeenItems = (userId, itemArray) =>
//   db.Transaction.findAll({
//     where: {
//       [Op.or]: [{
//         id_user: userId,
//       },
//       {
//         id_item_desired: {
//           [Op.in]: itemArray,
//         },
//         accepted: true,
//       },
//       ],
//     },
//     raw: true,
//   })
//   .then(items =>
//     console.log(items),
//     // items.map(({
//     //   id_user: transactionUser,
//     //   id_item_desired: desiredItem,
//     //   id_item_offered: offeredItem,
//     // }) => {
//     //   if (`${transactionUser}` === userId) {
//     //     return desiredItem;
//     //   }
//     //   return offeredItem;
//     // }),
//   )
//   .catch(err =>
//     console.error(err));

app.get('/sorted', (req, res) => {
  console.log('SORTED');
  // const {
    // let user = req.headers.id_user,
    // items,
    // let category = req.headers.id_category

  // } = req.headers;
  console.log(req.headers.id_category);
  console.log(req.headers.id_user);
  // const itemArray = items.split(',');
  // getSeenItems(userId, itemArray, id_category).then((itemIds) => {
  db.Item.findAll({ where: { id_category: req.headers.id_category } })
    // 'SELECT * FROM items WHERE id_category = 2 LIMIT 1')
    .then((items) => {
      // We don't need spread here, since only the results will be returned for select queries
      console.log(items);
      const index = Math.floor(Math.random() * Math.floor(items.length));
      res.send(items[index]);
    });
  // db.Item.find({
  //   where: {
  //     id_user: {
  //       [Op.notIn]: req.headers.id_user,
  //     },
  //     id_category: req.headers.id_category,
  //   },
  // })
  //   .then((item) => {
  //     console.log(item);
  //     res.send(item);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     res.send(500);
  //   });
});

module.exports = app;
