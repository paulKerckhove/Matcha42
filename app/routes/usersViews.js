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



  function checkForLikeRows (pool, username, paramUser) {
    return query(pool, 'SELECT * FROM likes where username = ? AND user_dest = ?', [[username], [paramUser]])
  }


  function insertViewCount (pool, username, paramUser) {
    return query(pool, 'INSERT INTO notifications (user, user_dest, id_notif) VALUES (?, ?, ?)', [[username], [paramUser], ["5"]])
  }


  function checkIfIblockedThisUser (pool, username, paramUser) {
    return query(pool, 'SELECT * FROM blocked WHERE blocker = ? AND blocked = ?', [[username], [paramUser]])
  }


  function getUserTagsForProfilePage (pool, paramUser) {
    return query(pool, 'SELECT tag_id FROM user_tags WHERE username = ?', [paramUser])
  }


  function getUserTagsForProfilePage2 (pool) {
    return query(pool, 'SELECT id, tags FROM tags')
  }


  function getUserPictureForProfilePage (pool, paramUser) {
    return query(pool, 'SELECT new_path FROM photos WHERE username = ?', [paramUser])
  }


  function checkIfUserHasAPic (pool, username) {
    return query(pool, 'SELECT * FROM photos WHERE username = ?', [username])
  }


  function getUsersInfosData (pool) {
    return query(pool, 'SELECT usersinfo.username, usersinfo.sex, usersinfo.age, usersinfo.orientation, usersinfo.bio, usersinfo.popularity, userlocation.city FROM usersinfo, userlocation WHERE usersinfo.username = userlocation.username GROUP BY username')
  }

  function insertPopScoreForVisit (pool, paramUser) {
    return query(pool, 'update usersinfo SET popularity = popularity + 1 where username = ?', [paramUser])
  }

  function getAllUsernamesFromDbToemmitNotif (pool) {
    return query(pool, 'SELECT username FROM usersmain')
  }


  function checkIfBlocked (pool, username, paramUser) {
    return query(pool, 'SELECT blocked, blocker FROM blocked WHERE blocked = ? AND blocker = ?', [[username], [paramUser]])
  }




  /*                      /*
           Functions
  /*                      */



  function gatherUsersData (pool, username, paramUser) {
    var tabOfUsers = [];
    var tagId = [];
    var tagString = [];
    var tabOfUsersPlusTabOfPictures = [];

    return getUsersInfosData(pool)
        .then((rows) => {
          tabOfUsers = rows;
          //console.log(tabOfUsers);
          if (tabOfUsers) {
            return getUserPictureForProfilePage(pool, paramUser)
          }
        })
        .then((rows) => {
          tabOfPicturePath = rows;
          //console.log(tabOfPicturePath);
          if (tabOfUsers && tabOfPicturePath) {
            return getUserTagsForProfilePage(pool, paramUser)
          }

        })
        .then((rows) => {
          tagId = rows;
          //console.log(tagId);
          if (tagId) {
            Array.prototype.push.apply(tabOfPicturePath, tagId);
            return getUserTagsForProfilePage2(pool)
          }
        })
        .then((rows) => {
          tagString = rows;
          Array.prototype.push.apply(tabOfPicturePath, tagString);
          return ({pictures: tabOfPicturePath, users: tabOfUsers})

        })

  }



  router.get('/:username', function(req, res) {
    const username = session.uniqueID
    const paramUser = req.params.username;
    var tabOfUsers = [];
    var tabOfTagsFromUsers = [];
    var tabOfPicturePath = [];
    let like = [];
    let likeStatus = false;
    let noPictureCheck = false;
    let noPicture;
    if (req.params.username === username){
      return res.send('You cannot get acces to your own profile page,  <a href="/profile"> click here </a>')
    }


    checkForLikeRows(pool, username, paramUser)
    .then(function(rows){
      if (rows.length > 0){
        like = rows;
        likeStatus = true;
      }
    })
    checkIfUserHasAPic(pool, username)
    .then(function(rows){
        return noPicture = rows.length === 0;
    })


    gatherUsersData(pool, session.uniqueID, paramUser)
          .then((data) => {
            for (var i = 0; i < data.users.length; i++) {
              if (req.params.username === data.users[i].username) {
                if (likeStatus = true){
                  checkIfBlocked (pool, username, paramUser)
                  .then(function(rows){
                    if (rows.length > 0){
                      console.log("cannot send view notif");
                    } else {
                      insertViewCount(pool, username, paramUser)
                      insertPopScoreForVisit(pool, paramUser)
                    }
                  })
                  if (io.clients){
                    checkIfBlocked (pool, username, paramUser)
                    .then(function(rows){
                      if (rows.length > 0) {
                        if (rows[0].blocked === username && rows[0].blocker == paramUser) {
                          console.log("cannot send notif");
                        }
                      } else {
                        io.to(io.clients[paramUser]).emit('notification');
                      }
                    })

                  }
                  return (res.render('user.pug', {tabData :data.users[i], picturesData :data.pictures, paramUser :paramUser, like :like, noPicture :noPicture, username :username}))
                }
              }
            }
            //return res.send('nope');
          })
          .catch((err) => {
            // console.log(err);
          })
  });
return router;
}
