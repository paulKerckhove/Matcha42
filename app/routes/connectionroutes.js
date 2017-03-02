var mysql = require('mysql');

const pool = mysql.createPool({
  /*port     : '3000',*/
  host     : 'mysql-pkerckho.alwaysdata.net',
  user     : 'pkerckho',
  password : 'password',
  database : 'pkerckho_matcha',
  /*socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',*/
});
module.exports = pool;
