var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');
var async = require('async');
module.exports = function(io){

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


  function checkIfMatch (pool, username) {
    return query(pool, 'SELECT id, user_1, user_2 FROM matchs where user_1 = ? OR user_2 = ?', [[username],[username]])
  }


  function getBothUser(pool, getUrl) {
    return query(pool, 'SELECT user_1, user_2 FROM matchs WHERE id = ?', [getUrl])
  }


  function InsertChatNotif1(pool, username, user_2) {
    return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [user_2], ["6"]])
  }

  function InsertChatNotif2(pool, username, user_2){
    return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [user_2], ["6"]])
  }


  function insertChatMessageinDb1(pool, username, msg, user_2) {
    return query(pool, 'INSERT INTO chat (user_1, content, user_2) VALUES (?, ?, ?)', [[username], [msg], [user_2]])
  }


  function insertChatMessageinDb2(pool, username, msg, user_2) {
    return query(pool, 'INSERT INTO chat (user_1, content, user_2) VALUES (?, ?, ?)', [[username], [msg], [user_2]])
}


  function getMessages (pool, user_1, user_2) {
    return query(pool, 'SELECT * from chat WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)', [[user_1], [user_2], [user_2], [user_1]])
  }



  var getUrl = [];

router.get('/:id', function(req, res) {
  let username = session.uniqueID;
    getUrl = (req.url).replace('/','')
    username = session.uniqueID;
    getBothUser(pool, getUrl)
    .then(function(rows){
      if (rows.length > 0){
        var user_1 = rows[0].user_1;
        var user_2 = rows[0].user_2;
        getMessages(pool, user_1, user_2)
        .then(function(rows){
            //console.log(rows);
            return res.render('chatting.pug', {username, rows: rows});
        })
      }
    })
  });



router.post('/chatMsg', function(req, res){
  let username = session.uniqueID;
  let msg = req.body.msg;

  getBothUser(pool, getUrl)
  .then(function(rows){
    if (rows.length > 0){
      //console.log(rows[0]);
      if (rows[0].user_1 === username){
        var user_2 = rows[0].user_2
        insertChatMessageinDb1(pool, username, msg, user_2)
        InsertChatNotif1(pool, username, user_2)
        if (io.clients[rows[0].user_2] || io.clients[rows[0].user_1]){
          io.to(io.clients[rows[0].user_2]).emit('message', {msg :msg, curr:username});
          io.to(io.clients[username]).emit('message', {msg :msg, curr:username});
          return res.send("ok")
        }
      } else if (rows[0].user_2 === username){
        var user_2 = rows[0].user_1
        insertChatMessageinDb2(pool, username, msg, user_2)
        InsertChatNotif2(pool, username, user_2)
        if (io.clients[rows[0].user_1] || io.clients[rows[0].user_2]){
          io.to(io.clients[rows[0].user_1]).emit('message', {msg :msg, curr:username});
          io.to(io.clients[username]).emit('message', {msg :msg, curr:username});
          return res.send("ok")
        }
      }
    }
  })






})





  return router;
  }
