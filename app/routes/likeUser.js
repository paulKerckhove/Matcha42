var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');
var async = require('async');
module.exports = function(io){
/*                      /*
         Querys
/*                      */



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


function checkIfBlocked (pool, username, userUrl) {
  return query(pool, 'SELECT blocked, blocker FROM blocked WHERE blocked = ? AND blocker = ?', [[username], [userUrl]])
}


function checkForLikeRows (pool, username, userUrl) {
  return query(pool, 'SELECT * FROM likes where username = ? AND user_dest = ?', [[username], [userUrl]])
}


function checkForBlockRows (pool, username, userUrl) {
  return query(pool, 'SELECT * FROM blocked WHERE blocker = ? AND blocked = ?', [[username], [userUrl]])
}


function InsertUserLike (pool, username, userUrl) {
  return query(pool, 'INSERT INTO likes (username, user_dest)  VALUES (?, ?)', [[username], [userUrl]])
}


function InsertLikeNotif (pool, username, userUrl) {
  return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [userUrl], ["2"]])
}


function InsertUnlikeNotif (pool, username, userUrl) {
  return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [userUrl], ["3"]])
}


function InsertBlock (pool, username, userUrl) {
  return query(pool, 'INSERT INTO blocked (blocker, blocked) VALUES (?, ?)', [[username], [userUrl]])
}


function deleteLike (pool, username, userUrl) {
  return query(pool, 'DELETE FROM likes where username = ? AND user_dest = ?', [[username], [userUrl]])
}


function deletedBlock (pool, username, userUrl) {
  return query(pool, 'DELETE FROM blocked WHERE blocker = ? AND blocked = ?', [[username], [userUrl]])
}


function checkForLikeRows2 (pool, username, userUrl) {
  return query(pool, 'SELECT * FROM likes where username = ? AND user_dest = ?', [[username], [userUrl]])
}


function insertMatch (pool, username, userUrl) {
  return query(pool, 'INSERT INTO matchs (user_1, user_2, id) VALUES (?, ?, ?)', [[username], [userUrl], [Math.random().toString(36).substring(7)]])
}


function InsertMatchNotif (pool, username, userUrl) {
  return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [userUrl], ["4"]])
}


function deletedMatch (pool, username, userUrl) {
  return query(pool, 'DELETE FROM matchs WHERE user_1 = ? AND user_2 = ?', [[username],[userUrl]])
}


function insertPopScoreForLike (pool, userUrl) {
  return query(pool, 'update usersinfo SET popularity = popularity + 5 where username = ?', [userUrl])
}


function checkIfMatch (pool, username, userUrl) {
  return query(pool, 'SELECT id, user_1, user_2 FROM matchs where user_1 = ? AND user_2 = ? OR user_2 = ? AND user_1 = ?', [[username],[userUrl],[username],[userUrl]])
}


function checkIfUserHasAPic (pool, username) {
  return query(pool, 'SELECT * FROM photos WHERE username = ?', [username])
}


function checkForMatch (pool, username, userUrl, matchCheck, matchCheck2) {
  checkForLikeRows(pool, username, userUrl)
  .then(function(rows){
    if (rows.length > 0){
      matchCheck = true;
      checkForLikeRows2(pool, username, userUrl)
      .then(function(rows){
        if (rows.length > 0){
          matchCheck2 = true;
          if (matchCheck === true && matchCheck2 === true){
            weHaveAmatch = true;
            if (weHaveAmatch === true){
              insertMatch(pool, username, userUrl)
              InsertMatchNotif(pool, username, userUrl)
            }
          }
        }
      })
    }
  })
}



/*                      /*
         Functions
/*                      */



router.post('/', function(req, res) {

  username = session.uniqueID;
  var userUrl = req.body.userUrl;
  var likeInserted = false;
  let matchCheck = false;
  let matchCheck2 = false;
  let weHaveAmatch = false;

  checkIfUserHasAPic(pool, username)
  .then(function(rows){
      if (rows.length === 0) {
        return res.send('wrong profile informations')
      } else {
        checkForLikeRows(pool, username, userUrl)
        .then(function(rows){
          if (rows.length === 0) {
            InsertUserLike(pool, username, userUrl)
            .then((rows) => {
              checkForMatch (pool, username, userUrl, matchCheck, matchCheck2)
              checkIfBlocked (pool, username, userUrl)
              .then(function(rows){
                if (rows.length > 0){
                  console.log("cannot send popscore up");
                } else {
                  insertPopScoreForLike(pool, userUrl)
                  likeInserted = true;
                }
              })
            })
            if (likeInserted = true){
              checkIfBlocked (pool, username, userUrl)
              .then (function(rows){
                if (rows.length > 0) {
                  console.log("cannot send like notif");
                } else {
                  InsertLikeNotif(pool, username, userUrl)
                  if (io.clients){
                   io.to(io.clients[userUrl]).emit('like');
                  }
                }
              })
            }
          } else if (rows.length > 0) {
              deleteLike(pool, username, userUrl)
              deletedMatch(pool, username, userUrl)
              checkIfBlocked(pool, username, userUrl)
              .then(function(rows){
                if (rows.length > 0){
                  console.log("cannot insert unlike notif");
                }
              })
              InsertUnlikeNotif(pool, username, userUrl)
              if (io.clients){
               io.to(io.clients[userUrl]).emit('unlike');
              }
          }
        })
      }
  })
})



router.post('/blockUser', function(req, res) {
  username = session.uniqueID;
  var userUrl = req.body.userUrl;
  userBlocked = false

  checkForBlockRows(pool, username, userUrl)
  .then(function(rows){
    if (rows.length === 0){
      InsertBlock(pool, username, userUrl)
      .then((rows) => {
        userBlocked = true;
      })
    } else if (rows.length > 0){
      deletedBlock(pool, username, userUrl)
    }
  })

})


router.post('/chatCheck', function(req, res){
  username = session.uniqueID;
  var userUrl = req.body.userUrl;
  var arr = [];

  checkIfMatch(pool, username, userUrl)
  .then(function(rows){
    if (rows.length > 0){
      matchRows = rows;
        if ((matchRows[0].user_1 === username || matchRows[0].user_1 === userUrl) && (matchRows[0].user_2 === username || matchRows[0].user_2 === userUrl)){
          return res.status(201).send({elem :matchRows});
        } else {
          return res.send('wrong profile informations')
        }
    }
  })
})

return router;
}
