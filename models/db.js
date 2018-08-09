const setting = require('../setting');
const Db = require('mongodb').Db;
const Connection = require('mongodb').Connection;
const Server = require('mongodb').Server;
module.exports = new Db(setting.db, new Server(setting.host, 27017, {}), { safe: true }); 