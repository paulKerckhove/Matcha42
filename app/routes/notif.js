var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');



/*                  /*
        Querys
/*                  */


function query (pool, sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      var query = sql
      connection.query(query, values, (err, rows) => {
        connection.release()
        err ? reject(err) : resolve(rows)
      })
    })
  })
}


function checkForUserNotif (pool, username) {
  return query(pool, 'SELECT user, id_notif, user_dest FROM notifications where user_dest = ?', [username])
}

function getNotificationType (pool) {
  return query(pool, 'SELECT *')
}


router.get('/', function(req, res){
  let username = session.uniqueID;
  let notif = [];
  var notifAlert = false;

  checkForUserNotif(pool, username)
  .then(function(rows){
    if (rows.length > 0){
      notif = rows;
      notifAlert = true;
    }
    if (notifAlert === true){
      res.render('notif.pug', {notif :notif});
    } else {
      res.send('No notif for you');
    }
  })


})


module.exports = router;
