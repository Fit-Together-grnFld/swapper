const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

const db = {};
const pg = require('pg');

// pg.defaults.ssl = true;
// or native libpq bindings
// var pg = require('pg').native

const conString = 'postgres://mxbfexak:YOdLlZgvIGnvALU8ougiJ6AjDDkSNMFZ@pellefant.db.elephantsql.com:5432/mxbfexak';
const client = new pg.Client(conString);
client.connect((err) => {
  if (err) {
    return console.error('could not connect to postgres', err);
  }
  // client.query('SELECT NOW() AS "theTime"', (err, result) => {
  //   if (err) {
  //     return console.error('error running query', err);
  //   }
  // console.log('client open');
  client.end();
  // console.log('client closed');
  return 0;
});
// let sequelize;

// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable]);
// } else {
const sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

fs
  .readdirSync(path.join(__dirname, 'models'))
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, 'models', file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.authenticate().then(() => {
  console.log('Success!');
}).catch((err) => {
  console.error(err);
});

module.exports = db;
