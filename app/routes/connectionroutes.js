var mysql = require('mysql');

const pool = mysql.createPool({
  /*port     : '3000',*/
  host     : '',
  user     : '',
  password : '',
  database : '',
});
module.exports = pool;
